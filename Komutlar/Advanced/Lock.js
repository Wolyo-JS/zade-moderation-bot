exports.run = async (client, message, args) => {
  if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID) return client.reply(message, "yetkiniz yok!");
 
  if (message.channel.permissionsFor(message.guild.id).has("SEND_MESSAGES")) {
    message.channel.updateOverwrite(message.guild.id, {
      READ_MESSAGES: false,
      SEND_MESSAGES: false,
      ADD_REACTIONS: false
    }).then(() => message.react("🔓")).catch(e => client.reply("Kilit kapatılırken bir hata oluştu, lütfen hatayı bot sahibine ilet;\n" + e.name + "\n" + e.message));
  } else {
    message.channel.updateOverwrite(message.guild.id, {
      READ_MESSAGES: false,
      SEND_MESSAGES: true,
      ADD_REACTIONS: true
    }).then(() => message.react("🔒")).catch(e => client.reply("Kilit açılırken bir hata oluştu, lütfen hatayı bot sahibine ilet;\n" + e.name + "\n" + e.message));
  }
};

exports.conf = {
    commands: ["kilit", "lock", "kilitle", "kil"],
    enabled: true,
    usage: "kilit",
};