const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  
  const bans = await message.guild.fetchBans();
  client.send(message.channel, (bans.size < 1 ? "Yasaklı üye yok!" : bans.array().map((x, y) => `${y + 1}. ${x.user.tag} | ${x.user.id}: ${x.reason ? x.reason : "Sebep yok!"}`).join("\n")), { code: "xl", split: true })
};

exports.conf = {
  commands: ["yasaklılar", "banneds", "yasaklananlar", "bans"],
  enabled: true,
  usage: "yasaklılar",
};