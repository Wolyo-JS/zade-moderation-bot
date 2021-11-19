const Discord = require("discord.js");
const Others = require("../../Ayarlar/Others.json");
const boosterLimit = new Map();



exports.run = async (client, message, args) => {


if(!message.member.roles.cache.has(global.Perm.Defaults.Booster_Role)) return message.react(Others.Emojis.Red_Tick)
let nick = args.filter(arg => isNaN(arg)).map(arg => arg.charAt(0).replace('i', "İ").toUpperCase()+arg.slice(1)).join(" ");
if(!nick) return message.react(Others.Emojis.Red_Tick)
if (nick && (await client.chatKoruma(nick))) return message.reply('Reklam yazma anneni deşerim')
if(nick.length > 30) return client.reply(message, "isim ya da yaş ile birlikte toplam 30 karakteri geçecek bir isim giremezsin.")
  if (global.Perm.Defaults.Booster_Limit > 0 && boosterLimit.has(message.author.id) && boosterLimit.get(message.author.id) == global.Perm.Defaults.Booster_Limit) return message.channel.send(new Discord.MessageEmbed().setTimestamp().setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })).setDescription(`Günlük kullanım limitine ulaştınız lütfen gün sonunda tekrar deneyiniz.`));
let yaş = args.filter(arg => !isNaN(arg))[0]
if (global.Perm.Defaults.Booster_Limit > 0) {
    if (!boosterLimit.has(message.author.id)) boosterLimit.set(message.author.id, 1);
    else boosterLimit.set(message.author.id, boosterLimit.get(message.author.id) + 1);
    setTimeout(() => {
      if (boosterLimit.has(message.author.id)) boosterLimit.delete(message.author.id);
    }, 1000 * 60 * 60 * 24);
  }
if(!message.member.user.username.includes(global.Perm.Defaults.Tag)) {
    message.member.setNickname(`${global.Perm.Defaults.Secondary_Tag} ${nick.charAt(0).toUpperCase() + nick.slice(1).toLowerCase()} ${yaş ? `| ${yaş}` : ``}`)
} else if (message.member.user.username.includes(global.Perm.Defaults.Tag)) {
message.member.setNickname(`${global.Perm.Defaults.Tag} ${nick.charAt(0).toUpperCase() + nick.slice(1).toLowerCase()} ${yaş ? `| ${yaş}` : ``}`)
} 
 return message.react(Others.Emojis.Check_Tick)


};

exports.conf = {
    commands: ["booster", "zengin", "b"],
    enabled: true,
    usage: "booster isim",
  };