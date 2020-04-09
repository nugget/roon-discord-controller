var roonevents = require("./roonevents.js"),
    config = require("./config.js");

var Discord = require("discord.js");

var bot = new Discord.Client();

function announceplay(_msg) {
    if (!config.flag("announcetracks")) {
        console.log("Track announcements are disabled");
        return;
    }

    console.log(_msg);
    cid = config.get("channelid");
    console.log("cid", cid, typeof cid);
    var c = bot.channels.cache.get(cid);
    console.log("channel", c, typeof c);
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

696784421784780882;

function listenersFromCache(_vcid) {
    console.log("Determining listener list from channel %s (cached)", _vcid);
    var ll = [];

    c = bot.channels.fetch(_vcid);

    channel = bot.channels.cache.get(_vcid);

    if (config.debug) {
        console.log("CHANNEL", channel);
    }

    channel.guild.voiceStates.cache.forEach(function (value, key) {
        if (value.channelID == _vcid) {
            ll.push(key);
            if (config.debug) {
                console.log("user", key, "channel", value.channelID);
            }
        }
    });

    return ll;
}

function listenersFromEvent(_msg) {
    _vcid = config.get("voicechannelid");
    console.log("Determining listener list from event for vcid " + _vcid);

    var ll = [];
    if (config.debug) {
        console.log("EVENT", _msg);
    }
    voicechannels = _msg.guild.voiceStates.cache;
    voicechannels.forEach(function (value, key) {
        if (value.channelID == _vcid) {
            ll.push(value.id);
            if (config.debug) {
                console.log("user", value.id, "channel", value.channelID);
            }
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
exports.isAnyoneListening = isAnyoneListening;
