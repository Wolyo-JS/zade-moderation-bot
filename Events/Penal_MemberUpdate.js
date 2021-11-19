const Penal = require("../Schemas/Penal.js");

exports.execute = (oldMember, newMember) => {
  let guild = oldMember.guild;
  if(!newMember) return;
  if(oldMember.roles.cache.size == newMember.roles.cache.size) return;
  
  let changedRoles = oldMember.roles.cache.filter(e => !newMember.roles.cache.some(c => c.id == e.id)) || newMember.roles.cache.filter(e => !oldMember.roles.cache.some(c => c.id == e.id));
  let flag = changedRoles.some(e => e.id == global.Perm.Chat_Mute.Role || e.id == global.Perm.Voice_Mute.Role || e.id == global.Perm.Jail.Role);
  if(!flag) return;
  
  Penal.model.find({User: oldMember.id, Activity: true}, (err, res) => {
    if(err) return console.error(err);
    if(!res.length) return;
    
    res.forEach(e => {
      if((e.Type == "MUTE" || e.Type == "TEMP_MUTE") && !newMember.roles.cache.has(global.Perm.Chat_Mute.Role)) newMember.roles.add(global.Perm.Chat_Mute.Role);
      else if((e.Type == "VOICE_MUTE" || e.Type == "TEMP_VOICE_MUTE") && !newMember.roles.cache.has(global.Perm.Voice_Mute.Role)) newMember.roles.add(global.Perm.Voice_Mute.Role);
      else if((e.Type == "JAIL" || e.Type == "TEMP_JAIL")) {
          let roles = newMember.roles.cache.clone().filter(e => e.managed);
          newMember.roles.set(roles.set(global.Perm.Jail.Role, guild.roles.cache.get(global.Perm.Jail.Role))).catch();
      }
    })
  })
  
};

exports.conf = {
    event: "guildMemberUpdate"
}