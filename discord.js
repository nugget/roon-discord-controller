var Discord = require("discord.js");

var channelid;

var bot = new Discord.Client();

function registerchannel(_cid) {
    console.log("Registering channel id", _cid);
    channelid = _cid;
}

function announceplay(_msg) {
    console.log(_msg);
    bot.channels.cache.get(channelid).send(_msg);
}

// 295363993311248384 // parallelsys
// 697505131570135180 // nugget
// 696784421784780882 // nuggethaus
//

function listeners(channelid) {
    var l = [];

    channel = bot.channels.cache.get(channelid);
    channel.guild.voiceStates.cache.forEach(function (value, key) {
        l.push(key);
    });

    console.log("LISTENERS", l);
}

exports.bot = bot;
exports.registerchannel = registerchannel;
exports.announceplay = announceplay;
exports.listeners = listeners;
