const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Jail.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
  if(!victim) return client.reply(message, `Birisini etiketlemelisin.`);
  
  Penal.model.find({Activity: true, User: victim.id, $or: [{Type: "JAIL"}, {Type: "TEMP_JAIL"}]}, async (err, res) => {
    if(err) return console.error(err);
    if (!res || !res.length) return client.reply(message, "bu kişinin hiç aktif jail cezası yok!");
    
    let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [args[0]]} });
    if (global.Perm.Defaults.Better_Moderation && res.Admin == message.guild.ownerID) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");
    
    let jails = res.filter(e => e.Type == "JAIL" || e.Type == "TEMP_JAIL").length;
    let msg = await client.reply(message, `${victim.displayName}** kişisinin **${jails}** sesli susturması** jail cezası var. Bu cezaları devre dışı bırakmak istiyorsan \`evet\`, işlemi iptal etmek için \`hayır\` demen yeterli olacaktır. (\`evet-hayır\`)`);
    
    message.channel.awaitMessages((m) => m.author.id == message.author.id && ["evet", "hayır", "e", "h","hayir"].some(e => e == m.content.toLocaleLowerCase()), {
        time: 30000,
        max: 1
    }).then(response => {
    
    if(["evet", "e"].includes(response.first().content.toLowerCase())){
      if(victim.roles){
		    let roles = victim.roles.cache.clone().filter(e => e.managed);
			victim.roles.set(global.Perm.Welcome.Unregistered).catch();
	  }
      
      Penal.model.updateMany({Activity: true, User: victim.id, $or: [{Type: "JAIL"}, {Type: "TEMP_JAIL"}]}, {$set: {Activity: false}}, (err2, res2) => {
        if(err2) return console.error(err2);
      });
      msg.delete();
      return client.reply(message,`${victim} kişisinin tüm jail-karantina cezalarının kaldırmasını onayladığın için sunucudaki tüm cezaları devredışı bırakıldı.`);
    }
    message.react(Others.Emojis.Check_Tick); 
    msg.delete();
    return client.reply(message, `İşlem iptal edildi.`).then(m => m.delete({timeout: 7000}));
  }).catch(err => {return msg.delete();})
  })
};

exports.conf = {
    commands: ["unjail"],
    enabled: true,
    guildOnly: true,
    usage: "unjail @üye",
};