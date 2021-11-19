const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Chat_Mute.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "bunu yapmak için yeterli bir yetkiye sahip değilsin.");

  let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
  if(!victim) return client.reply(message, `birisini etiketlemelisin.`);
  
  Penal.model.find({Activity: true, User: victim.id, $or: [{Type: "MUTE"}, {Type: "TEMP_MUTE"}]}, async (err, res) => {
    if(err) return console.error(err);
    
    let voiceMutes = res.filter(e => e.Type == "TEMP_VOICE_MUTE" || e.Type == "VOICE_MUTE").length, chatMutes = res.filter(e => e.Type == "MUTE" || e.Type == "TEMP_MUTE").length;
    
    let msg = await client.reply(message, `**${victim.displayName}** kişisinin **${voiceMutes}** sesli susturması ve toplam **${chatMutes}** chat susturması var. Bu cezaları devre dışı bırakmak istiyorsan \`evet\`, işlemi iptal etmek için \`hayır\` demen yeterli olacaktır. (\`evet-hayır\`)`);
    
    let response = await message.channel.awaitMessages((m) => m.author.id == message.author.id && ["evet", "hayır", "e", "h","hayir"].some(e => e == m.content.toLocaleLowerCase()), {
        time: 30000,
        max: 1
    }).then(coll => coll.first()).catch(e => undefined);
    if(!response) return msg.delete();
    
    if(["evet", "e"].includes(response.content.toLowerCase())){
      if(victim.voice && victim.voice.channelID){
        if(victim.voice.serverMute) victim.voice.setMute(false).catch();
        if(victim.roles.cache.has(global.Perm.Voice_Mute.Role)) victim.roles.remove(global.Perm.Voice_Mute.Role).catch();
      }
      if(victim.roles && victim.roles.cache.has(global.Perm.Chat_Mute.Role)) victim.roles.remove(global.Perm.Chat_Mute.Role).catch();
      
      Penal.model.updateMany({Activity: true, User: victim.id, $or: [{Type: "TEMP_MUTE"}, {Type: "MUTE"}, {Type: "VOICE_MUTE"}, {Type: "TEMP_VOICE_MUTE"}]}, {$set: {Activity: false}}, (err2, res) => {
        if(err2) return console.error(err2);
      });
      msg.delete();
      return client.reply(message,`kişisinin tüm chat-voice cezalarının kaldırmasını onayladığın için sunucudaki tüm cezaları devredışı bırakıldı.`);
    }
    message.react(Others.Emojis.Check_Tick); 
    msg.delete();
    return client.reply(message, `İşlem iptal edildi.`).then(m => m.delete({timeout: 7000}));
  })
};

exports.conf = {
    commands: ["unmute","uncmute","cunmute","chatunmute","unvmute","vunmute","voiceunmute"],
    enabled: true,
    guildOnly: true,
    usage: "unmute @üye",
};