const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
  if (!args[0]) {
    let commands = global.Commands.filter(x => x.conf.enabled)
    .map(x => x.conf.commands[0])
    .sort()
    //.sort((a, b) => ("**" + a.conf.commands[0] + "**" + ": " + "`" + a.conf.usage + "`").length - ("**" + b.conf.commands[0] + "**" + ": " + "`" + b.conf.usage + "`").length)
    .map(x => global.Commands.find(e => e.conf.commands[0] == x));
    let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription("Komut hakkında daha fazla bilgi için; **" + global.Ayarlar.Prefix + "yardım komut**\n\n" + commands.map(x => `**${x.conf.commands[0]}**: \`${x.conf.usage}\``).join("\n"));
    client.send(message.channel, embed);
  } else {
    let command = global.Commands.find(x => x.conf.enabled && x.conf.commands.includes(args.join(" ")));
    if (!command) return client.reply(message, "böyle bir komut bulunamadı.");
    
    let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription(
`\`Komut\`:  ${command.conf.commands[0]}
\`Alternatifler\`: ${command.conf.commands.map(x => x).join(", ")}`)
    client.send(message.channel, embed);
  }
};

exports.conf = {
    commands: ["yardım", "help", "commands", "komutlar", "menü", "yardim", "yard", "ya"],
    enabled: true,
    usage: "yardım"
};