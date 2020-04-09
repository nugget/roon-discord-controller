var roonevents = require("./roonevents.js");

var Discord = require("discord.js");

var channelid, voicechannelid;

var bot = new Discord.Client();

function registerchannel(_cid) {
    console.log("Registering channel id", _cid);
    channelid = _cid;
}

function registervoicechannel(_cid) {
    console.log("Registering voice channel id", _cid);
    voicechannelid = _cid;
}

function announceplay(_msg) {
    console.log(_msg);
    var c = bot.channels.cache.get(channelid);
    console.log("c is ", c);
    if (c == "") {
        console.log("Cannot send, Discord is not initialized");
    } else {
        c.send(_msg);
    }
}

// 295363993311248384 // parallelsys
// 697505131570135180 // nugget
// 696784421784780882 // nuggethaus
// 331810131019038720 // me?

function listenersFromCache(channelid) {
    console.log("Determining listener list from channel (cached)")
    var ll = [];

    c = bot.channels.fetch(channelid);

    channel = bot.channels.cache.get(channelid);

    channel.guild.voiceStates.cache.forEach(function (value, key) {
        ll.push(key);
        console.log("user", key, "channel", channelid);
    });

    return ll;
}

function listenersFromEvent(message) {
    console.log("Determining listener list from event")
    var ll = [];
    voicechannels = message.guild.voiceStates.cache;
    voicechannels.forEach(function (value, key) {
        if (value.channelID == voicechannelid) {
            ll.push(value.id);
            console.log("user", value.id, "channel", value.channelID);
        }
    });

    return ll; 
}

function isAnyoneListening(ll) {
    //
    // This is dumb but it will work for now
    //
    if (ll.length == 1) {
        roonevents.drop_discord();
    } else {
        roonevents.add_discord();
    }
}

exports.bot = bot;
exports.registerchannel = registerchannel;
exports.registervoicechannel = registervoicechannel;
exports.announceplay = announceplay;
exports.listenersFromCache = listenersFromCache;
exports.listenersFromEvent = listenersFromEvent;
exports.isAnyoneListening =isAnyoneListening;
