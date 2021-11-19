const Discord = require("discord.js")
const Penal = require("../../Schemas/Penal.js");
const moment = require("moment");
moment.locale("tr");


exports.run = async (client, message, args) => {
    if (isNaN(args[0])) return message.channel.error(message, "Ceza ID'si bir sayı olmalıdır!");
    const data = await Penal.model.findOne({ guildID: message.guild.id, id: args[0] });
    if (!data) return message.channel.send(`${args[0]} ID'li bir ceza bulunamadı!`);
    message.channel.send(new Discord.MessageEmbed().setDescription(`#${data.Id}  **[${data.Type}]** <@${data.victim.id}> üyesi, ${moment(data.date).format("LLL")} tarihinde, <@${data.Admin}> tarafından, \`${data.Reason}\` nedeniyle, `));
};
exports.conf = {
  commands: ["cezasorgu", "ceza-sorugu", "ceza-id", "cezaid", "cb", "cezabilgi", "cezabilgi"],
  enabled: false,
  usage: "ceza-sorgu #cezaID",
};
