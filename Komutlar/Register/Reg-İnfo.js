const Discord = require("discord.js");
const Register = require('../../models/Register.js');

exports.run = async (client, message, args) => {

  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Register.Auth_Roles.some(e => message.member.roles.cache.has(e))) return;

  let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    
  let registerData = await Register.findOne({ guildId: message.guild.id, userId: user.id });
  let embed = new Discord.MessageEmbed().setAuthor(user.user.tag, user.user.avatarURL({ dynamic: true }));
  if(!registerData) {
    let newRegisterData = new Register({
      guildId: message.guild.id,
      userId: user.id,
      totalRegister: 0,
      womanRegister: 0,
      manRegister: 0,
      userNames: []
    }).save().then(x => {
        return message.channel.send(embed.addField(`Kullanıcı Bilgisi`, `\`>\` Kullanıcı Adı: ${user} \n\`>\` Takmadı Adı: ${user.displayName} \n\`>\` Kullanıcı ID: ${user.id}`).addField(`Kayıt Bilgisi`, `\`>\` Toplam: ${x.totalRegister} \n\`>\` Erkek: ${x.manRegister} \n\`>\` Kız: ${x.womanRegister}`))
    });
  } else {
    message.channel.send(embed.addField(`Kullanıcı Bilgisi`, `\`>\` Kullanıcı Adı: ${user} \n\`>\` Takmadı Adı: ${user.displayName} \n\`>\` Kullanıcı ID: ${user.id}`).addField(`Kayıt Bilgisi`, `\`>\` Toplam: ${registerData.totalRegister} \n\`>\` Erkek: ${registerData.manRegister} \n\`>\` Kız: ${registerData.womanRegister}`))
  }
  
};

exports.conf = {
  commands: ["kayıtlarım","kaydettiklerim","kayıt-info"],
  enabled: true,
  usage: "kayıtlarım @etiket<isteğe/bağlı>"
};