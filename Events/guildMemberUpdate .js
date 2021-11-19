const { MessageEmbed } = require("discord.js");

exports.execute = (eski, yeni) => {
  let tag = global.Perm.Defaults.Tag;
  let ikinciTag = global.Perm.Defaults.Secondary_Tag;
  let üye = yeni.client.guilds.cache.get(global.Ayarlar.Sunucu).member(yeni.id);
  let log = yeni.client.channels.cache.get(global.Perm.Defaults.Auto_Tag_Log);
  let cezalı = global.Perm.Jail.Role;
  let ekip = üye.guild.roles.cache.get(global.Perm.Defaults.Family_Role);
  let chat = yeni.client.channels.cache.get(global.Perm.Defaults.General_Chat);
  //let yetkiliRolleri = global.Perm.Defaults.Authorized2;
  let şüpheli = global.Perm.Suspect.Role;
  
  if (!eski.username.includes(tag) && yeni.username.includes(tag)) {
    if (global.Perm.Welcome.Unregistered.some(e => üye.roles.cache.has(e)) || üye.roles.cache.has(cezalı) || üye.roles.cache.has(şüpheli)) return;
    if (!üye.roles.cache.has(ekip.id)) üye.roles.add(ekip.id).catch(console.error);
    if (log) log.send(`${üye} tagımızı aldı ve aramıza katıldı, hoşgeldin!`).catch(console.error);
    üye.send(`Hey Selam! Tagımızı alıp ailemize katıldığın için sana <@&${global.Perm.Defaults.Family_Role}> Rolünü verdim. Tekrardan ailemize hoş geldin!`).catch(e => {});
    üye.setNickname(üye.displayName.replace(ikinciTag, tag)).catch(console.error);
    if (chat) chat.send(new MessageEmbed().setColor("RANDOM").setAuthor(üye.displayName, üye.user.avatarURL({dynamic: true})).setDescription(`${yeni} üyesi tagımızı alarak aramıza katılmaya hak kazandı, **hoşgeldin**! (kalp emojisi)`)).catch(console.error);
  } else if (eski.username.includes(tag) && !yeni.username.includes(tag)) {
    if (log) log.send(`${üye} tagımızı bıraktı, görüşürüz!`);
    üye.send(`Hey Selam! Tagımızı çıkardığın için senden <@&${global.Perm.Defaults.Family_Role}> Rolünü aldım. Tekrardan ailemize katılmak istersen tagımız. \`${global.Perm.Defaults.Tag}\``).catch(e => {});
    üye.setNickname(üye.displayName.replace(tag, ikinciTag)).catch(console.error);
    if (!global.Perm.Defaults.TagliAlim) {
      if (üye.roles.cache.has(ekip.id)) üye.roles.remove(ekip.id).catch(console.error);
	  let roles = üye.roles.cache.clone().filter(e => e.managed || e.position < ekip.position);
	  üye.roles.set(roles).catch();
      //üye.roles.remove(yetkiliRolleri).catch(console.error);
    } else {
      let roles = üye.roles.cache.clone().filter(e => e.managed).map(e => e.id);
	  roles.concat(global.Perm.Welcome.Unregistered);
      üye.roles.set(roles).catch();
    }
  }
};

exports.conf = {
  event: "userUpdate"
};