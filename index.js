const Discord = require("discord.js");
const fs = require("fs");
const Ayarlar = global.Ayarlar = require("./Ayarlar/Ayarlar.json");
global.Permission = global.Perm = require("./Ayarlar/Permission.json");
global.Others = require("./Ayarlar/Others.json");

console.log("Bot başlatılıyor...");
let _client = new Discord.Client();
if (Ayarlar.Özel_Sunucu === true) {
    _client = new Discord.Client({
        fetchAllMembers: true
    });
}

const client = global.client = _client;

let __client = new Discord.Client();
if (Ayarlar.Özel_Sunucu === true) {
    __client = new Discord.Client({
        fetchAllMembers: true
    });
}

const Commands = global.Commands = new Discord.Collection();

fs.readdirSync("./Komutlar", { encoding: "utf-8" }).forEach(dir => {
    fs.readdirSync(`./Komutlar/${dir}`, { encoding: "utf-8" }).filter(file => file.endsWith(".js")).forEach(file => {
    let prop = require(`./Komutlar/${dir}/${file}`);
    if (!prop.run) return console.error(`[KOMUT] ${file} yüklenemedi.`);
    if (prop.conf.commands && prop.conf.commands.length > 0) Commands.set(prop.conf.commands[0], prop);
    if (prop.onLoad != undefined && typeof (prop.onLoad) == "function") prop.onLoad(client);
    });
});
fs.readdirSync("./Events", { encoding: "utf-8" }).filter(file => file.endsWith(".js")).forEach(file => {
    let prop = require(`./Events/${file}`);
    client.on(prop.conf.event, prop.execute);
    if (prop.onLoad != undefined && typeof (prop.onLoad) == "function") prop.onLoad(client);
});



const mongoose = require('mongoose');

mongoose.connect(Ayarlar.MongoURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.connection.on("connected", () =>{
	console.log("MongoDB bağlantısı kuruldu.")
	require("./bot.js");
});