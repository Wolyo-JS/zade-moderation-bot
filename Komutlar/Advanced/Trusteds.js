const { MessageEmbed } = require("discord.js");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID) return client.reply(message, "yetkiniz yok!");
 
  if (args[0] != "liste") {
    let victim = message.mentions.users.first() || client.users.cache.get(args[0]);
    if (!victim) return client.reply(message, "böyle bir kullanıcı bulunamadı, listelemek istiyorsan **liste** yaz!");
    
    Guild.model.findOne({ Id: message.guild.id }, (err, res) => {
      if (err) return console.error(err);
      if (!res) {
        new Guild.model({
          Id: message.guild.id,
          Banned_Tags: [],
          Force_Bans: [],
          Trusted_Members: [ victim.id ],
          Evolution: [ {} ] 
        }).save();
        client.send(message.channel, "güvenli listesi başarı ile güncellendi!");
      } else {
        if(res.Trusted_Members.includes(victim.id)) {
          res.Trusted_Members = res.Trusted_Members.filter(e => e != victim.id);
          client.reply(message, `**${victim}** üyesi başarı ile güvenli listesinden çıkarıldı!`);
        } else {
          res.Trusted_Members.push(victim.id);
          client.reply(message, `**${victim}** üyesi başarı ile güvenli listesine eklenildi!`);
        }
        res.save();
      }
    })
  } else {//burası listeleme
    Guild.model.findOne({ Id: message.guild.id }, async (err, res) => {
      if (err) return console.error(err);
      if (res && res.Trusted_Members.length > 0) {
        const users = res.Trusted_Members.map(x => client.users.cache.has(x) ? client.users.cache.get(x).toString() : "Bilgi çekilemedi; " + x);
        
        client.send(message.channel, new MessageEmbed().setColor(global.Others.Colors.positive).setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription(users.join("\n")))
      } else return client.reply(message, "hiç güvenli kullanıcı yok, kendine dost edinmeye bak :()");
    });
  }
};

exports.conf = {
  commands: ["güvenli", "güv"],
  enabled: true,
  usage: "güvenli (@etiket/id)/liste",
};