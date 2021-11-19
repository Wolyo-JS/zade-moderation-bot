const { MessageEmbed } = require("discord.js"); 
const moment = require("moment");
const User = require("../../Schemas/User.js");
const Penal = require("../../Schemas/Penal.js");
require("moment-duration-format")

exports.run = async (client, message, args) => {
if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");
let üye = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;


let userModel = (await User.model.findOne({ Id: üye.id }).exec()) || {Id: üye.id, Usage: {Ban: 0, Jail: 0, Kick: 0, ChatMute: 0, VoiceMute: 0, Warn: 0 }, History: { Names: [] }};


const embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
.setDescription(`🚫 ${üye.toString()} Yetkilisinin atmış olduğu tüm ceza sayıları aşağıda belirtilmiştir

${(userModel.Usage.ChatMute || 0)} Chat Mute, ${(userModel.Usage.VoiceMute || 0)} Voice Mute, ${(userModel.Usage.Jail || 0)} Cezalı, ${(userModel.Usage.Ban || 0)} Ban, ${(userModel.Usage.Kick || 0)} Kick ve ${(userModel.Usage.Warn || 0)} uyarı atmış.
`)

  message.channel.send(embed);
  
};

exports.conf = {
  commands: ["cezalandırmalar", "cezalandırmalarım"],
  enabled: true,
  usage: "cezalandırmalar @kullanıcı<isteğe bağlı>"
};