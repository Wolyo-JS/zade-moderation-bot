exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(x => message.member.roles.cache.has(x))) return client.reply(message, "Yetkiniz yok!");
  
  let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(x => x.name.match(new RegExp(args.join(" "), "gi")));
  if (!args[0] || !role || role.id == message.guild.id) return client.reply(message, "rol bulunamadı, bir rol belirt!");
  
  client.send(message.channel, "Rol: " + role.name + " | " + role.id + "\n\n" + (role.members.size < 1 ? "Bu rolde hiç üye yok!" : role.members.array().map((x, y) => (y + 1) + ". " + x.displayName + " / " + x.id).join("\n")), { code: "xl", split: true });
};

exports.conf = {
    commands: ["üyeler", "uyeler"],
    enabled: true,
    usage: "üyeler @rol",
};