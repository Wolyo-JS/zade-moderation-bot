const { MessageEmbed } = require("discord.js");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID) return client.reply(message, "yetkiniz yok!");
 
  if (args[0] != "liste") {
    let victim = message.mentions.users.first() || client.users.cache.get(args[0]);
    if (!victim) 
      try {
        victim = await client.users.fetch(args[0]);
      } catch (err) {
        return client.reply(message, "böyle bir kullanıcı bulunamadı, listelemek istiyorsan **liste** yaz!");
      }
    
    Guild.model.findOne({ Id: message.guild.id }, (err, res) => {
      if (err) return console.error(err);
      if (!res) {
        new Guild.model({
          Id: message.guild.id,
          Banned_Tags: [],
          Force_Bans: [ victim.id ],
          Trusted_Members: [],
          Evolution: [ {} ] 
        }).save();
        message.guild.members.ban(victim.id, { days: 7, reason: "FORCE BAN - YARGI SİSTEMİ" }).catch();
        client.send(message.channel, "force ban listesi başarı ile güncellendi!");
      } else {
        if(res.Force_Bans.includes(victim.id)) {
          res.Force_Bans = res.Force_Bans.filter(e => e != victim.id);
          client.reply(message, `**${victim}** üyesi başarı ile force ban listesinden çıkarıldı!`);
        } else {
          message.guild.members.ban(victim.id, { days: 7, reason: "FORCE BAN - YARGI SİSTEMİ" }).catch();
          res.Force_Bans.push(victim.id);
          client.reply(message, `**${victim}** üyesi başarı ile force ban listesine eklenildi!`);
        }
        res.save();
      }
    })
  } else {
    Guild.model.findOne({ Id: message.guild.id }, async (err, res) => {
      if (err) return console.error(err);
      if (res && res.Force_Bans.length > 0) {
        const users = new Array();
        for (let user of res.Force_Bans) users.push((await client.getUser(user)));
        
        client.send(message.channel, new MessageEmbed().setColor(global.Others.Colors.positive).setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription(users.map((x, y) => `\`${y + 1}\`: **${x.tag}** | \`${x.id}\``)))
      } else return client.reply(message, "hiç force banlı kullanıcı yok!");
    });
  }
};

exports.conf = {
    commands: ["forceban", "fban"],
    enabled: true,
    usage: "forceban id/liste",
};