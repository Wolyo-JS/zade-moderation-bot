const Discord = require("discord.js");

exports.execute = message => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(global.Ayarlar.Prefix)) return;
  message.client.emit("onMessage", message);
  let args = message.content.split(" ").filter(e => e != " ");
  let commandName = args[0].substring(global.Ayarlar.Prefix.length);
  args = args.splice(1);
  let command = global.Commands.find(x => x.conf.commands.includes(commandName));
  if (!command || (!command.conf.enabled && !message.member.hasPermission("ADMINISTRATOR"))) return;

  if (command && (!message.member.roles.cache.has(global.Perm.Jail.Role) || !message.member.roles.cache.has(global.Perm.Suspect.Role) || !message.member.roles.cache.has(global.Perm.Welcome.Unregistered))) {
    //if (command.conf.perm && (command.conf.owner && !global.Ayarlar.Sahip.includes(message.author.id)) && (command.conf.roles && !command.conf.roles.some(e => message.member.roles.cache.has(e)))) return;
    message.client.emit("onCommandUsage", message, command);
    command.run(message.client, message, args, global.Ayarlar);
  }
};

exports.conf = {
  event: "message"
};