const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  Id: String,
  Type: String,
  User: String,
  Admin: String,
  Reason: String,
  Date: { type: Number, default: Date.now() },
  Finish: { type: Number, default: undefined },
  Activity: { type: Boolean, default: true },
  Temporary: { type: Boolean, default: false },
  Jail_Roles: { type: Array, default: [] }
});

const model = mongoose.model("Penal", schema);

module.exports.model = model;
module.exports.schema = schema;
