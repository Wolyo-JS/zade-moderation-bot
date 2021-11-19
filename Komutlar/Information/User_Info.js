const { MessageEmbed } = require("discord.js"); 
const moment = require("moment");
const User = require("../../Schemas/User.js");
const Penal = require("../../Schemas/Penal.js");
const Register = require('../../models/Register.js');

require("moment-duration-format")
moment.locale("tr")

exports.run = async (client, message, args) => {
  let üye = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
  if (üye.user.bot) return;
  
  let userModel = (await User.model.findOne({ Id: üye.id }).exec()) || {Id: üye.id, Usage: { Man: 0, Woman: 0, Ban: 0, Jail: 0, Kick: 0, ChatMute: 0, VoiceMute: 0, Warn: 0 }, History: { Names: [] }};
  let uyarılar = await Penal.model.countDocuments({ User: üye.id, Activity: true, Type: "WARN" });
  let registerData = await Register.findOne({ guildId: message.guild.id, userId: üye.id });

  let embed = new MessageEmbed().setAuthor(üye.displayName, üye.user.avatarURL({ dynamic: true })).setTimestamp().setColor(üye.displayHexColor).setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })).setThumbnail(üye.user.avatarURL({ dynamic: true }))
    .addField(`❯ Kullanıcı Bilgisi`,
`ID: ${üye.id}
Profil: ${üye}
İsim: ${üye.user.tag}
Durum: ${global.Perm.Defaults.Emojis[üye.user.presence.status]} ${üye.user.presence.activities.length > 0 ? üye.user.presence.activities.map(e => e.name).join(", ") : ""}
Oluşturulma Tarihi: ${moment(üye.user.createdAt).format(`DD/MM/YYYY | HH:mm`)} (${moment(üye.user.createdAt).add(5, 'gün').fromNow().replace("birkaç saniye önce", " ")}.)
`)
    .addField(`❯ Üyelik Bilgisi`,
`Takma Adı: ${üye.displayName != üye.user.username ? üye.displayName : "**Yok!**"}
Katılma Tarihi: ${moment(üye.joinedAt).format(`DD/MM/YYYY | HH:mm`)} (${moment(üye.joinedAt).add(5, 'gün').fromNow().replace("birkaç saniye önce", " ")}.)
Katılma Sırası: ${(message.guild.members.cache.filter(a => a.joinedTimestamp <= üye.joinedTimestamp).size).toLocaleString()}/${(message.guild.memberCount).toLocaleString()}
Bastığı Boost Sayısı: ${üye.premiumSinceTimestamp ? moment(üye.premiumSinceTimestamp).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss") : "**0**"}
En Yüksek Rolü: ${üye.roles.highest} - **${üye.roles.highest.hexColor}**
Aktif Uyarılar: **${uyarılar}**
İsim geçmişi: **${registerData.userNames.length ?? 0}** (isimlerini görmek için ${global.Ayarlar.Prefix}isimler)
Bazı Rolleri: ${üye.roles.cache.size <= 100 ? üye.roles.cache.filter(x => x.name !== "@everyone").map(x => x).join(', ') : `Listelenemedi! (${üye.roles.cache.size})`}
`);
  if (üye.hasPermission("ADMINISTRATOR") || global.Perm.Defaults.Authorized.some(x => üye.roles.cache.has(x))) 
    embed.addField(`❯ Yetkili Bilgisi`,
`Cezalandırmalar: **${(userModel.Usage.Ban || 0) + (userModel.Usage.Kick || 0) + (userModel.Usage.Jail || 0) + (userModel.Usage.ChatMute || 0) + (userModel.Usage.VoiceMute || 0) + (userModel.Usage.Warn || 0)}** (**${userModel.Usage.Ban || 0}** ban, **${(userModel.Usage || {}).Kick || 0}** kick, **${(userModel.Usage || {}).Jail || 0}** jail, **${(userModel.Usage || {}).ChatMute || 0}** chat mute, **${(userModel.Usage || {}).VoiceMute || 0}** ses mute, **${(userModel.Usage || {}).Warn || 0}** uyarı)
Kayıt sayısı: ** ${registerData.totalRegister}** (**${registerData.manRegister}** erkek, **${registerData.womanRegister}** kız)`)
  client.send(message.channel, embed);

  
  if (üye.presence.activities.some(x => x.name == "Spotify" && x.type == "LISTENING")) {
    let presence = üye.presence.activities.find(x => x.name == "Spotify");
    let x = Date.parse(presence.timestamps.start)
    let y = Date.parse(presence.timestamps.end)
    let progressBar = ["▬", "▬", "▬", "▬", "▬", "▬", "▬", "▬", "▬", "▬", "▬", "▬", "▬"];
    let time = Date.now() - presence.timestamps.start
    let time2 = y - x
    let momi = moment.duration(time).format("mm[:]ss")
    if (momi.length === 2) {
      momi = '00:'.concat(momi)
    }
    let calcul = Math.round(progressBar.length * (time / time2));
    progressBar[calcul] = "🟢"
    client.send(message.channel, new MessageEmbed().setAuthor("Spotify bilgi                                                                ", client.user.avatarURL()).setColor("#07c41d").setImage(`https://i.scdn.co/image/${presence.assets.largeImage.slice(8)}`).setDescription(
`​ \`Şarkı ismi\`: [**${presence.details}**](https://open.spotify.com/track/${presence.syncID}) 
​ \`Sanatçı\`: **${presence.state.includes("Teoman") ? "TEOMAN!" : presence.state}**
​ \`Albüm\`: **${presence.assets.largeText}**   

​ \`(${momi}/${moment.duration(y - x).format("m[:]ss")})\` ${progressBar.join('')}`
    ));
  }
  
};

exports.conf = {
  commands: ["kullanıcıbilgi", "kb", "i", "istatistik", "info", "me"],
  enabled: true,
  usage: "kb @kullanıcı<isteğe bağlı>"
}