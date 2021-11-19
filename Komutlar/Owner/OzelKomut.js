const OzelKomut = require("../../Schemas/OzelKomut.js");

exports.onLoad = function(client) {
  client.on("message", async message => {
    if (!message.guild || message.author.bot) return;
    let cmd = message.content.split(" ")[0];
    
    OzelKomut.model.find({ }).then(komutlar => {
      const komut = komutlar.find(x => cmd == x.Isim || cmd == global.Ayarlar.Prefix + x.Isim || x.Alternatifler.some(x => x == cmd) || x.Alternatifler.some(x => global.Ayarlar.Prefix + x == cmd));
      if (!komut) return;
      
      if (komut) {
          if (komut.Karaliste.length > 0 && komut.Karaliste.filter(item => message.guild.channels.cache.has(item)).some(item => message.channel.id == item)) return client.reply(message, "Bu komut " + komut.Karaliste.map(e => message.guild.channels.cache.get(e).toString()).join(", ") + " kanal(lar)ında kullanılamaz!");
          if (komut.Yetki.Kisiler.length > 0 && komut.Yetki.Kisiler.filter(item => client.users.cache.has(item)).some(e => message.author.id == e)) çalıştır();
          else if (komut.Yetki.Roller.length > 0 && komut.Yetki.Roller.filter(item => message.guild.roles.cache.has(item)).some(e => message.member.roles.cache.has(e))) çalıştır();
          else if (komut.Yetki.Izinler.length > 0 && komut.Yetki.Izinler.filter(item => global.perms[item]).some(e => message.member.hasPermission(e))) çalıştır();
          else if (komut.Yetki.Kisiler.length < 1 && komut.Yetki.Roller.length < 1 && komut.Yetki.Izinler.length < 1) çalıştır();
          else return client.reply(message, "bu komutu kullanmak için yeterli yetkiniz yok!");
          function çalıştır() {
            let args = message.content.split(" ").slice(1);
            let hedef = (komut.Hedef == 1 ? message.member : (komut.Hedef == 2 ? (message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(x => x.displayName == args.join(" ") || x.user.username == args.join(" "))) : null));
            if (komut.Tur == "Mesaj") {
              if (komut.Parametreler.Gonderilecek_Mesaj.length > 0) return client.send(message.channel, komut.Parametreler.Gonderilecek_Mesaj);
            } else if (komut.Tur == "Özel kod") {
              if (komut.Parametreler.Ozel_Kod.length > 0) return (async () => await eval(`(async () => { komut.parametreler.ozelKod.replace(new RegExp(client.token, "g"), "")) })()`))();
            } else {
              if (!hedef) return client.reply(message, "bir kişiyi etiketle!");
              if (komut.Parametreler.Verilecek_Roller.filter(a => message.guild.roles.cache.has(a)).length > 0) for (let id of komut.Parametreler.Verilecek_Roller) hedef.roles.add(id).catch(e => client.send(message.channel, "Hata oluştu, bu hatayı lütfen sunucu sahibine veya bot sahibine ulaştır.\n" + e.name + "\n" + e.message, { split: true }));
              if (komut.Parametreler.Alinacak_Roller.filter(a => message.guild.roles.cache.has(a)).length > 0) for (let id of komut.Parametreler.Alinacak_Roller) hedef.roles.remove(id).catch(e => client.send(message.channel, "Hata oluştu, bu hatayı lütfen sunucu sahibine veya bot sahibine ulaştır.\n" + e.name + "\n" + e.message, { split: true }));
              if (komut.Parametreler.Gonderilecek_Mesaj.length) client.send(message.channel, komut.Parametreler.Gonderilecek_Mesaj);
            }
          }
    }
    });
    
  });
}


