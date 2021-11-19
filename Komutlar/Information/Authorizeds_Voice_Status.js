const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(x => message.member.roles.cache.has(x))) return client.reply(message, "Yetkiniz yok!");
  
  let yetkililer = global.Perm.Defaults.Authorized;
  let sestekiler = message.guild.members.cache.filter(x => !x.user.bot && x.presence.status != "offline" && x.voice.channelID && x.roles.cache.some(e => yetkililer.includes(e.id)));
  let sesteOlmayanlar = message.guild.members.cache.filter(x => !x.user.bot && x.presence.status != "offline" && !x.voice.channelID && x.roles.cache.some(e => yetkililer.includes(e.id)));
  let offlineOlanlar = message.guild.members.cache.filter(x =>!x.user.bot && x.presence.status == "offline" && !x.voice.channelID && x.roles.cache.some(e => yetkililer.includes(e.id)));
  let manipuleciOclar = message.guild.members.cache.filter(x => !x.user.bot && x.presence.status == "offline" && x.voice.channelID && x.roles.cache.some(e => yetkililer.includes(e.id)))
  
  client.send(message.channel, !args[0] ? `${sesteOlmayanlar.size > 0 ? `**SESE GEÇİN LAYN!** ${sesteOlmayanlar.map(x => x.toString()).join(" ")}` : "Harika, seste olmayan yok!"}\n${""/*${sesteOlmayanlar.size > 0 ? (manipuleciOclar.size > 0 ? `` : "Kardeşim sizde bi' online geçsenize offline'da ne facebook var?") : "Güzel güzel, manipüleci üç kağıtçı da yok."}*/}` : null, new MessageEmbed().setColor("RANDOM").addField(
"Sesteki yetkililer",
`\`\`\`xl
${sestekiler.size > 0 ? sestekiler.map(x => x.displayName + " / " + x.id).join("\n") : "0"}
\`\`\``)
.addField(
"Seste olmayan yetkililer",
`\`\`\`xl
${sesteOlmayanlar.size > 0 ? sesteOlmayanlar.map(x => x.displayName + " / " + x.id).join("\n") : "0"}
\`\`\``)
.addField(
"Çevrimdışı olan yetkililer",
`\`\`\`xl
${offlineOlanlar.size > 0 ? offlineOlanlar.map(x => x.displayName + " / " + x.id).join("\n") : "0"}
\`\`\``)
.addField(
"Seste olan ama çevrimdışı olan yetkililer (Manipüle yapanlar)",
`\`\`\`xl
${manipuleciOclar.size > 0 ? manipuleciOclar.map(x => x.displayName + " / " + x.id).join("\n") : "0"}
\`\`\``));
};

exports.conf = {
  commands: ["sesdurum", "yetkiliseskontrol", "seskontrol"],
}