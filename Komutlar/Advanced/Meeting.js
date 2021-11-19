const { MessageEmbed } = require("discord.js");
const moment = require("moment");

exports.run = async (client, message, args) => {
  let embed = new MessageEmbed().setAuthor(message.member.displayName, message.author.avatarURL({dynamic: true})).setTimestamp();
  if(!message.member.roles.cache.has(global.Perm.Defaults.Guild_Owner)) return message.channel.send(embed.setDescription(`Yoklama komutunu kullanabilmek için herhangi bir yetkiye sahip değilsin.`)).then(x => x.delete({timeout: 5000}));
  if(!message.member.voice || message.member.voice.channelID != global.Perm.Meeting.Log) return;
  
  let members = message.guild.members.cache.filter(member => member.roles.cache.has(global.Perm.Meeting.Role) && member.voice.channelID != global.Perm.Meeting.Log);
  members.array().forEach((member, index) => {
    setTimeout(() => {
      member.roles.remove(global.Perm.Meeting.Role).catch();
    }, index * 1250)
  });
  let verildi = message.member.voice.channel.members.filter(member => !member.roles.cache.has(global.Perm.Meeting.Role) && !member.user.bot)
  verildi.array().forEach((member, index) => {
    setTimeout(() => {
      member.roles.add(global.Perm.Meeting.Role).catch();
    }, index * 1250)
  });
  message.channel.send(embed.setDescription(`Katıldı rolü dağıtılmaya başlandı! \n\n🟢 **Rol Verilecek:** ${verildi.size} \n🔴 **Rol Alınacak:** ${members.size}`)).catch();
};

exports.conf = {
    commands: ["toplantı", "meet", "metting", "meeting", "meetting", "topl"],
    enabled: true,
    usage: "toplantı (katıldı [id])",
};