exports.run = async(client, message, args) => {
const komut = new Object();
  if (!global.Ayarlar.Sahip.includes(message.author.id)) return;
  if (args[0] == "ekle") {
    message.delete();
    let mesaj = await message.channel.send("Özel komutun ismini yaz! (**60 saniye**, iptal etmek için **iptal**)");
    
    // özel komutun ismi; 
    message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
      .then(isim => {
      if (["iptal", "i", "İptal", "İ"].includes(isim.first().content)) {
        isim.first().delete();
        mesaj.delete();
        return message.channel.send("İptal edildi.")
      };
      OzelKomut.model.findOne({ Isim: isim.first().content, Alternatifler: { $in: [ isim.first().content ] } }, (err, res) => {
        if ((res && res.length > 0) || global.Commands.some(x => x.conf.commands.some(e => e == isim.first().content.includes(e)))) {
          mesaj.delete();
          isim.first().delete();
          return message.channel.send("**"+isim.first().content+"** isimli bir komut veya komutun alternatifi zaten var!");
        }
      });
      if (isim.first().content.length > 31) return message.channel.send("Uzunluk 31'dan fazla olmamalı, işlem iptal edildi!");
      komut.Isim = isim.first().content;
      isim.first().delete();
      mesaj.edit("Özel komutun alternatiflerini yazın. (birden fazla yazmak için virgül ile ayırın.) (**60 saniye**, iptal etmek için **iptal**)");
    
    // özel komutun alternatifleri; 
    message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
      .then(alternatifler => {
      if (["iptal", "i", "İptal", "İ"].includes(alternatifler.first().content)) {
        alternatifler.first().delete();
        mesaj.delete();
        return message.channel.send("İptal edildi.")
      };
      OzelKomut.model.findOne({ Alternatifler: { $in: [ alternatifler.first().content ] } }, (err, res) => {
      if ((res && res.length) || global.Commands.some(x => x.conf.commands.some(e => e == alternatifler.first().content.includes(e)))) {
        mesaj.delete();
        alternatifler.first().delete();
        return message.channel.send("**" + alternatifler.first().content.split(/, ?/g).find(x => res.some(e => e.Alternatifler.includes(x))) + "** isimde bir komutun alternatifi zaten var!");
      }
      });
      komut.Alternatifler = alternatifler.first().content.split(/, ?/g);
      alternatifler.first().delete();
      mesaj.edit("Özel komut prefix ile kullanılacaksa **evet**, prefixsiz kullanılacak ise **hayır** yazın. (**60 saniye**, iptal etmek için **iptal**)");
      
    // prefixli mi prefixsiz mi;
    message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
      .then(prefix => {
      if (["iptal", "i", "İptal", "İ"].includes(prefix.first().content)) {
        prefix.first().delete();
        mesaj.delete();
        return message.channel.send("İptal edildi.")
      } else if (["evet", "Evet", "e", "E", "yes", "ye", "Yes"].includes(prefix.first().content)) {
        komut.Prefix = true;
        prefix.first().delete();
        mesaj.edit("Özel komutun türünü yaz! (**rol/mesaj/özel kod**) (**60 saniye**, iptal etmek için **iptal**)");
      } else if (["hayır", "Hayır", "h", "n", "no", "No"].includes(prefix.first().content)) {
        komut.Prefix = false;
        prefix.first().delete();
        mesaj.edit("Özel komutun türünü yaz! (**rol/mesaj/özel kod**) (**60 saniye**, iptal etmek için **iptal**)");
      } else {
        mesaj.delete();
        prefix.first().delete();
        return message.channel.send("**evet** veya **hayır** yazmadığınız için işlem iptal edildi!")
      }
      
      // türü rol mesaj özel kod;
      message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
      .then(tür => {
        if (["iptal", "i", "İptal", "İ"].includes(tür.first().content)) {
        tür.first().delete();
        mesaj.delete();
        return message.channel.send("İptal edildi.")
      } else if (tür.first().content == "rol") {
        komut.Tur = "Rol";
        tür.first().delete();
        mesaj.edit("Tür **mesaj** ise gönderilecek mesajı, tür **rol** ise verilecek/alınacak rolleri ve gönderilecek mesajı, tür **özel kod** ise istediğiniz kodu yazın! (discord.js) İstemediğiniz seçenekler için **yok** yazabilirsiniz. Verilecek ve alınacak rollerden **en az 1 tanesine yok** yazabilirsiniz! Örneklerde verilen parametre sıralarını lütfen atlamayın. (**120 saniye**, iptal etmek için **iptal**)\n**Örnek(tür -> rol):**\n`gönderilecek mesaj: Başarılı! verilecek roller: 705472548430807172, 705472608782516305 alınacak roller: yok`\n**Örnek(tür -> mesaj):**\n`Bu bir tehdit mesajıdır!`\n**Örnek(tür -> özel kod):**\n```js\nlet embed = new Discord.MessageEmbed()\n.setTitle('Deneme embed başlığı')\n.setThumbnail(message.author.avatarURL({dynamic: true}))\n.setFooter(message.author.tag, message.author.avatarURL({dynamic: true}));\n\nmessage.channel.send(embed);```")      
      } else if (tür.first().content == "mesaj") {
        komut.Tur = "Mesaj";
        tür.first().delete();
        mesaj.edit("Tür **mesaj** ise gönderilecek mesajı, tür **rol** ise verilecek/alınacak rolleri ve gönderilecek mesajı, tür **özel kod** ise istediğiniz kodu yazın! (discord.js) İstemediğiniz seçenekler için **yok** yazabilirsiniz. Verilecek ve alınacak rollerden **en az 1 tanesine yok** yazabilirsiniz! Örneklerde verilen parametre sıralarını lütfen atlamayın. (**120 saniye**, iptal etmek için **iptal**)\n**Örnek(tür -> rol):**\n`gönderilecek mesaj: Başarılı! verilecek roller: 705472548430807172, 705472608782516305 alınacak roller: yok`\n**Örnek(tür -> mesaj):**\n`Bu bir tehdit mesajıdır!`\n**Örnek(tür -> özel kod):**\n```js\nlet embed = new Discord.MessageEmbed()\n.setTitle('Deneme embed başlığı')\n.setThumbnail(message.author.avatarURL({dynamic: true}))\n.setFooter(message.author.tag, message.author.avatarURL({dynamic: true}));\n\nmessage.channel.send(embed);```")      
      } else if (["özel kod", "Özel kod", "kod", "ök"].includes(tür.first().content)) {
        komut.Tur = "Özel kod";
        tür.first().delete();
        mesaj.edit("Tür **mesaj** ise gönderilecek mesajı, tür **rol** ise verilecek/alınacak rolleri ve gönderilecek mesajı, tür **özel kod** ise istediğiniz kodu yazın! (discord.js) İstemediğiniz seçenekler için **yok** yazabilirsiniz. Verilecek ve alınacak rollerden **en az 1 tanesine yok** yazabilirsiniz! Örneklerde verilen parametre sıralarını lütfen atlamayın. (**120 saniye**, iptal etmek için **iptal**)\n**Örnek(tür -> rol):**\n`gönderilecek mesaj: Başarılı! verilecek roller: 705472548430807172, 705472608782516305 alınacak roller: yok`\n**Örnek(tür -> mesaj):**\n`Bu bir tehdit mesajıdır!`\n**Örnek(tür -> özel kod):**\n```js\nlet embed = new Discord.MessageEmbed()\n.setTitle('Deneme embed başlığı')\n.setThumbnail(message.author.avatarURL({dynamic: true}))\n.setFooter(message.author.tag, message.author.avatarURL({dynamic: true}));\n\nmessage.channel.send(embed);```")
      } else {
        mesaj.delete();
        tür.first().delete();
        return message.channel.send("**rol**, **mesaj** veya **özel kod** yazmadığınız için işlem iptal edildi!")
      }
        
      //parametreler verilecek, alınacak roller, gönderilecek mesaj;
      message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 120000, errors: ["time"]})
        .then(parametreler => {
        if (["iptal", "i", "İptal", "İ"].includes(parametreler.first().content)) {
          parametreler.first().delete();
          mesaj.delete();
          return message.channel.send("İptal edildi.")
        };
        if (tür.first().content == "rol") {
          if (parametreler.first().content.split(/gönderilecek mesaj: ?|verilecek roller: ?|alınacak roller: ?/).slice(1).length != 3) {
          parametreler.first().delete();
          mesaj.delete();
          return message.channel.send("Parametreleri verilen örnekteki gibi kullanmadığınız için iptal edildi!");
          } else {
            let içerik = parametreler.first().content.split(/gönderilecek mesaj: ?|verilecek roller: ?|alınacak roller: ?/).slice(1);
            komut.Parametreler = {
              Gonderilecek_Mesaj: içerik[0].includes("yok") ? null : içerik[0],
              Verilecek_Roller: içerik[1].split(", ").filter(x => x.length),
              Alinacak_Roller: içerik[2].split(", ").filter(x => x.length),
              Ozel_Kod: ""
            };
            parametreler.first().delete();
            mesaj.edit("Yapılacak işlemler komutu kullanan kişiye yapılacaksa **1**, belirtilen (etiketlenen, id girilen vb.) kişiye yapılacaksa **2** yazın. (**60 saniye**, iptal etmek için **iptal**)");
          } 
        } else if (tür.first().content == "mesaj") {
          komut.Parametreler = {
            Gonderilecek_Mesaj: parametreler.first().content,
            Verilecek_Roller: [],
            Alinacak_Roller: [],
            Ozel_Kod: ""
          };
          mesaj.edit("Yapılacak işlemler komutu kullanan kişiye yapılacaksa **1**, belirtilen (etiketlenen, id girilen vb.) kişiye yapılacaksa **2** yazın. (**60 saniye**, iptal etmek için **iptal**)");;
        } else if (["özel kod", "Özel kod", "kod", "ök"].includes(tür.first().content)) {
          parametreler.first().delete();
          komut.Parametreler = {
            Gonderilecek_Mesaj: "",
            Verilecek_Roller: [],
            Alinacak_Roller: [],
            Ozel_Kod: parametreler.first().content
          };
          mesaj.edit("Yapılacak işlemler komutu kullanan kişiye yapılacaksa **1**, belirtilen (etiketlenen, id girilen vb.) kişiye yapılacaksa **2** yazın. (**60 saniye**, iptal etmek için **iptal**)");
        }
        
      // işlemler kime yapılacak;
      message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
        .then(işlemler => {
        if (["iptal", "i", "İptal", "İ"].includes(prefix.first().content)) {
        işlemler.first().delete();
        mesaj.delete();
        return message.channel.send("İptal edildi.")
      } else if (işlemler.first().content == "1") {
        komut.Hedef = (komut.Tur == "Mesaj" || komut.Tur == "Özel kod") ? 0 : 1;
        işlemler.first().delete();
        mesaj.edit("Komutu kimlerin kullanabileceğini yazmalısın! Eğer herkes kullansın istiyorsanız sadece **yok** yazmanız yeterli. İstemediğiniz seçenekler için **yok** yazabilirsiniz. Örneklerde verilen parametre sıralarını lütfen atlamayın. (**30 saniye**, iptal etmek için **iptal**)\n**Örnek =>**\n`kişiler: 460813657811582986, 343496705196556288 roller: 656149441710915604 izinler: MANAGE_GUILD, MANAGE_CHANNELS`")
      } else if (işlemler.first().content == "2") {
        komut.Hedef = (komut.Tur == "Mesaj" || komut.Tur == "Özel kod") ? 0 : 1;
        işlemler.first().delete();
        mesaj.edit("Komutu kimlerin kullanabileceğini yazmalısın! Eğer herkes kullansın istiyorsanız sadece **yok** yazmanız yeterli. İstemediğiniz seçenekler için **yok** yazabilirsiniz. Örneklerde verilen parametre sıralarını lütfen atlamayın. (**30 saniye**, iptal etmek için **iptal**)\n**Örnek =>**\n`kişiler: 460813657811582986, 343496705196556288 roller: 656149441710915604 izinler: MANAGE_GUILD, MANAGE_CHANNELS`")
      } else if (işlemler.first().content.includes("yok")) {
        komut.Hedef = 0;
        işlemler.first().delete();
        mesaj.edit("Komutu kimlerin kullanabileceğini yazmalısın! Eğer herkes kullansın istiyorsanız sadece **yok** yazmanız yeterli. İstemediğiniz seçenekler için **yok** yazabilirsiniz. Örneklerde verilen parametre sıralarını lütfen atlamayın. (**30 saniye**, iptal etmek için **iptal**)\n**Örnek =>**\n`kişiler: 460813657811582986, 343496705196556288 roller: 656149441710915604 izinler: MANAGE_GUILD, MANAGE_CHANNELS`")
      } else {
        mesaj.delete();
        işlemler.first().delete();
        return message.channel.send("**1**, **2** veya **yok** yazmadığınız için işlem iptal edildi!");
      }
      
      // kimler kullanabilecek;
      message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
        .then(kimler => {
        if (["iptal", "i", "İptal", "İ"].includes(kimler.first().content)) {
          kimler.first().delete();
          mesaj.delete();
          return message.channel.send("İptal edildi.")
        };
        if (kimler.first().content.startsWith("yok")) {
          komut.Yetki = {
            Kisiler: [],
            Roller: [],
            Izinler: []
          };
          kimler.first().delete();
          mesaj.edit("Komutun kullanılamayacak kanalları etiketlebelirt! Eğer bütün kanallarda kullanılsın istiyorsanız **yok** yazın. (**60 saniye**, iptal etmek için **iptal**)\n**Örnek =>** `#sohbet #öneri #destek`");
        }
        else if (kimler.first().content.split(/kişiler: ?|roller: ?|izinler: ?/).slice(1).length != 3) {
          kimler.first().delete();
          mesaj.delete();
          return message.channel.send("Parametreleri verilen örnekteki gibi kullanmadığınız için iptal edildi!");
        } else {
          let içerik = kimler.first().content.split(/kişiler: ?|roller: ?|izinler: ?/).slice(1);
          komut.Yetki = {
            Kisiler: içerik[0].includes("yok") ? null : içerik[0].split(", ").filter(x => x.length),
            Roller: içerik[1].includes("yok") ? null : içerik[1].split(", ").filter(x => x.length),
            Izinler: içerik[2].includes("yok") ? null : içerik[2].split(", ").filter(x => x.length)
          };
          kimler.first().delete();
          mesaj.edit("Komutun kullanılamayacak kanalları etiketlebelirt! Eğer bütün kanallarda kullanılsın istiyorsanız **yok** yazın. (**60 saniye**, iptal etmek için **iptal**)\n**Örnek =>** `#sohbet #öneri #destek`");
        };
        
      // hangi kanallarda kullanılabilecek;
      message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ["time"]})
        .then(karaliste => {
        if (["iptal", "i", "İptal", "İ"].includes(karaliste.first().content)) {
          karaliste.first().delete();
          mesaj.delete();
          return message.channel.send("İptal edildi.")
        };
        if (karaliste.first().content.includes("yok")) komut.Karaliste = [];
        else komut.Karaliste = karaliste.first().mentions.channels.filter(a => message.guild.channels.cache.has(a.id)).map(e => e.id).filter(x => x.length);
        karaliste.first().delete();
        mesaj.edit("Özel komut başarıyla oluşturuldu detaylara bakmak için `.özelkomut liste`!");
        let doc = new OzelKomut.model(komut);
        doc.save();
      }).catch(err => { f(err, mesaj, 60); });
      }).catch(err => { f(err, mesaj, 60); });
      }).catch(err => { f(err, mesaj, 60); });
      }).catch(err => { f(err, mesaj, 60); });
      }).catch(err => { f(err, mesaj, 60); });
    }).catch(err => { f(err, mesaj, 60) });
    }).catch(err => { f(err, mesaj, 60) });
    }).catch(err => { f(err, mesaj, 60) });
  } else if (args[0] == "sil") {
    let komutlar = await OzelKomut.model.find({ });
    if (!komutlar.length) return message.channel.send("Hiç özel komut bulunmuyor!");
    if (!args[1] || !komutlar.some(e => e.Isim == args[1] || e.Alternatifler.includes(args[1]))) return message.channel.send(args[1] ? "**"+args[1]+"** isimli bir özel komutum yok!" : "Bir özel komut ismi yaz!");
    OzelKomut.model.deleteMany({ Isim: args[1], Alternatifler: { $in: [ args[1] ] } }, (err, res) => {
      
    });
    message.channel.send("**"+args[1]+"** isimli komut silindi!");
  } else if (args[0] == "liste") {
    let komutlar = await OzelKomut.model.find({ });
    if (komutlar.length < 0) return message.channel.send("Hiç özel komut bulunmuyor!");
    if (!args[1]) {
      message.channel.send(`# Özel komutun bilgilerine bakmak için ".özelkomut liste <numara>" yazın!\n\n${komutlar.map((e, i) => `["${i}"] => İsim: "${e.Isim}" | Tür: "${e.Tur}" | Prefixli: "${e.Prefix ? "+" : "-"}"`).join("\n")}`, { code: "xl", split: true })
    } else {
      if (isNaN(args[1]) || !komutlar[args[1]]) return message.channel.send("**"+args[1]+"** numaralı bir özel komut yok!");
      let komut = komutlar[args[1]];
      console.log(komut)
      let str = "", str2 = "";
      if (komut.Tur == "mesaj") {
        str += `| Gönderilecek mesaj: ${komut.Parametreler.Gonderilecek_Mesaj}`
      } else if (komut.Tur == "özel kod") {
      } else {
        if (komut.Parametreler.Gonderilecek_Mesaj) str += `\n | Gönderilecek mesaj: ${komut.Parametreler.Gonderilecek_Mesaj}\n`;
        if (komut.Parametreler.Verilecek_Roller && komut.Parametreler.Verilecek_Roller.length > 0) str += ` | Verilecek roller: ${komut.Parametreler.Verilecek_Roller.filter(a => message.guild.roles.cache.has(a)).length ? komut.Parametreler.Verilecek_Roller.filter(a => message.guild.roles.cache.has(a)).map(e => message.guild.roles.cache.get(e).name).join(", ") : "Yok!"}\n`
        if (komut.Parametreler.Alinacak_Roller && komut.Parametreler.Alinacak_Roller.length > 0) str += ` | Alınacak roller: ${komut.Parametreler.Alinacak_Roller.filter(a => message.guild.roles.cache.has(a)).length ? komut.Parametreler.Alinacak_Roller.filter(a => message.guild.roles.cache.has(a)).map(e => message.guild.roles.cache.get(e).name).join(", ") : "Yok!"}`
      }
      if (komut.Yetki.Kisiler.length > 0) str2 += `| Kişiler: ${komut.Yetki.Kisiler.filter(a => client.users.cache.has(a)).length > 0  ? komut.Yetki.Kisiler.filter(a => client.users.cache.has(a)).map(e => client.users.cache.get(e).tag).join(", ").replace(/'/, "").replace(/"/, "") : "Yok!"}\n`;
      if (komut.Yetki.Roller.length > 0) str2 += ` | Roller: ${komut.Yetki.Roller.filter(a => message.guild.roles.cache.has(a)).length > 0 ? komut.Yetki.Roller.filter(a => message.guild.roles.cache.has(a)).map(e => message.guild.roles.cache.get(e).name).join(", ").replace(/'/, "").replace(/"/, "") : "Yok!"}\n`;
      if (komut.Yetki.Izinler.length > 0) str2 += ` | İzinler: ${komut.Yetki.Izinler.filter(a => global.perms.hasOwnProperty(a)).length > 0 ? komut.Yetki.Izinler.filter(a => global.perms.hasOwnProperty(a)).map(e => global.perms[e]).join(", ").replace(/'/, "").replace(/"/, "") : "Yok!"}`;
      message.channel.send(
`"İsim": ${komut.Isim}
"Tür": ${komut.Tur}
"Alternatifler": ${komut.Alternatifler.length > 0 ? komut.Alternatifler.join(", ") : "Yok!"}
"Prefixli mi?": ${komut.prefix ? "Evet" : "Hayır"}
"İşlemler kime yapılacak?": ${komut.Hedef == 1 ? "Komutu kullanan kişiye" : (komut.Hedef == 2 ? "Belirtilen kişiye (etiket, id)" : "Tür mesaj veya özel kod olduğu için devre dışı.")}
"Kullanılamayacak kanallar": ${komut.Karaliste.length > 0 ? komut.Karaliste.filter(a => message.guild.channels.cache.has(a)).map(e => message.guild.channels.cache.get(e).name).join(", ") : "Yok!"}
"Yapılacak işlemler": ${str.length ? str.replace(/'/, "").replace(/"/, "") : "Bu komut özel bir kod ile çalışıyor! ('discord.js')"}
"Kullanabilecek yetkiler:" ${str2.length ? "\n "+str2.replace(/'/, "").replace(/"/, "") : "Herkese açık!"}`, { code: "py", split: true })
    }
  } else {
    return message.channel.send("**ekle**, **sil** veya **liste** yazmalısın!");
  }
  function f(b, c, d) {
    console.log(b); 
    c.delete(); 
    message.channel.send(`Bir hata oluştu, muhtemelen **${d} saniye** içinde cevap vermediğiniz için iptal edildi.`);
    return true;
  }
};

exports.conf = {
  commands: ["özelkomut", "ök", "ok"],
  enabled: false,
  usage: "özelkomut ekle/düzenle/sil/liste"
}