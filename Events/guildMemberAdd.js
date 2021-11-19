const Penal = require("../Schemas/Penal");
const Discord = require("discord.js");
const Guild = require("../Schemas/Guild.js");

exports.execute = async (member) => {
  if(member.user.bot) return;
  
  let channel = member.client.channels.cache.get(global.Perm.Welcome.Log);
  let fake = (Date.now() - member.user.createdTimestamp) < (1000 * 60 * 60 * 24 * global.Perm.Suspect.Days);

  if(fake){
    member.roles.set([global.Perm.Suspect.Role]).catch();
  //  if (channel) global.client.send(channel, makeToMessage(member, fake));
    return;
  }
  let Roles = [];
  let res = await Penal.model.find({Activity: true, User: member.id}).exec();
     let penals = res;
    
    let jail = penals.some(e => e.Type == "TEMP_JAIL" || e.Type == "JAIL");
    if(jail){
      let roles = member.roles.cache.clone().filter(e => e.managed);
      member.roles.set(roles.set(global.Perm.Jail.Role, member.guild.roles.cache.get(global.Perm.Jail.Role))).catch();
      return;
    }

    let mute = penals.some(e => e.Type == "MUTE" || e.Type == "TEMP_MUTE");
    if(mute) Roles.push(global.Perm.Chat_Mute.Role);
    let voiceMute = penals.some(e => e.Type == "VOICE_MUTE" || e.Type == "TEMP_VOICE_MUTE");
    if(voiceMute){
      let role = member.guild.roles.cache.get(global.Perm.Voice_Mute.Role);
      if(role) Roles.push(role.id);
    }
	//global.Perm.Welcome.Unregistered.forEach(role => Roles.push(role));
	Roles = Roles.concat(global.Perm.Welcome.Unregistered)
	console.log(Roles);
	await member.roles.set(Roles).catch();
    
    if (global.Perm.Defaults.Auto_Tag) member.setNickname(`${member.user.username.includes(global.Perm.Defaults.Tag) ? `${global.Perm.Defaults.Tag} İsim${global.Perm.Defaults.Ayrac}Yaş` : `${global.Perm.Defaults.Secondary_Tag} İsim${global.Perm.Defaults.Ayrac}Yaş`}`)
 //   global.client.send(channel, global.Perm.Register.Auth_Roles.map(x => `|| <@&${x}> ||`).join(" ") || ".", makeToMessage(member, fake));

};

exports.conf = {
  event: "guildMemberAdd"
};

/*function makeToMessage(member, fake){
  let embed = new Discord.MessageEmbed()
  .setImage(global.Perm.Welcome.GIF.length > 0 ? global.Perm.Welcome.GIF : null)
  .setAuthor(member.user.username, member.user.avatarURL({dynamic: true}))
  .setColor("RANDOM");
  let emojis = global.Perm.Welcome.Emojis;
  embed.setDescription(
`${emojis[0]} ${member} üyesi sunucumuza katıldı, artık \`${member.guild.memberCount}\` kişiyiz!
${emojis[1]} Hesabının kuruluş tarihi; **${require("moment")(member.user.createdAt).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}**
${emojis[2]} Şu anda ${global.Perm.Defaults.TagliAlim ? "**taglı alımdayız**, **tagı alarak** ve ses odalarında **teyit vererek** kaydolabilirsin!" : "**tagsız alımdayız**, ses odalarında **teyit vererek** kaydolabilirsin!"}
${emojis[3]} ${global.Perm.Register.Auth_Roles.map(x => `<@&${x}>`).join(", ") || "..."} rolündeki yetkililer seninle ilgilenecektir.
${emojis[4]} **Hesabın:** ${fake ? emojis[6] : emojis[5]}`);
  return embed;
}*/