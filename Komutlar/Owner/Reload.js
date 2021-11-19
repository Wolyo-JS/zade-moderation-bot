const mongo = require("mongoose");
const moment = require("moment");
require("moment-duration-format");

exports.run = async (client, message, args, ayar) => {
  if (!global.Ayarlar.Sahip.includes(message.author.id)) return;
  
};

exports.conf = {
  commands: ["yenile", "reload", "rr", "res", "ref", "refresh", "restart"],
  enabled: false,
  usage: "yenile",
};
