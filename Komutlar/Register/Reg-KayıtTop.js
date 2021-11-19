const Discord = require("discord.js");
const mongoose = require("mongoose");
const Register = require('../../models/Register.js');
const Penal = require("../../Schemas/Penal.js");

exports.run = async (client, message, args) => {

  let embed = new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
    
  let registerTop = await Register.find({ guildId: message.guild.id }).sort([["totalRegister", "descending"]]).exec();

  if(!registerTop.length) return message.channel.send(embed.setDescription(`Herhangi bir kayıt verisi bulunamadı!`))
  registerTop = registerTop.filter(x => message.guild.members.cache.has(x.userId)).splice(0, 10)
  message.channel.send(embed.setTitle("Top Teyit Listesi").setDescription(registerTop.map((x, i) => `\`${i+1}.\` <@${x.userId}> Toplam **${x.totalRegister}** (\`${x.manRegister} Erkek, ${x.womanRegister} Kız\`)`)))

};
exports.conf = {
  commands: ["topteyit","top-teyit","kayıt-top", "kayıttop", "ls", "lb"],
  enabled: true,
  usage: "topteyit"
};