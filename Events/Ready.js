exports.execute = () => {
  console.log("Bot hazır!");
  if (global.Ayarlar.Statutes.Mod) global.client.user.setActivity(global.Ayarlar.Statutes.Mod).catch();
  console.log(global.client.guilds.cache.map(e => e.name));
};

exports.conf = {
  event: "ready"
};
