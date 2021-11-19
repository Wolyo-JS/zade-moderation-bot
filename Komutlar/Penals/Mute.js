const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const penalPoints = require("../../Schemas/Cezapuan.js");
const others = require("../../Ayarlar/Others.json");
const Guild = require("../../Schemas/Guild.js");
const muteLimit = new Map();

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Chat_Mute.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");  

  let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
  if(!victim) return client.reply(message, `Birisini susturmak istiyorsan önce onu etiketlemelisin.\n\n**Doğru kullanım:** \`${this.conf.usage}\``);
  if (global.Perm.Chat_Mute.Cmute_Limit > 0 && muteLimit.has(message.author.id) && muteLimit.get(message.author.id) == global.Perm.Chat_Mute.Cmute_Limit) return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setTimestamp().setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));
  let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: victim.id });

  let reason = args.splice(2).join(" ");
  if(!reason) return message.reply("bir sebep belirtmelisin.");
  if (reason && (await client.chatKoruma(reason))) return message.reply('Reasona da küfür-reklam atmazsın adi')
  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");

  if(victim && victim.roles) {
    if(victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "Etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
    victim.roles.add(global.Perm.Chat_Mute.Role).catch();
  }
  
  if (global.Perm.Chat_Mute.Cmute_Limit > 0) {
    if (!muteLimit.has(message.author.id)) muteLimit.set(message.author.id, 1);
    else muteLimit.set(message.author.id, muteLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (muteLimit.has(message.author.id)) muteLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }

  if (!pData) {
    let pointData = new penalPoints({ guildID: message.guild.id, userID: victim.id, point: 15 });
    pointData.save();
} else {
    pData.point = pData.point + 15;
    pData.save();
}

  Penal.model.countDocuments().then(number => {
    let inc = number + 1, currentDate = Date.now();
    new Penal.model({
      Id: inc,
      Type: "MUTE",
      User: victim.id,
      Admin: message.author.id,
      Reason: reason,
      Date: currentDate,
    }).save();
    
    global.updateUser(message.author.id, "ChatMute", 1);
        
    message.react(Others.Emojis.Check_Tick); 
    let embed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setDescription(`${message.author}, ${victim} kişisini **"${reason}"** sebebi ile **kalıcı** olarak **susturdu**.`)
        .addField("Ceza Bilgisi", `**Ceza Numarası:** \`#${inc}\`\n**Ceza Tipi:** \`Kalıcı Susturma\`\n**Tarih:** ${require("moment")(Date.now()).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`)
        .setColor(others.Colors.negative);
    let channel = message.guild.channels.cache.get(global.Perm.Chat_Mute.Log);
    if(channel) client.send(channel, embed);
    
    client.send(message.channel, `${Others.Emojis.Off_Chat} ${victim}, kişisi **"${reason}"** sebebi ile **kalıcı** olarak susturuldu. (Ceza Numarası: \`#${inc}\`)`)
    client.channels.cache.get(global.Perm.Defaults.CpuanLog).send(`${victim}: aldığınız **#${inc}** ID'li ceza ile **${pData.point ?? 0}** ceza puanına ulaştınız.`).catch(e => { })
    if(victim && victim.roles) victim.send(`${victim}, ${message.author} tarafından **${message.guild.name}** sunucusunda **"${reason}"** sebebi ile kalıcı olarak susturuldun. (Ceza Numarası: \`#${inc}\`)`).catch(() => {});
  }).catch();
};

exports.conf = {
    commands: ["kalıcımute","sınırsızmute","sınırsızcmute"],
    enabled: true,
    usage: "kalıcımute @üye sebep",
};