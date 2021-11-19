exports.execute = guild => {
  global.Ayarlar.Sahip.forEach(x => x.send(`${guild.name} ${guild.id} sunucusuna eklendim ve otomatik olarak sunucudan çıktım. sunucu sahibi: ${guild.owner.user.tag} ${guild.owner.user.id} ${guild.me.hasPermission("CREATE_INSTANT_INVITE") ? (guild.channels.cache.random().createInvite().then(e => e.url)) : "davet oluşturma yetkim yok"}`));
    console.log(guild);
    guild.leave();
}

exports.conf = {
  event: "guildCreate"
}