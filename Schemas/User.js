const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  Id: String,
  History: {
    Names: []
  },
  Usage: {}
});
const model = mongoose.model("User", schema);


module.exports.model = model;
module.exports.schema = schema;

global.updateUser = async (id, key, value) => { // ona gerek yok direkt yerel zaten
  return await model.findOneAndUpdate({Id: id}, {$inc: {[`Usage.${key}`]: value}}, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
}

global.addName = function(id, target, value, reason){
  model.findOneAndUpdate({Id: target}, {$push: {"History.Names": {Admin: id, Date: Date.now(), Name: value, Reason: reason}}}, { upsert: true, new: true, setDefaultsOnInsert: true }).exec()
}