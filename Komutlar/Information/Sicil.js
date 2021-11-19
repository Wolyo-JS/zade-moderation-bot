const Discord = require("discord.js");
const moment = require("moment");
require("moment-timezone");
const Penal = require("../../Schemas/Penal.js");
moment.locale("tr");

exports.run = async (client, message, args) => {
    if(!message.member.hasPermission("ADMINISTRATOR") && !global.Perm.Defaults.Commander.some(role => message.member.roles.cache.has(role))) return client.reply(message, "Bunu yapmak için yeterli bir yetkiye sahip değilsin.");

    let victim = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if(!victim) return client.reply(message, "Birisini etiketlemelisin.")

    Penal.model.find({ User: victim.id }, async (err ,res) => {
        res = res.reverse();

        let page = 1;
        const liste = res.map((e, i) => `\`#${e.Id}:\` \`${e.Activity == true ? "✅" : "❌"}\` **[${e.Type}]** Yetkili: <@${e.Admin}> **${e.Reason}** - ${moment(e.Date).tz("Europe/Istanbul").format("YYYY.MM.DD | HH:mm:ss")}`);

        var msg = await message.channel.send(new Discord.MessageEmbed()
        .setDescription(`${victim} kullanıcısının tüm cezaları aşağıda listelenmiştir. Cezaların hiç biri silinmeyecektir. Eğer kullanıcının çok fazla cezası varsa sunucudan çık gir yaptığında kayıt işlemi yapılamayacaktır. 🔼,🔽 Emojilerini kullanarak sayfalar arası geçiş yapabilir, 🔴 kullanarak işlemi iptal edebilirsiniz.`)
        .addField(`Cezalar`, ` ${victim} \n ${liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n")} ** **`)
        .setFooter(`Şu anki sayfa: ${page}`)
        .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))).then(e => e);
        
        
        if(liste.length > 10){
            await msg.react(`🔼`);
            await msg.react(`🔽`);
            await msg.react(`🔴`);

            let collector = msg.createReactionCollector((react, user) => ["🔼","🔽", "🔴"].some(e => e == react.emoji.name) && user.id == message.member.id, {
                time: 200000
            });

            collector.on("collect", (react, user) => {
                if(react.emoji.name == "🔽"){
                    if(liste.slice((page + 1) * 10 - 10, (page + 1) * 10).length <= 0) return;
                    page += 1;
                    let newList = liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n");
                    msg.edit(new Discord.MessageEmbed()
                    .setDescription(`${victim} kullanıcısının tüm cezaları aşağıda listelenmiştir. Cezaların hiç biri silinmeyecektir. Eğer kullanıcının çok fazla cezası varsa sunucudan çık gir yaptığında kayıt işlemi yapılamayacaktır. 🔼,🔽 Emojilerini kullanarak sayfalar arası geçiş yapabilir, 🔴 kullanarak işlemi iptal edebilirsiniz.`)
                    .setFooter(`Şu anki sayfa: ${page}`)
                    .addField(`Cezalar`, ` ${victim} \n ${newList} ** **`)
                    .setAuthor(message.author.username, message.author.avatarURL({dynamic: true})));
                }
                if(react.emoji.name == "🔼"){
                    if(liste.slice((page - 1) * 10 - 10, (page - 1) * 10).length <= 0) return;
                    page -= 1;
                    let newList = liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n");
                    msg.edit(new Discord.MessageEmbed()
                    .setDescription(`${victim} kullanıcısının tüm cezaları aşağıda listelenmiştir. Cezaların hiç biri silinmeyecektir. Eğer kullanıcının çok fazla cezası varsa sunucudan çık gir yaptığında kayıt işlemi yapılamayacaktır. 🔼,🔽 Emojilerini kullanarak sayfalar arası geçiş yapabilir, 🔴 kullanarak işlemi iptal edebilirsiniz.`)
                    .setFooter(`Şu anki sayfa: ${page}`)
                    .addField(`Cezalar`, ` ${victim} \n ${newList} ** **`)
                    .setAuthor(message.author.username, message.author.avatarURL({dynamic: true})));
                }
                if(react.emoji.name == "🔴"){
                    msg.delete();
                    collector.stop();
                }
            })
        }
        
    });

};

exports.conf = {
    commands: ["sicil"],
    enabled: true,
    guildOnly: true,
    usage: "sicil @kullanıcı",
};