const mongo = require("mongoose");
const moment = require("moment");
require("moment-duration-format");

exports.run = async (client, message, args, ayar) => {
  if (!global.Ayarlar.Sahip.includes(message.author.id)) return;
  try {
    var evaled = clean(await eval(args.join(" ")));
    message.channel.send(
      `${evaled.replace(
        new RegExp(client.token, "g"),
        "Verdim tokeni hissettin mi kardeşim"
      )}`,
      { code: "js", split: true }
    );
  } catch (err) {
    message.channel.send(err, { code: "js", split: true });
  }
  function clean(text) {
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 0 });
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    return text;
  }
};

exports.conf = {
  commands: ["eval", "ev"],
  enabled: false,
  usage: "eval",
};
