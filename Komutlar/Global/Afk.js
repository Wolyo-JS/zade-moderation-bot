const { MessageEmbed, Collection } = require("discord.js");
const Afk = new Collection();
const moment = require("moment");
moment.locale("tr");
require("moment-duration-format");

exports.onLoad = (client) => {
    client.on("message", message => {
        if (!message.guild || message.author.bot) return;
        if (message.content.startsWith(global.Ayarlar.Prefix)) return;

        if (Afk.has(message.author.id) || message.member.displayName.includes("AFK")) {
            let data = Afk.get(message.author.id) || undefined;
            if(message.member.manageable) message.member.setNickname(message.member.displayName.replace(/\[AFK\] ?/gi, ""));
            if(!data) return;
            let duration = moment(Date.now()).toNow();
            client.reply(message, `AFK modundan çıktın, **${duration}** süre boyunca klavyeden uzak kaldın. :face_with_hand_over_mouth:`);
            Afk.delete(message.author.id);
        }
        
        if (message.mentions.users.size > 1 && message.mentions.users.some(x => Afk.has(x.id))) return client.reply(message, `etiketlediğin kullanıcı(lar) şu an klavyeden uzakta! \n${Afk.filter(x => message.mentions.users.some(e => e.id == x)).map((x) => `**${message.guild.member(x.id) ? x.displayName : x.tag}**: ${x.Reason || "Sebep yok!"}`).join("\n")}`);
        if (message.mentions.members.some(x => Afk.has(x.id) || x.displayName.includes("AFK"))){
          let victim = message.mentions.users.first();
          let data = Afk.get(victim.id) || {};
          return client.reply(message, `etiketlediğin kullanıcı ${data.Reason  ? `**${data.Reason}** sebebiyle klavyeden uzakta` : "klavyeden uzakta" }. *-${moment(data.Now).fromNow()}*`);
        }
    })
}

exports.run = async (client, message, args) => {
  let sebep = args.join(" ") || "";
  if (sebep && (await client.chatKoruma(sebep))) return message.reply('Reklam mı at dedik oç')
  if (sebep.length == 0 &&  message.mentions.everyone || message.mentions.users.size > 5 || message.mentions.roles.size > 3) return client.send(message.channel, "Lütfen kurallara uyan bir sebep girin.");
  if (Afk.has(message.author.id)) {
    let duration = moment.duration(Date.now() - Afk.get(message.author.id).Now).format("D [gün, ] H [saat, ] m [dakika, ] s [saniye]");
    client.reply(message, `AFK modundan çıktın, **${duration}** süre boyunca klavyeden uzak kaldın. :face_with_hand_over_mouth:`);
    message.member.setNickname(message.member.displayName.replace(/\[AFK\] ?/g, "")).catch(err => client.reply(message, "Yetkim yetmediği için ismini düzenleyemiyorum!"));
  } else {
    Afk.set(message.author.id, { Reason: sebep.length > 0 ? sebep : null, Now: Date.now() });
    client.reply(message, `artık AFK modundasın. Seni etiketleyenlere AFK olma sebebini bildireceğim. :face_with_hand_over_mouth:`);
    if(message.member.manageable && !message.member.displayName.includes("AFK"))
      message.member.setNickname("[AFK] " + message.member.displayName.replace(/\[AFK\] ?/g, ""));
  }
};

exports.conf = {
  commands: ["afk"],
  enabled: true,
  usage: "afk [sebep<isteğe bağlı>]"
};
