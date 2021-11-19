const { MessageEmbed } = require("discord.js");
const Others = global.Others;

exports.run = async (client, message, args) => {
  let guild = message.guild, members = (await guild.members.fetch()).filter(x => !x.user.bot);
  let embed = new MessageEmbed()
  .setDescription(
`\`•\` Seste toplam **${members.filter(x => x.voice.channelID).size}** kullanıcı var.
\`•\` Toplam **${members.filter(x => x.roles.cache.has(global.Perm.Defaults.Family_Role) || x.user.username.includes(global.Perm.Defaults.Tag)).size}** kişi tagımıza sahip.
\`•\` Sunucumuzda toplam **${members.size}** üye var.
\`•\` Sunucumuzda toplam **${members.filter(x => x.presence.status != "offline").size}** çevrimiçi üye var.
\`•\` Sunucumuza toplam **${guild.premiumSubscriptionCount}** takviye yapılmış.


`)
//\`•\` Toplam **${message.guild.roles.cache.get(global.Perm.Register.Woman).members.size}** kadın üyemiz var.
//\`•\` Toplam **${message.guild.roles.cache.get(global.Perm.Register.Man).members.size}** erkek üyemiz var.
//\`•\` Sunucumuzda toplam **${message.guild.roles.cache.filter(r => r.name).map(r => r.members.size).slice(0,10).join(', ')}** Yetkili var.
//\`•\` Sunucumuzda toplam **${members.filter(x => x.roles.cache.has(global.Perm.Defaults.Booster_Role)).size}** booster var.

.setColor(Others.Colors.positive)
  client.send(message.channel, embed);
};

exports.conf = {
  commands: ["say", "Say"],
  enabled: true,
  usage: "say",
};