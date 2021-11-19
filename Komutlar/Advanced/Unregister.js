const { MessageEmbed } = require("discord.js");
const Guild = require("../../Schemas/Guild.js");
const unregLimit = new Map();

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Register.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  
  let victim = message.mentions.members.first() || message.guild.member(args[0]);
  if (!victim) return client.reply(message, "böyle bir üye bulunamadı!");
  if (global.Perm.Register.Limit > 0 && unregLimit.has(message.author.id) && unregLimit.get(message.author.id) == global.Perm.Register.Limit) return message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));

  let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");
  
  if(victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
  
  if(!victim.manageable) return client.reply(message, `etiketlediğin kişi benden yüksek bir role sahip, üzgünüm.`);
 
  if (global.Perm.Register.Limit > 0) {
    if (!unregLimit.has(message.author.id)) unregLimit.set(message.author.id, 1);
    else unregLimit.set(message.author.id, unregLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (unregLimit.has(message.author.id)) unregLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }
  
  let roles = victim.roles.cache.clone().filter(e => e.managed).map(e => e.id).concat(global.Perm.Welcome.Unregistered);
  victim.roles.set(roles).catch();
  
  return client.reply(message, `${victim} üyesi başarı ile kayıtsıza gönderildi!`); 

  
};

exports.conf = {
  commands: ["kayıtsız", "kayıtsızagönder", "unregister", "unregistered", "unr", "kayıts"],
  enabled: true,
  usage: "unr @üye",
};