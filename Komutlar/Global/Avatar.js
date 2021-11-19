const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
  let victim = message.mentions.users.first() || client.users.cache.get(args[0]) || (args[0] && args[0].length ? client.users.cache.find(x => x.username.match(new RegExp(args.join(" "), "mgi"))) : null) || null;
  if (!victim) 
    try { victim = await client.users.fetch(args[0]); }
    catch (err) { victim = message.author; }
  
  client.send(message.channel, new MessageEmbed().setColor("RANDOM").setAuthor(victim.tag, victim.avatarURL({ dynamic: true }), `https://discord.com/users/${victim.id}`).setDescription(`[PNG](${victim.avatarURL({ format: "png", size: 2048 })}) | [JPG](${victim.avatarURL({ format: "jpg", size: 2048 })}) | [JPEG](${victim.avatarURL({ format: "jpeg", size: 2048 })}) [GIF](${victim.avatarURL({ dynamic: true, size: 2048 })})`).setImage(victim.avatarURL({ dynamic: true, size: 2048 })));
};

exports.conf = {
    commands: ["avatar", "av"],
    enabled: true,
    usage: "avatar [kullanıcı<isteğe bağlı>]",
};