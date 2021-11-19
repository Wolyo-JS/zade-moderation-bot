const { GuildMember, VoiceChannel, MessageEmbed } = require("discord.js")

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Transport.Auth_Roles.some(x => message.member.roles.cache.has(x))) return client.reply(message, "yetkiniz yok!");
 
  let victim = message.mentions.members.first() || message.guild.member(args[0]);
  if (!args[0] || !victim) return client.reply(message, "taşınacak üyeyi etiketle!");
  if (!victim.voice.channelID) return client.reply(message, "**taşınacak** üye bir ses kanalında değil!");
  else if (victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "taşınacak üye senden daha yetkili!");
  
  let target = message.mentions.members.array()[1] || message.guild.member(args[1]) || message.guild.channels.cache.find(x => x.type == "voice" && x.id == args[1]) || message.guild.channels.cache.find(x => x.type == "voice" && x.name.toLowerCase().includes(args.splice(1).join(" ").toLowerCase()));
  if (!args[1] || !target) return client.reply(message, "hedef üyeyi veya ses kanalını belirt! (ID veya isim ile)");
  
  let isMember = target instanceof GuildMember;
  
  if (isMember && !target.voice.channelID) return client.reply(message, "**hedef** üye bir ses kanalında değil!");
  else if (isMember && target.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "hedef üye senden daha yetkili!");
  
  victim.voice.setChannel(isMember ? target.voice.channelID : target.id).catch();
  client.reply(message, `**${victim.displayName}** üyesi başarı ile **${target.displayName || target.name}** ${isMember ? `üyesinin ses kanalına (**${target.voice.channel.name}**) taşındı.` : `ses kanalında taşındı!`}`);
  
  let channel = message.guild.channels.cache.get(global.Perm.Transport.Log);
  if (channel) client.send(channel, new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription(`${message.author} tarafından, ${victim} üyesi ${target instanceof GuildMember ? `üyesinin ses kanalına (**${target.voice.channel.name}**) taşındı.` : `ses kanalında taşındı!`}`));
};

exports.conf = {
    commands: ["taşı", "tp", "teleport", "transport", "tasi", "tası", "taşi"],
    enabled: true,
    usage: "taşı @üye (@hedef üye/ses kanalı ID)",
};