const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Ban.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  
  if (!args[0] || args[0].length <= 0) return client.reply(message, "belirttiğin(?) ID ile bir yasaklı kullanıcı bulunamadı.");
  
  let bans = await message.guild.fetchBans();
  if (!bans.has(args[0])) return client.reply(message, "belirttiğin ID ile bir yasaklı kullanıcı bulunamadı.");
  
  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [args[0]]} });
  
  Penal.model.findOne({ Type: "BAN", User: new RegExp(args.join(" "), "g") }, async (err, res) => {
      if (res && global.Perm.Defaults.Better_Moderation && res.Admin == message.guild.ownerID && message.author.id != message.guild.ownerID) return client.reply(message, "sunucuda ekstra koruma sistemi açık, sunucu sahibinin attığı banı açamazsın!");
      message.guild.members.unban(args[0]).catch();
      client.send(message.channel, `**${(await client.users.fetch(args[0])).tag}** kullanıcısının yasağı başarı ile kaldırıldı!`);
      message.react(Others.Emojis.Check_Tick); 
    });
};

exports.conf = {
    commands: ["unban", "banaç"],
    enabled: true,
    guildOnly: true,
    usage: "unban id",
};