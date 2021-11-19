const Penal = require("../Schemas/Penal.js");

exports.execute = () => {
  setInterval(() => {
     checkPenal(); 
  }, 60000);
};

exports.conf = {
    event: "ready"
}


function checkPenal() {
  let guild = global.client.guilds.cache.first();
  Penal.model.find({Activity: true}, async (err, docs) => {
    if(err || !docs) return;
    docs.forEach(doc => {
      let member = guild.member(doc.User);
      if(!member) return;
      
      if((doc.Type == "TEMP_MUTE" || doc.Type == "MUTE") && !member.roles.cache.has(global.Perm.Chat_Mute.Role)) member.roles.add(global.Perm.Chat_Mute.Role);
      if((doc.Type == "TEMP_JAIL" || doc.Type == "JAIL") && !member.roles.cache.has(global.Perm.Jail.Role)) member.roles.add(global.Perm.Jail.Role);
      if((doc.Type == "TEMP_VOICE_MUTE" || doc.Type == "VOICE_MUTE")) {
        if(member.voice.channelID && !member.voice.serverMute) member.voice.setMute(true);
        if(!member.roles.cache.has(global.Perm.Voice_Mute.Role)) member.roles.add(global.Perm.Voice_Mute.Role).catch();
      }
    })
    
    docs.filter(e => e.Temporary == true && Date.now() > e.Finish).forEach(penal => {
        let member = guild.member(penal.User);
        if (!member) return;
        if(penal.Type == "TEMP_VOICE_MUTE" || penal.Type == "VOICE_MUTE"){
          if(member.voice.channelID) member.voice.setMute(false);
          if(member.roles.cache.has(global.Perm.Voice_Mute.Role)) member.roles.remove(global.Perm.Voice_Mute.Role).catch();
        }
        if((penal.Type == "TEMP_MUTE" || penal.Type == "MUTE") && member.roles.cache.has(global.Perm.Chat_Mute.Role)) member.roles.remove(global.Perm.Chat_Mute.Role).catch();
        if((penal.Type == "TEMP_JAIL" || penal.Type == "JAIL") && member.roles.cache.has(global.Perm.Jail.Role)) member.roles.remove(global.Perm.Jail.Role).catch();
    });
    
    Penal.model.updateMany({"Activity": true, "Temporary": true, "Finish": {$lte: Date.now()}}, {$set: {Activity: false}}, (err2, res) => {
      console.log(`${new Date().toLocaleString()} - Is it control? That job is already over. :D`);
    });
  })
  
  guild.members.fetch().then(members => {
    members.filter(member => member.roles.cache.size == 1 && member.roles.cache.first().id == guild.id).forEach(member => {
      member.roles.add(global.Perm.Welcome.Unregister).catch();
    });
  })
}

exports.execute = () => {
  setInterval(() => {
     checkPenal(); 
  }, 60000);
};

exports.conf = {
    event: "ready"
}


function checkPenal() {
  let guild = global.client.guilds.cache.first();
  Penal.model.find({Activity: true}, async (err, docs) => {
    if(err || !docs) return;
    docs.forEach(doc => {
      let member = guild.member(doc.User);
      if(!member) return;
      
      if((doc.Type == "TEMP_MUTE" || doc.Type == "MUTE") && !member.roles.cache.has(global.Perm.Chat_Mute.Role)) member.roles.add(global.Perm.Chat_Mute.Role);
      if((doc.Type == "TEMP_JAIL" || doc.Type == "JAIL") && !member.roles.cache.has(global.Perm.Jail.Role)) member.roles.add(global.Perm.Jail.Role);
      if((doc.Type == "TEMP_VOICE_MUTE" || doc.Type == "VOICE_MUTE")) {
        if(member.voice.channelID && !member.voice.serverMute) member.voice.setMute(true);
        if(!member.roles.cache.has(global.Perm.Voice_Mute.Role)) member.roles.add(global.Perm.Voice_Mute.Role).catch();
      }
    })
    
    docs.filter(e => e.Temporary == true && Date.now() > e.Finish).forEach(penal => {
        let member = guild.member(penal.User);
        if (!member) return;
        if(penal.Type == "TEMP_VOICE_MUTE" || penal.Type == "VOICE_MUTE"){
          if(member.voice.channelID) member.voice.setMute(false);
          if(member.roles.cache.has(global.Perm.Voice_Mute.Role)) member.roles.remove(global.Perm.Voice_Mute.Role).catch();
        }
        if((penal.Type == "TEMP_MUTE" || penal.Type == "MUTE") && member.roles.cache.has(global.Perm.Chat_Mute.Role)) member.roles.remove(global.Perm.Chat_Mute.Role).catch();
        if((penal.Type == "TEMP_JAIL" || penal.Type == "JAIL") && member.roles.cache.has(global.Perm.Jail.Role)) member.roles.remove(global.Perm.Jail.Role).catch();
    });
    
    Penal.model.updateMany({"Activity": true, "Temporary": true, "Finish": {$lte: Date.now()}}, {$set: {Activity: false}}, (err2, res) => {
      console.log(`${new Date().toLocaleString()} - Is it control? That job is already over. :D`);
    });
  })
  
  guild.members.fetch().then(members => {
    members.filter(member => member.roles.cache.size == 1 && member.roles.cache.first().id == guild.id).forEach(member => {
      member.roles.add(global.Perm.Welcome.Unregister).catch();
    });
  })
}