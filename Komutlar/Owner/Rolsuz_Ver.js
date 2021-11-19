const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {

    
    if (!global.Ayarlar.Sahip.includes(message.author.id))
    return message.channel.send(new Discord.MessageEmbed().setDescription(`${message.author} Komutu kullanmak için yetkin bulunmamakta.`).setColor('RANDOM').setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setTimestamp()).then(x => x.delete({timeout: 5000}));
    
    
    let can = message.guild.members.cache.filter(m => m.roles.cache.filter(r => r.id !== message.guild.id).size == 0)
    
    if(args[0] == "ver") {
        can.forEach(r => {
    r.roles.add(global.Perm.Welcome.Unregistered)
    })
    const cann = new Discord.MessageEmbed()
    .setAuthor(" "+message.author.username +" ", message.author.avatarURL())
    .setColor("RANDOM")
    .setDescription("Sunucuda rolü olmayan (everyone rolünde olan) \`"+ can.size +"\` kişiye kayıtsız rolü verildi!")
    message.channel.send(cann)
    } else if(!args[0]) {
    const can1 = new Discord.MessageEmbed()
    .setAuthor(""+message.author.username +" ", message.author.avatarURL())
    .setColor("RANDOM")
    .setDescription("Sunucumuzda rolü olmayan (everyone rolünde olan) \`"+ can.size +"\` kişi var. Bu kişilere kayıtsız rolü vermek için \`.rolsüz ver\` komutunu uygulayın!")
    message.channel.send(can1)
    }
};
exports.conf = {
    commands: ["rolsuz","rolsüz ver","rolsüz"],
    enabled: false,
    usage: "rolsüz ver",
  };