const { MessageEmbed } = require("discord.js");
const Register = require('../../models/Register.js');
const User = require("../../Schemas/User.js");
const Penal = require("../../Schemas/Penal.js");
const penalPoints = require("../../Schemas/Cezapuan.js");

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Register.Auth_Roles.some(e => message.member.roles.cache.has(e))) return;

  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
  if (!member) return message.channel.send("İsmi değiştirilecek kullanıcıyı belirtin.");
  const nick = args.slice(1).filter(arg => isNaN(arg)).map(arg => arg[0].toUpperCase() + arg.slice(1).toLowerCase()).join(" ");
  if (!nick) return message.channel.send("Yeni ismi belirtin.");
  if (nick && (await client.chatKoruma(nick))) return message.reply('Reklam yazma anneni deşerim')
  const age = args.slice(1).filter(arg => !isNaN(arg))[0] ?? undefined;
  if (!age || isNaN(age)) return message.channel.send("Geçerli bir yaş belirtin.");
  if (message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send(`Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`).then(x => x.delete({timeout: 5000}));
  if(nick.length > 30) return client.reply(message, "isim ya da yaş ile birlikte toplam 30 karakteri geçecek bir isim giremezsin.")
  if (age < global.Perm.Defaults.Age_Limit) return message.channel.send(`Kayıt ettiğin üyenin yaşı ${global.Perm.Defaults.Age_Limit}'(t(d)(a(e)n küçük olamaz.`);
  if (age > 99) return message.channel.send(`Kayıt ettiğin üyenin yaşı iki basamakdan büyük olamaz.`);
  
  /*if(!member.user.username.includes(global.Perm.Defaults.Tag) && !member.roles.cache.has(global.Perm.Defaults.Booster_Role) && !member.roles.cache.has(global.Perm.OzelKomutlar.VIP)) {
    message.channel.send(`${member} isimli üyenin kullanıcı adında tagımız (\`${global.Perm.Defaults.Tag}\`) olmadığı, <@&${global.Perm.Defaults.Booster_Role}>, <@&${global.Perm.OzelKomutlar.VIP}> Rolü olmadığı için kayıt işlemi iptal edildi.`)
    return;
    }*/

  let ban = await Penal.model.countDocuments({ User: member.id, Activity: false, Type: "BAN" });
  let kick = await Penal.model.countDocuments({ User: member.id, Activity: false, Type: "KICK" });
  let uyarılar = await Penal.model.countDocuments({ User: member.id, Activity: true, Type: "WARN" });
  let jail = await Penal.model.countDocuments({ User: member.id, Activity: false, Type: "JAIL" });
  let mute = await Penal.model.countDocuments({ User: member.id, Activity: false, Type: "TEMP_MUTE" });
  let voicemute = await Penal.model.countDocuments({ User: member.id, Activity: false, Type: "TEMP_VOICE_MUTE" });
  let pData = await penalPoints.findOne({ guildID: message.guild.id, userID: member.id });

  if (
    pData.point >= global.Perm.Defaults.Point_Limit &&
    !message.member.roles.cache.some(role => message.guild.roles.cache.get(global.Perm.Defaults.Ust_Yetkili).rawPosition <= role.rawPosition)
  ) {
    const embed = new MessageEmbed()
.setAuthor(member.user.tag, member.user.avatarURL({ dynamic: true }))
.setColor("RANDOM")
.setDescription(`
🚫 ${member.toString()} kişisinin toplam ${pData.point} ceza puanı 
olduğu için kayıt işlemi iptal edildi. Sunucumuzda tüm 
işlemlerin kayıt altına alındığını unutmayın. Sorun Teşkil eden, 
sunucunun huzurunu bozan ve kurallara uymayan kullanıcılar 
sunucumuza kayıt olamazlar. 
Belirtilen üye toplamda ${ban} adet ban, ${kick} adet kick, ${jail} adet cezalı,
${mute} adet chat-mute, ${voicemute} adet voice-mute, ${uyarılar} adet uyarı almış.
       
Eğer konu hakkında bir şikayetiniz var ise <@&${global.Perm.Defaults.Ust_Yetkili}>
rolü ve üstlerine ulaşabilirsiniz.
`)
    return message.channel.send(embed)
  }

  /*if (
    puan >= 100 &&
    !message.member.roles.cache.some(role => message.guild.roles.cache.get(global.Perm.Defaults.Ust_Yetkili).rawPosition <= role.rawPosition)
  ) {
    const embed = new MessageEmbed()
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .setDescription(`Bu üyenin ceza puanı ${puan} Bu sebepten ötürü üyenin kaydı \n gerçekleştirelemedi. \n\n Belirtilen üye toplamda ${jail} adet cezalı, ${mute} adet chat-mute, ${ses} adet \n voice-mute almış Lütfen <@&${global.Perm.Defaults.Ust_Yetkili}> ve üstündeki bir yetkiliye \n ulaşın.`)
    return message.channel.send(embed)
  }*/

  const newnick = `${member.user.username.includes(global.Perm.Defaults.Tag) ? global.Perm.Defaults.Tag : (global.Perm.Defaults.Secondary_Tag ? global.Perm.Defaults.Secondary_Tag : (global.Perm.Defaults.Secondary_Tag || ""))} ${nick} | ${age}`;
  await member.setNickname(newnick);

  const nickData = {
    nick: newnick,
    type: "İsim Değiştirme"
  };

  let registerModel = await Register.findOne({
    guildId: message.guild.id, 
    userId: member.user.id
  });
  if (!registerModel) registerModel = await Register.create({
      guildId: message.guild.id,
      userId: member.user.id,
      totalRegister: 0,
      womanRegister: 0,
      manRegister: 0,
      userNames: []
    });

/*${newnick}*/
  const embed = new MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
    .setColor("RANDOM")
    .setFooter(`Üyenin ceza puanı ${pData.point ?? 0}`)
    .setDescription(
`${member.toString()} kişisinin adı başarıyla "${nick} | ${age}" olarak değiştirildi. Bu üye daha önce şu isimlerle kayıt olmuş:\n\n` +
`<a:kirmizitik:809041906990448670> Kişinin Toplamda ${registerModel?.userNames?.length ?? 0} isim kayıtı bulundu.\n` +
 (registerModel?.userNames?.map(x => `\`• ${x.nick}\` (${x.type.replace(`Erkek`, `<@&${global.Perm.Register.Man[0]}>`).replace(`Kız`, `<@&${global.Perm.Register.Woman[0]}>`)})`).join("\n ") || "Daha önce kayıt olmamış.") + "\n\n" +
`Kişinin önceki isimlerine \`${Ayarlar.Prefix}isimler @üye\` komutuyla bakarak kayıt işlemini gerçekleştirmeniz önerilir.` 
);

  await message.channel.send(embed);

  const onay = await message.channel.awaitMessages((m) => m.author.id == message.author.id && ["e", "k", "iptal"].some(cevap => m.content.toLowerCase().includes(cevap)), {max: 1, time: 1000 * 15 });
  if (onay.size < 1) {
    await Register.updateOne({
      guildId: message.guild.id, 
      userId: member.user.id
    }, {
      userNames: [ ...registerModel.userNames, nickData ]
    });
    return message.channel.send(embed.setDescription(`${member.toString()} adlı üyenin kaydı herhangi bir işlem yapılmadığından dolayı iptal edildi.`)).then(x => x.delete({timeout: 5000}));
  }

  
    let kullanici = message.mentions.users.first() || client.users.cache.get(args[0]) || (args.length > 0 ? client.users.cache.filter(e => e.username.toLowerCase().includes(args.join(" ").toLowerCase())).first(): message.author) || message.author;
    let uye = message.guild.member(kullanici);
  const onayContent = onay.first().content.toLowerCase();

  if (onayContent.includes(".e")) {
    let staffData = await Register.findOne({ guildId: message.guild.id, userId: message.author.id });
    if (!staffData) staffData = new Register({
      guildId: message.guild.id,
      userId: message.author.id,
      totalRegister: 1,
      womanRegister: 0,
      manRegister: 1,
      userNames: []
    });
    staffData.totalRegister++
    staffData.manRegister++
    await staffData.save();
    nickData.type = "Erkek";
    await Register.updateOne({
      guildId: message.guild.id, 
      userId: member.user.id
    }, {
      userNames: [ ...registerModel.userNames, nickData ]
    });

    /*await member.roles.add(global.Perm.Register.Man)
    await member.roles.remove(global.Perm.Welcome.Unregistered)
    await member.roles.remove(global.Perm.Register.Woman)*/

    let roles = member.roles.cache.clone().filter(e => e.managed).map(e => e.id).concat(global.Perm.Register.Man);
    if(member.user.username.includes(global.Perm.Defaults.Tag)) roles.push(global.Perm.Defaults.Family_Role)
    member.roles.set(roles).catch();
   
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .setDescription(`${member.toString()} üyesine ${global.Perm.Register.Man.map(x => `<@&${x}>`)} rolleri verildi.`).setFooter(`Üyenin ceza puanı ${pData.point ?? 0}`);
    message.channel.send(embed)//.then(x => x.delete({timeout: 5000}))
    if (global.Perm.Defaults.General_Chat && client.channels.cache.has(global.Perm.Defaults.General_Chat)) client.channels.cache.get(global.Perm.Defaults.General_Chat).send(`Aramıza yeni biri katıldı! ${member.toString()} ona hoş geldin diyelim!`)
  }

  if (onayContent.includes(".k")) {
    let staffData = await Register.findOne({ guildId: message.guild.id, userId: message.author.id });
    if (!staffData) staffData = new Register({
      guildId: message.guild.id,
      userId: message.author.id,
      totalRegister: 1,
      womanRegister: 0,
      manRegister: 1,
      userNames: []
    });
    staffData.totalRegister++
    staffData.womanRegister++
    await staffData.save();
    nickData.type = "Kız";
    await Register.updateOne({
      guildId: message.guild.id, 
      userId: member.user.id
    }, {
      userNames: [ ...registerModel.userNames, nickData ]
    });
   
   await member.roles.add(global.Perm.Register.Woman)
    await member.roles.remove(global.Perm.Welcome.Unregistered)
    await member.roles.remove(global.Perm.Register.Man)
   
    /*let roles = member.roles.cache.clone().filter(e => e.managed).map(e => e.id).concat(global.Perm.Register.Woman);
    if(member.user.username.includes(global.Perm.Defaults.Tag)) roles.push(global.Perm.Defaults.Family_Role)
    member.roles.set(roles).catch();*/

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .setDescription(`${member.toString()} üyesine ${global.Perm.Register.Woman.map(x => `<@&${x}>`)} rolleri verildi.`).setFooter(`Üyenin ceza puanı ${pData.point ?? 0}`);
    message.channel.send(embed)//.then(x => x.delete({timeout: 5000}))
    if (global.Perm.Defaults.General_Chat && client.channels.cache.has(global.Perm.Defaults.General_Chat)) client.channels.cache.get(global.Perm.Defaults.General_Chat).send(`Aramıza yeni biri katıldı! ${member.toString()} ona hoş geldin diyelim!`)
  }

  if (onayContent.includes(".iptal")) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .setDescription(`${member.toString()} adlı kullanıcının kayıt işlemi iptal edildi.`);
    await Register.updateOne({
      guildId: message.guild.id, 
      userId: member.user.id
    }, {
      userNames: [ ...registerModel.userNames, nickData ]
    });
    message.channel.send(embed);
  }

}


exports.conf = {
  commands: ["name", "nick", "isim"],
  enabled: true,
  usage: "isim <@etiket/ID> İsim Yaş"
};
