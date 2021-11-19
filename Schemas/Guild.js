const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  Id: String,
  Banned_Tags: {type: Array, default: []},
  Force_Bans: {type: Array, default: []}, 
  Trusted_Members: {type: Array, default: []}, 
  Evolution: [
    {
      Role: String,
      Responsibilities: String,
      Place: Number,
      Manual: { type: Boolean, default: true },
      Conditions: {
        Avegare_Voice: Number,
        Avegare_Message: Number,
        Participation_Limit: Number
      }
    }
  ]
});

const model = mongoose.model("Guild", schema);

module.exports.model = model;
module.exports.schema = schema;