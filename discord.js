var roonevents = require("./roonevents.js"),
    config = require("./config.js");

var Discord = require("discord.js");

var bot = new Discord.Client();

function announceplay(_msg) {
    console.log(_msg);
    cid = config.get("channelid");
    console.log("cid", cid, typeof cid);
    var c = bot.channels.cache.get(cid);
    console.log("channel", c, typeof c)
    if (c == "" || c === "undefined") {
        console.log("Cannot send, Discord is not initialized");
    } else {
        c.send(_msg);
    }
}

// 295363993311248384 // parallelsys
// 697505131570135180 // nugget
// 696784421784780882 // nuggethaus
// 331810131019038720 // me?

function listenersFromCache(_cid) {
    console.log("Determining listener list from channel (cached)")
    var ll = [];

    c = bot.channels.fetch(_cid);

    channel = bot.channels.cache.get(_cid);

    channel.guild.voiceStates.cache.forEach(function (value, key) {
        ll.push(key);
        console.log("user", key, "channel", _cid);
    });

    return ll;
}

function listenersFromEvent(_msg) {
    _vcid = config.get("voicechannelid");

    console.log("Determining listener list from event for vcid " + _vcid)
    var ll = [];
    voicechannels = _msg.guild.voiceStates.cache;
    voicechannels.forEach(function (value, key) {
        if (value.channelID == _vcid) {
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
exports.announceplay = announceplay;
exports.listenersFromCache = listenersFromCache;
exports.listenersFromEvent = listenersFromEvent;
exports.isAnyoneListening =isAnyoneListening;
