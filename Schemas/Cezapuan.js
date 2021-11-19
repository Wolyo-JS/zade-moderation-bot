const mongoose = require("mongoose");

let points = new mongoose.Schema({
    guildID: String,
    userID: String,
    point: Number
})

module.exports = mongoose.model("penalPoints", points);