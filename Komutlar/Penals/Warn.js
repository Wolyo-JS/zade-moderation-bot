const { MessageEmbed } = require("discord.js");
const Penal = require("../../Schemas/Penal.js");
const penalPoints = require("../../Schemas/Cezapuan.js");
const Others = require("../../Ayarlar/Others.json");
const Guild = require("../../Schemas/Guild.js");

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Warn.Auth_Roles.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");
  
  switch (args[0]) {
    case "liste": {
		
      let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
      if(!victim) victim = message.member;

      Penal.model.find({ User: victim.id, Activity: true, Type: "WARN" }, (err, res) => {
          res = !res ? [] : res;
          let embed = new MessageEmbed()
                     .setColor(Others.Colors.positive)
                     .setAuthor(`${victim.displayName} ${(res.length <= 0) ? "uyarısı yok!" : `${res.length} adet uyarısı var!`}`, (victim.user ? victim.user : victim).avatarURL({ dynamic: true }))
                     .setDescription(`Uyarılar hakkında daha detaylı bilgi edinmek istiyorsan, kişinin sicilini kontrol et.`);
        
          if(res.length > 0){
            res.reverse();
            let son = res[0];
            embed.addField("Öne Çıkan Uyarılar", `> **Son Uyarı**\n<@${son.Admin}>: ${son.Reason}\n\n> **Son 5 Uyarı**\n${res.map((e, i) => `${res.length - i}. <@${e.Admin}>: ${e.Reason}`).join("\n")}`); // tasarım deneyeceğim
          }
          client.send(message.channel, embed);
        })
      break;
    }
    case "sıfırla": {
      let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
      if(!victim) return client.reply(message, `birisini susturmak istiyorsan önce onu etiketlemelisin.\n\n**Doğru kullanım:** \`${this.conf.usage}\``);
      
      if(victim.roles && victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
      
      Penal.model.findOne({ User: victim.id, Activity: true, Type: "WARN" }, async (err, res) => {
        if (err) throw err;
        if (!res || !res.length) return client.reply(message, "etiketlediğin kişinin hiç uyarısı yok.");

        let msg = await client.reply(message, `**${victim.displayName}** üyesinin **${res.length}** adet aktif uyarısını sıfırlamak istediğine emin isen **15 saniye** içinde **evet** veya **hayır** yaz!`);
        message.channel.awaitMessages(m => m.author.id == message.author.id && ["evet", "onay", "e", "o", "h", "hayır", "hayir"].some(x => message.content.match(new RegExp(x, "mgi"))), { max: 1, time: 15000, errors: [ "time" ]})
        .then(async collected => {
          Penal.model.updateMany({ User: victim.id, Activity: true, Type: "WARN" }, { Activity: false }, { Activity: false }, (err, res) => {
            return client.reply(message, `${victim} üyesinin başarı ile tüm aktif uyarıları sıfırlandı!`);
          });
        })
        .catch(err => {
          client.reply(message, "zamanında cevap vermediniz veya verilen parametrelerden farklı bir şey yazdınız!");
          message.delete();
          msg.delete();
          throw err;
        })
        
      });
      
      break;
    }
    default: {
      let victim = message.mentions.members.first() || message.guild.member(args[0]) || await client.getUser(args[0]);
      if(!victim) return client.reply(message, `birisini susturmak istiyorsan önce onu etiketlemelisin.\n\n**Doğru kullanım:** \`${this.conf.usage}\``);
      let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: victim.id });
 
      let trusteds = await Guild.model.findOne({ Id: message.guild.id, Trusted_Members: {$in: [victim.id]} });
  
      if (!global.Ayarlar.Sahip.includes(message.author.id) && message.author.id != message.guild.ownerID && global.Perm.Defaults.Better_Moderation && (trusteds && trusteds.Trusted_Members.includes(victim.id))) return client.reply(message, "sunucuda ekstra koruma sistemi açık, güvenli kişilere dokunamazsın!");
  
      if(victim.roles && victim.roles.highest.position >= message.member.roles.highest.position) return client.reply(message, "etiketlediğin kişi senden yüksek bir pozisyona sahip, onu cezalandıramazsın!");
      
      let reason = args.splice(2).join(" ") || "Sebepsiz";


      if (!pData) {
        let pointData = new penalPoints({ guildID: message.guild.id, userID: victim.id, point: 8 });
        pointData.save();
    } else {
        pData.point = pData.point + 8;
        pData.save();
    }

      Penal.model.countDocuments().then(async number => {
        let inc = number + 1, currentDate = Date.now();
        new Penal.model({
          Id: inc,
          Type: "WARN",
          User: victim.id,
          Admin: message.author.id,
          Activity: true,
          Reason: reason,
          Date: currentDate,
        }).save();

        if (victim.roles && !victim.roles.cache.has(global.Perm.Warn.Role)) {
		  victim.roles.add(global.Perm.Warn.Role).catch();
        }
		global.updateUser(message.author.id, "Warn", 1);
                
        client.send(message.channel, `${victim} **"${reason}"** sebebi ile uyarıldı. (Ceza Numarası: \`#${inc}\`)`);
        client.channels.cache.get(global.Perm.Defaults.CpuanLog).send(`${victim}: aldığınız **#${inc}** ID'li ceza ile **${pData.point ?? 0}** ceza puanına ulaştınız.`).catch(e => { })  

         let embed = new MessageEmbed()
            .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(`${message.author}, ${victim}(${victim.id}) kişisini **"${reason}"** sebebi ile **uyardı**.`)
            .addField("Ceza Bilgisi", `**Ceza Numarası:** \`#${inc}\`\n**Ceza Tipi:** \`Uyarma\`\n**Tarih:** ${require("moment")(Date.now()).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`)
            .setColor(Others.Colors.negative);
        
         let channel = message.guild.channels.cache.get(global.Perm.Warn.Log);
         if (channel) client.send(channel, embed);
      });
      
      break;
    } 
  }
};

exports.conf = {
  commands: ["uyarı", "uyar", "warn"],
  enabled: true,
  usage: "uyarı (sıfırla|liste) @üye sebep",
};