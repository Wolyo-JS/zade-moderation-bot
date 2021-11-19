const Penal = require("../Schemas/Penal.js");

exports.execute = (oldState, newState) => {
  if(!newState.member) return;
  
  if(!newState.serverMute) return;
  
  Penal.model.findOne({User: oldState.id, Activity: true, $or: [{Type: "VOICE_MUTE"}, {Type: "TEMP_VOICE_MUTE"}]}, (err, res) => {
    if(newState.manageable) newState.setMute(true).catch();
  })
};

exports.conf = {
    event: "voiceStateUpdate"
}
