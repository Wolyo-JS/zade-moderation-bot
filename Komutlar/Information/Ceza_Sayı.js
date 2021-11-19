const { MessageEmbed } = require("discord.js"); 
const moment = require("moment");
const User = require("../../Schemas/User.js");
const Penal = require("../../Schemas/Penal.js");
require("moment-duration-format")

exports.run = async (client, message, args) => {
if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");
let üye = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

  let uyarılar = await Penal.model.countDocuments({ User: üye.id, Activity: true, Type: "WARN" });
  let ban = await Penal.model.countDocuments({ User: üye.id, Activity: false, Type: "BAN" });
  let kick = await Penal.model.countDocuments({ User: üye.id, Activity: false, Type: "KICK" });
  let jail = await Penal.model.countDocuments({ User: üye.id, Activity: false, Type: "JAIL" });
  let mute = await Penal.model.countDocuments({ User: üye.id, Activity: false, Type: "TEMP_MUTE" });
  let voicemute = await Penal.model.countDocuments({ User: üye.id, Activity: false, Type: "TEMP_VOICE_MUTE" });



const embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
.setDescription(`🚫 ${üye.toString()} kişisinin sahip olduğu ceza sayıları aşağıda belirtilmiştir

${mute} Chat Mute, ${voicemute} Voice Mute, ${jail} Cezalı, ${ban} Ban, ${kick} Kick ve ${uyarılar} uyarı almış.
`)

  message.channel.send(embed);
  
};

exports.conf = {
  commands: ["cezasayısı", "ceza-sayı","ceza-sayısı","cezasayı","cezasayi","cz","cs"],
  enabled: true,
  usage: "cezasayı @kullanıcı<isteğe bağlı>"
};