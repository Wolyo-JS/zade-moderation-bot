const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const ms = require("ms");
const others = require("../../Ayarlar/Others.json");
const Guild = require("../../Schemas/Guild.js");
const penalPoints = require("../../Schemas/Cezapuan.js");

exports.run = async (client, message, args) => {
if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");

let kullanici = message.mentions.users.first() || client.users.cache.get(args[0]) || (args.length > 0 ? client.users.cache.filter(e => e.username.toLowerCase().includes(args.join(" ").toLowerCase())).first(): message.author) || message.author;
    let victim = message.guild.member(kullanici);
    let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: victim.id });

    message.channel.send(`${victim} üyesinin ceza puanı : __**${pData.point}**__`) 



};

exports.conf = {
  commands: ["cezapuan","cezap","uyarıpuan","uyarı-puan","cp"],
  enabled: true,
  usage: "cezapuan @kullanıcı<isteğe bağlı>"
};