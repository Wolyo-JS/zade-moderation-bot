const Discord = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const penalPoints = require("../../Schemas/Cezapuan.js");
const ms = require("ms");
const others = require("../../Ayarlar/Others.json");
const Guild = require("../../Schemas/Guild.js");
const tvmuteLimit = new Map();


exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Voice_Mute.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  
  let victim = message.mentions.users.first() || message.guild.member(args[0]) || await client.getUser(args[0]),time = args[1] ? ms(args[1]) : undefined;
  if(!victim) return client.reply(message, `birisini susturmak istiyorsan önce onu etiketlemelisin.\n\n**Doğru kullanım:** \`${this.conf.usage}\``);
  if (global.Perm.Voice_Mute.Vmute_Limit > 0 && tvmuteLimit.has(message.author.id) && tvmuteLimit.get(message.author.id) == global.Perm.Voice_Mute.Vmute_Limit) return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setTimestamp().setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));
  let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: victim.id });

  let reason = args.splice(2).join(" ");
  if(!reason) return message.reply("bir sebep belirtmelisin.");
  if (reason && (await client.chatKoruma(reason))) return message.reply('Reasona da küfür-reklam atmazsın adi')
  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");
  
  let victimMember = message.guild.member(victim);
  
  if(!time) return client.reply(message.channel, "geçerli bir zaman dilimi girmelisin.\n\nÖrneğin: 10h, 10m, 10d ya da 10s");

  if (global.Perm.Voice_Mute.Vmute_Limit > 0) {
    if (!tvmuteLimit.has(message.author.id)) tvmuteLimit.set(message.author.id, 1);
    else tvmuteLimit.set(message.author.id, tvmuteLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (tvmuteLimit.has(message.author.id)) tvmuteLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }

  if(victimMember){
   if(victimMember.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "Etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
    let role = message.guild.roles.cache.get(global.Perm.Voice_Mute.Role);
    if(role) victimMember.roles.add(role).catch();
    if(victimMember.voice.channelID) victimMember.voice.setMute(true);
  }



  if (!pData) {
    let pointData = new penalPoints({ guildID: message.guild.id, userID: victim.id, point: 8 });
    pointData.save();
} else {
    pData.point = pData.point + 8;
    pData.save();
}

  Penal.model.countDocuments().then(number => {
    let inc = number + 1, currentDate = Date.now();
    new Penal.model({
      Id: inc,
      Type: "TEMP_VOICE_MUTE",
      User: victim.id,
      Admin: message.author.id,
      Reason: reason,
      Date: currentDate,
      Temporary: true,
      Finish: currentDate + time
    }).save();
    
    global.updateUser(message.author.id, "VoiceMute", 1);
        
    message.react(Others.Emojis.Check_Tick); 
    let embed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setDescription(`${message.author}, ${victim} kişisini **"${reason}"** sebebi ile **geçici** olarak **sesli susturdu**.`)
        .addField("Ceza Bilgisi", `**Ceza Numarası:** \`#${inc}\`\n**Ceza Tipi:** \`Geçici Sesli Susturma\`\n**Tarih:** ${require("moment")(Date.now()).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`)
        .setColor(others.Colors.negative);
    
    let channel = message.guild.channels.cache.get(global.Perm.Voice_Mute.Log);
    if(channel) client.send(channel, embed);
    
    client.send(message.channel, `${Others.Emojis.Off_Chat} ${victim}, kişisi **"${reason}"** sebebi ile **geçici** olarak susturuldu. (Ceza Numarası: \`#${inc}\`)`)
    client.channels.cache.get(global.Perm.Defaults.CpuanLog).send(`${victim}: aldığınız **#${inc}** ID'li ceza ile **${pData.point ?? 0}** ceza puanına ulaştınız.`).catch(e => { })
    if(victim.roles) victim.send(`${victim}, ${message.author} tarafından **${message.guild.name}** sunucusunda **"${reason}"** sebebi ile geçici olarak sesli susturuldun. (Ceza Numarası: \`#${inc}\`)`).catch(() => {});
	
    setTimeout(async () => {
      let data = await Penal.model.findOne({Id: inc});
      if(!data.Activity) return;
      
      let member = message.guild.member(victim.id);
      if(!member) {data.Activity = false; return data.save();}
      
      if(member.roles.cache.has(global.Perm.Voice_Mute.Role))member.roles.remove(global.Perm.Voice_Mute.Role).catch();
		if(victimMember.voice.channelID) victimMember.voice.setMute(false);
		
		data.Activity = false;
		return data.save();
	}, time);
  }).catch();
};

exports.conf = {
  commands: ["voicemute", "vm", "sesmute", "vmute", "smute", "sesli-sustur","seslisustur"],
  enabled: true,
  usage: "vmute @üye süre(s|m|h|d) sebep",
};