const { MessageEmbed } = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");
const Others = require("../../Ayarlar/Others.json");
const kickLimit = new Map();


exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Kick.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");  
  
  let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
  if (!victim) return client.reply(message, "atmak için bir üye belirt!");
  if (global.Perm.Kick.Kick_Limit > 0 && kickLimit.has(message.author.id) && kickLimit.get(message.author.id) == global.Perm.Kick.Kick_Limit) return message.channel.send(new MessageEmbed().setTimestamp().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));


  let reason = args.splice(2).join(" ");
  if(!reason) return message.reply("bir sebep belirtmelisin.");
  if (reason && (await client.chatKoruma(reason))) return message.reply('Reasona da küfür-reklam atmazsın adi')
  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");
  
  
  if(victim && victim.roles && victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
  
  if(victim && victim.roles && !victim.manageable) return client.reply(message, `etiketlediğin kişi benden yüksek bir role sahip, üzgünüm.`)

  victim.kick({ reason: reason }).catch();

  if (global.Perm.Kick.Kick_Limit > 0) {
    if (!kickLimit.has(message.author.id)) kickLimit.set(message.author.id, 1);
    else kickLimit.set(message.author.id, kickLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (kickLimit.has(message.author.id)) kickLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }

      Penal.model.countDocuments().then(number => {
        let inc = number + 1, currentDate = Date.now();
        new Penal.model({
          Id: inc,
          Type: "KICK",
          User: victim.id,
          Admin: message.author.id,
          Reason: reason,
          Date: currentDate,
        }).save();
        
        client.send(message.channel, new MessageEmbed().setColor(Others.Colors.Positive).setDescription(`${victim} üyesi ${reason} nedeni ile sunucudan atıldı!`).setImage(global.Perm.Kick.GIF.length > 0 ? global.Perm.Kick.GIF : null));
        global.updateUser(message.author.id, "Kick", 1);
      
        message.react(Others.Emojis.Check_Tick); 
        let embed = new MessageEmbed()
          .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
          .setDescription(`${message.author}, ${victim} kişisini **"${reason}"** sebebi ile **sunucudan atıldı**.`)
          .addField("Ceza Bilgisi", `**Ceza Numarası:** \`#${inc}\`\n**Ceza Tipi:** \`Atma\`\n**Tarih:** ${require("moment")(Date.now()).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`)
          .setColor(Others.Colors.negative);
        
        let channel = message.guild.channels.cache.get(global.Perm.Ban.Log);
        if(channel) client.send(channel, embed);
        return;
      });
};

exports.conf = {
    commands: ["kick", "kickle", "at", "tekme","kıck"],
    enabled: true,
    usage: "kick @üye sebep",
};