exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(x => message.member.roles.cache.has(x))) return client.reply(message, "yetkiniz yok!");
 
  if(!args[0] || (args[0] && isNaN(args[0])) || Number(args[0]) < 1 || Number(args[0]) > 100) 
  return message.channel.send("1-100 arasında silinecek mesaj miktarı belirtmelisin!").then(x => x.delete({timeout: 5000}));
  await message.delete().catch(e => { });
  await message.channel.bulkDelete(Number(args[0])).then(msjlar => message.channel.send(`Başarıyla **${msjlar.size}** adet mesaj silindi!`).then(x => x.delete({timeout: 5000}))).catch(e => { });

};

exports.conf = {
    commands: ["temizle", "sil", "clear", "purge"],
    enabled: true,
    usage: "temizle 1-200",
};