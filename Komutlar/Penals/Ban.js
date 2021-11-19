const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");
const others = require("../../Ayarlar/Others.json");
const penalPoints = require("../../Schemas/Cezapuan.js");
const banLimit = new Map();

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Ban.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");  
  let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
  if(!victim) return client.reply(message, `birisini cezalandırmak istiyorsan önce onu etiketlemelisin.\n\n**Doğru kullanım:** \`${this.conf.usage}\``);
  if (global.Perm.Ban.Ban_Limit > 0 && banLimit.has(message.author.id) && banLimit.get(message.author.id) == global.Perm.Ban.Ban_Limit) return message.channel.send(new Discord.MessageEmbed().setTimestamp().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));

  let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: victim.id });

  let reason = args.splice(2).join(" ");
  if(!reason) return message.reply("bir sebep belirtmelisin.");
  if (reason && (await client.chatKoruma(reason))) return message.reply('Reasona da küfür-reklam atmazsın adi')
  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");

 
  if(victim.roles && victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "Etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");


  if (global.Perm.Ban.Ban_Limit > 0) {
    if (!banLimit.has(message.author.id)) banLimit.set(message.author.id, 1);
    else banLimit.set(message.author.id, banLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (banLimit.has(message.author.id)) banLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }


  if (!pData) {
    let pointData = new penalPoints({ guildID: message.guild.id, userID: victim.id, point: 30 });
    pointData.save();
} else {
    pData.point = pData.point + 30;
    pData.save();
}

Penal.model.countDocuments().then(number => {
  let inc = number + 1, currentDate = Date.now();
  new Penal.model({
    Id: inc,
    Type: "BAN",
    User: victim.id,
    Admin: message.author.id,
    Reason: reason,
    Date: currentDate,
  }).save();
    

    
  message.react(Others.Emojis.Check_Tick);
  message.guild.members.ban(victim.id, {days: 7}).catch();
  client.send(message.channel, new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true })).setColor(Others.Colors.Positive).setDescription(` **${victim.user.tag}** kullanıcısı **${message.author.tag}** tarafından başarıyla sunucudan yasaklandı. (Ceza Numarası: \`#${inc}\`)`).setImage(global.Perm.Ban.GIF.length > 0 ? global.Perm.Ban.GIF : null));
  global.updateUser(message.author.id, "Ban", 1);
  
  let embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setDescription(`${message.author}, ${victim} kişisini **"${reason}"** sebebi ile **sunucudan yasakladı**.`)
    .addField("Ceza Bilgisi", `**Ceza Numarası:** \`#${inc}\`\n**Ceza Tipi:** \`Yasaklama\`\n**Tarih:** ${require("moment")(Date.now()).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`)
    .setColor(Others.Colors.negative);
  
  let channel = message.guild.channels.cache.get(global.Perm.Ban.Log);
  if(channel) client.send(channel, embed);
});
};

exports.conf = {
  name: "ban",
  commands: ["ban", "yasakla", "banla", "defol"],
  enabled: true,
  usage: "ban @üye sebep",
};