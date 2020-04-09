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

exports.bot = bot;
exports.registerchannel = registerchannel;
exports.announceplay = announceplay;
