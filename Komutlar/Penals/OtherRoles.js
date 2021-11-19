const { MessageEmbed } = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const Guild = require("../../Schemas/Guild.js");
const others = require("../../Ayarlar/Others.json");
const penalPoints = require("../../Schemas/Cezapuan.js");

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Talent_Distribution.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");  
  let embed = new MessageEmbed().setTitle(message.member.displayName, message.author.avatarURL({dynamic: true})).setTimestamp().setColor("RANDOM");
  let olumlu = new MessageEmbed().setTitle(message.member.displayName, message.author.avatarURL({dynamic: true})).setTimestamp().setColor("GREEN");
  let olumsuz = new MessageEmbed().setTitle(message.member.displayName, message.author.avatarURL({dynamic: true})).setTimestamp().setColor("RED");
  if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(embed.setDescription('Bu komutu kullanmak için gerekli izinlere sahip değilsin.')).then(x => x.delete({timeout: 10000}));
  let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
  let zade = args[0];
  if (!zade || !member) return message.channel.send(olumsuz.setDescription(`Komutu doğru kullanmalısın. \`Örnek: ${Ayarlar.Prefix || ""}r vip @üye\` \n ${Ayarlar.Prefix || ""}r vip @üye \`>\` Belirtilen üyeye **VIP** r verir/alır.
  ${Ayarlar.Prefix || ""}r muzisyen @üye \`>\` Belirtilen üyeye **Müzisyen** rolü verir/alır.
  ${Ayarlar.Prefix || ""}r vokal @üye \`>\` Belirtilen üyeye **Vokal** rolü verir/alır.
  ${Ayarlar.Prefix || ""}r terapist @üye \`>\` Belirtilen üyeye **Terapist** rolü verir/alır.
  ${Ayarlar.Prefix || ""}r streamer @üye \`>\` Belirtilen üyeye **Sorun Çözücü** rolü verir/alır.
  ${Ayarlar.Prefix || ""}r pianist @üye \`>\` Belirtilen üyeye **pianist** rolü verir/alır.
  ${Ayarlar.Prefix || ""}r designer @üye \`>\` Belirtilen üyeye **Lovers** rolü verir/alır.`).setFooter(`.rol bilgi @üye | kullanarak bilgi alabilirsiniz.`)).then(x => x.delete({timeout: 12000}));

  if (zade === "bilgi" || zade === "info") {
      message.channel.send(embed.setDescription(`
      ${Ayarlar.Prefix || ""}r vip @üye \`>\` Belirtilen üyeye **VIP** rolü verir/alır.
      ${Ayarlar.Prefix || ""}r muzisyen @üye \`>\` Belirtilen üyeye **Müzisyen** rolü verir/alır.
      ${Ayarlar.Prefix || ""}r vokal @üye \`>\` Belirtilen üyeye **Vokal** rolü verir/alır.
      ${Ayarlar.Prefix || ""}r terapist @üye \`>\` Belirtilen üyeye **Terapist** rolü verir/alır.
      ${Ayarlar.Prefix || ""}r streamer @üye \`>\` Belirtilen üyeye **Sorun Çözücü** rolü verir/alır.
      ${Ayarlar.Prefix || ""}r pianist @üye \`>\` Belirtilen üyeye **pianist** rolü verir/alır.
      ${Ayarlar.Prefix || ""}r designer @üye \`>\` Belirtilen üyeye **Lovers** rolü verir/alır.
       `))
      return;
  }

  if (zade === "vip") {
      let vipRol = message.guild.roles.cache.get(global.Perm.OzelKomutlar.VIP);
      if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
       if (vipRol && !member.roles.cache.has(global.Perm.OzelKomutlar.VIP)) {
           member.roles.add(vipRol)
           //message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${vipRol} rolü verdim.`))
           message.react(Others.Emojis.Check_Tick);
       } 
       if (vipRol && member.roles.cache.has(global.Perm.OzelKomutlar.VIP)) {
          member.roles.remove(vipRol)
         // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${vipRol} rolünü aldım.`))
          message.react(Others.Emojis.Check_Tick);
        } 
       if (!vipRol) {
           message.channel.send(olumsuz.setDescription(`VIP rolü bulunamadı.`))
           message.react(Others.Emojis.Check_Tick);
       }
  }

  if (zade === "muzisyen" || zade === "müzisyen" || zade === "musician") {
      let Musician = message.guild.roles.cache.get(global.Perm.OzelKomutlar.Musician);
      if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
       if (Musician && !member.roles.cache.has(global.Perm.OzelKomutlar.Musician)) {
           member.roles.add(Musician)
          // message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${Musician} rolü verdim.`))
           message.react(Others.Emojis.Check_Tick);
       } 
      if (Musician && member.roles.cache.has(global.Perm.OzelKomutlar.Musician)) {
          member.roles.remove(Musician)
         // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${Musician} rolünü aldım.`))
          message.react(Others.Emojis.Check_Tick);
        } 
      if (!Musician) {
           message.channel.send(olumsuz.setDescription(`Müzisyen rolü bulunamadı.`))
           message.react(Others.Emojis.Check_Tick);
       }
  }

  if (zade === "vokal" || zade === "vocal" || zade === "vocalist") {
      let vokalRol = message.guild.roles.cache.get(global.Perm.OzelKomutlar.Vocalist);
      if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
       if (vokalRol && !member.roles.cache.has(global.Perm.OzelKomutlar.Vocalist)) {
           member.roles.add(vokalRol)
          // message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${vokalRol} rolü verdim.`))
           message.react(Others.Emojis.Check_Tick);
       } 
      if (vokalRol && member.roles.cache.has(global.Perm.OzelKomutlar.Vocalist)) {
          member.roles.remove(vokalRol)
         // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${vokalRol} rolünü aldım.`))
          message.react(Others.Emojis.Check_Tick);
        } 
      if (!vokalRol) {
          message.channel.send(olumsuz.setDescription(`Vokal rolü bulunamadı.`))
           message.react(Others.Emojis.Check_Tick);
       }
  }

  if (zade === "terapist") {
      let terapistRol = message.guild.roles.cache.get(global.Perm.OzelKomutlar.Terapist);
      if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
       if (terapistRol && !member.roles.cache.has(global.Perm.OzelKomutlar.Terapist)) {
           member.roles.add(terapistRol)
          // message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${terapistRol} rolü verdim.`))
           message.react(Others.Emojis.Check_Tick);
       } 
      if (terapistRol && member.roles.cache.has(global.Perm.OzelKomutlar.Terapist)) {
          member.roles.remove(terapistRol)
         // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${terapistRol} rolünü aldım.`))
          message.react(Others.Emojis.Check_Tick);
        } 
      if (!terapistRol) {
           message.channel.send(olumsuz.setDescription(`Terapist rolü bulunamadı.`))
           message.react(Others.Emojis.Check_Tick);
       }
  }

  if (zade === "designer") {
      let designer = message.guild.roles.cache.get(global.Perm.OzelKomutlar.Designer);
      if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
       if (designer && !member.roles.cache.has(global.Perm.OzelKomutlar.Designer)) {
           member.roles.add(designer)
          // message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${sorunCözücüRol} rolü verdim.`))
           message.react(Others.Emojis.Check_Tick);
       } 
      if (designer && member.roles.cache.has(global.Perm.OzelKomutlar.Designer)) {
          member.roles.remove(designer)
         // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${sorunCözücüRol} rolünü aldım.`))
          message.react(Others.Emojis.Check_Tick);
        } 
      if (!designer) {
           message.channel.send(olumsuz.setDescription(`Sorun Çözücü rolü bulunamadı.`))
           message.react(Others.Emojis.Check_Tick);
       }
  }

  if (zade === "streamer") {
      let streamer = message.guild.roles.cache.get(global.Perm.OzelKomutlar.Streamer);
      if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
       if (streamer && !member.roles.cache.has(global.Perm.OzelKomutlar.Streamer)) {
           member.roles.add(streamer)
           //message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${loversRol} rolü verdim.`))
           message.react(Others.Emojis.Check_Tick);
       } 
      if (streamer && member.roles.cache.has(global.Perm.OzelKomutlar.Streamer)) {
          member.roles.remove(streamer)
         // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${loversRol} rolünü aldım.`))
          message.react(Others.Emojis.Check_Tick);
        } 
       if (!streamer) {
           message.channel.send(olumsuz.setDescription(`streamer rolü bulunamadı.`))
           message.react(Others.Emojis.Check_Tick);
       }
  }

  if (zade === "pianist" || zade === "piyanist") {
    let pianist = message.guild.roles.cache.get(global.Perm.OzelKomutlar.Pianist);
    if (!member.manageable) return message.channel.send(olumsuz.setDescription(`Bu üye üzerinde işlem gerçekleştiremiyorum.`)).then(x => x.delete({timeout: 10000}));
     if (pianist && !member.roles.cache.has(global.Perm.OzelKomutlar.Pianist)) {
         member.roles.add(pianist)
         //message.channel.send(olumlu.setDescription(`${member} adlı üyeye başarılı bir şekilde ${loversRol} rolü verdim.`))
         message.react(Others.Emojis.Check_Tick);
     } 
    if (pianist && member.roles.cache.has(global.Perm.OzelKomutlar.Pianist)) {
        member.roles.remove(pianist)
       // message.channel.send(olumlu.setDescription(`${member} adlı üyeden başarılı bir şekilde ${loversRol} rolünü aldım.`))
        message.react(Others.Emojis.Check_Tick);
      } 
     if (!pianist) {
         message.channel.send(olumsuz.setDescription(`pianist rolü bulunamadı.`))
         message.react(Others.Emojis.Check_Tick);
     }
}

};


exports.conf = {
  commands: ["rol", "r"],
  enabled: true,
  usage: "r vip/muzisyen/vokal/terapist/designer/streamer @üye",
};