const { MessageEmbed } = require("discord.js");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID) return client.reply(message, "yetkiniz yok!");
  
  if (args[0]) {
    let tag = args.join(" ").trim();
    if (!tag || tag.length < 1) return client.reply(message, `komutu yanlış kullanıyorsun. \`${this.conf.usage}\``);
    
    Guild.model.findOne({ Id: message.guild.id }, (err, res) => {
      if (err) return console.error(err);
      if (!res) {
        new Guild.model({
          Id: message.guild.id,
          Banned_Tags: [ tag ],
          Force_Bans: [ ],
          Trusted_Members: [],
          Evolution: [ {} ] 
        }).save();
        client.send(message.channel, `**${tag}** sembolü yasaklı taglara eklendi!`);
      } else {
        if(res.Banned_Tags.includes(tag)) {
          res.Banned_Tags = res.Banned_Tags.filter(e => e != tag);
          client.reply(message, `**${tag}** sembolü yasaklı taglardan çıkarıldı!`);
        } else {
          res.Banned_Tags.push(tag);
          client.reply(message, `**${tag}** sembolü yasaklı taglara eklendi!`);
        }
        res.save();
      }
    })
  } else {
    Guild.model.findOne({ Id: message.guild.id }, async (err, res) => {
      if (err) return console.error(err);
      if (res && res.Banned_Tags.length > 0) {
        client.send(message.channel, `Yasaklı taglar: ${res.Banned_Tags.length > 0 ? res.Banned_Tags.join(", ") : "0"}`);
      } else return client.reply(message, "herhangi bir yasaklı tag bulamadım...");
    });
  }
};

exports.conf = {
    commands: ["yasaklıtag", "yasaklı-tag", "ytag", "bannedtags", "tagkaraliste"],
    enabled: true,
    usage: "yasaklıtag tag/liste",
};