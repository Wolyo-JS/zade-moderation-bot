const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");
const others = require("../../Ayarlar/Others.json");
const penalPoints = require("../../Schemas/Cezapuan.js");
const jailLimit = new Map();

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Jail.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
  if(!victim) return client.reply(message, `birisini cezalandırmak istiyorsan önce onu etiketlemelisin.\n\n**Doğru kullanım:** \`${this.conf.usage}\``);
  let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: victim.id });
  if (global.Perm.Jail.Jail_Limit > 0 && jailLimit.has(message.author.id) && jailLimit.get(message.author.id) == global.Perm.Jail.Jail_Limit) return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setTimestamp().setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));

  let reason = args.splice(2).join(" ");
  if(!reason) return message.reply("bir sebep belirtmelisin.");
  if (reason && (await client.chatKoruma(reason))) return message.reply('Reasona da küfür-reklam atmazsın adi')
  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");


  if(victim.roles && victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "Etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
  if(victim.roles){
    let roles = victim.roles.cache.clone().filter(e => e.managed);
    victim.roles.set(roles.set(global.Perm.Jail.Role, message.guild.roles.cache.get(global.Perm.Jail.Role))).catch();
  }

  if (global.Perm.Jail.Jail_Limit > 0) {
    if (!jailLimit.has(message.author.id)) jailLimit.set(message.author.id, 1);
    else jailLimit.set(message.author.id, jailLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (jailLimit.has(message.author.id)) jailLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }

  if (!pData) {
    let pointData = new penalPoints({ guildID: message.guild.id, userID: victim.id, point: 30 });
    pointData.save();
} else {
    pData.point = pData.point + 30;
    pData.save();
}
  /*let pData = await penalPoints.findOne({guildID: message.guild.id , userID: user.id})
  if (!pData) {
         let pointData = new penalPoints({ guildID: message.guild.id, userID: user.id, point: 25 });
         pointData.save();
     }
 else {
 await penalPoints.findOneAndUpdate({guildID: message.guild.id , userID: user.id}, {
 $inc: {
 point: 25
 }
 })
 }*/


  Penal.model.countDocuments().then(number => {
    let inc = number + 1, currentDate = Date.now();
    new Penal.model({
      Id: inc,
      Type: "JAIL",
      User: victim.id,
      Admin: message.author.id,
      Reason: reason,
      Date: currentDate,
      Jail_Roles: [victim.roles.cache.filter(x => x.id != message.guild.id).map(x => x.id)]
    }).save();
    
    
    global.updateUser(message.author.id, "Jail", 1);
        
    message.react(Others.Emojis.Check_Tick); 
    let embed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setDescription(`${message.author}, ${victim} kişisini **"${reason}"** sebebi ile **kalıcı** olarak **cezalandırıldı**.`)
        .addField("Ceza Bilgisi", `**Ceza Numarası:** \`#${inc}\`\n**Ceza Tipi:** \`Kalıcı Cezalandırma\`\n**Tarih:** ${require("moment")(Date.now()).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`)
        .setColor(others.Colors.negative);
        let channel = message.guild.channels.cache.get(global.Perm.Jail.Log);
        if(channel) channel.send(embed);
    
    client.send(message.channel, `${victim}, kişisi **"${reason}"** sebebi ile **kalıcı** olarak cezalandırıldı. (Ceza Numarası: \`#${inc}\`)`)
    client.channels.cache.get(global.Perm.Defaults.CpuanLog).send(`${victim}: aldığınız **#${inc}** ID'li ceza ile **${pData.point ?? 0}** ceza puanına ulaştınız.`).catch(e => { })
    if(victim && victim.roles) victim.send(`${victim}, ${message.author} tarafından **${message.guild.name}** sunucusunda **"${reason}"** sebebi ile kalıcı olarak cezalandırıldın. (Ceza Numarası: \`#${inc}\`)`).catch(() => {});
  }).catch();
  
};

/*//yol 1 
const pData = await penalPoints.findOne({guilID: message.guild.id , userID: user.id})
if(!pData) {
//new penalPoints falan diye yeni DB açacaksın daha bulamıyorsa
}
//pData.point gibi çekebilirsin 
///////

//yol 2 (daha güvenilir ben bunu kullanıyorum genelde) 
await penalPoints.findOne({guilID: message.guild.id , userID: user.id}).then(async(err , data) => {
if(err) console.log(err) // hata varsa loga atıyor
if(!data){
// new penalPoints falan diye yeni DB açacaksın daha bulamıyorsa
return;
}
// data.point şeklinde çekebilirsin

})*/
exports.conf = {
    commands: ["jail","j","hapis","cezalandır","cezalandir","slave"],
    enabled: true,
    usage: "jail @üye sebep"
};