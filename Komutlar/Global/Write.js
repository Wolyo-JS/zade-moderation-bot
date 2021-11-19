const { MessageEmbed } = require("discord.js");
const Others = global.Others;

exports.run = async (client, message, args) => {
  
  let text = args.join(" ");
  if (!text || text.length < 1) return client.reply(message, "yazmam için bir metin girin.");
  if (message.member.hasPermission("ADMINISTRATOR")) {
    let webhook = client.getWebhook(message.channel.id);
    if (webhook) webhook.send(text);/*webhook.sendSlackMessage({
      avatarURL: message.author.avatarURL({ dynamic: true }),
      username: message.author.username,
      content: text
    });*/
  } else {
    let link = /(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;
    let invite = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
    if (link.test(text) || invite.test(text) || message.mentions.everyone || message.mentions.users.size > 5 || message.mentions.roles.size > 3) return client.reply(message, "lütfen kurallara uyan bir yazı girin.");
    
    let webhook = client.getWebhook(message.channel.id);
    if (webhook) webhook.send(text); /*webhook.sendSlackMessage({
      avatarURL: message.author.avatarURL({ dynamic: true }),
      username: message.author.username,
      content: text
    });*/
  }
};

exports.conf = {
  commands: ["yaz"],
  enabled: true,
  usage: "yaz <metin>",
};