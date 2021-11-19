const { MessageEmbed } = require('discord.js');
const Others = global.Others;

exports.run = async (client, message, args) => {
  if(!message.member.voice.channelID) return client.reply(message, "Herhangi bir kanalda değilsin.");
  let victim = message.mentions.members.first() || message.guild.member(args[0]);
  
  if(!victim) return client.reply(message, "Birisini etiketlemelisin.");
  if(!victim.voice.channelID) return client.reply(message, `Etiketlediğin kişi herhangi bir kanalda değil.`);
  
  if(victim.voice.channelID == message.member.voice.channelID) return client.reply(message, "Zaten aynı kanaldasınız.");
  
  let msg = await client.send(message.channel, victim, new MessageEmbed()
                      .setDescription(`${victim}, seni ${message.author} kişisi **${message.member.voice.channel.name}** kanalına çekmek istiyor. Kabul ediyor musun?`)).then(msg => msg);
  
  await msg.react(`✅`);
  const collector = await msg.createReactionCollector((reaction, user) => reaction.emoji.name == "✅" && user.id == victim.id, { max: 1, time: 25000 });
  
  collector.on("collect", async (reaction, user) => {
    if(message.member.voice.channelID && victim.voice.channelID) victim.voice.setChannel(message.member.voice.channel);
    let channel = message.guild.channels.cache.get(global.Perm.Transport.Log);
    if (channel) client.send(channel, new MessageEmbed().setColor(Others.Colors.positive).setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription(`${message.author}, ${victim} üyesini yanına **çekti**.`));
    msg.delete();
    collector.stop();
  });
  
  collector.on("end", collected => {
    collector.stop();
    msg.delete();
  });
};

exports.conf = {
  commands: ["çek", "getir", "gel"],
  enabled: true,
  usage: "çek @üye",
};