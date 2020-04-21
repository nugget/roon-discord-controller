var roonevents = require("./roonevents.js"),
    log = require("./log.js"),
    config = require("./config.js");

var Discord = require("discord.js");

var bot = new Discord.Client();

function announceplay(_msg) {
    if (!config.flag("announcetracks")) {
        log.info("Track announcements are disabled");
        return;
    }

    say(_msg);
}

function say(_msg) {
    if (!bot.readyAt) {
        log.info("bot is not ready");
        return;
    }

    log.info(_msg);
    cid = config.get("channelid");
    log.info("cid", cid, typeof cid);
    var c = bot.channels.cache.get(cid);
    log.info("channel", c, typeof c);
    if (c == "" || c === "undefined") {
        log.info("Cannot send, channelid '%s' is not found", cid);
    } else {
        c.send(_msg);
    }
}

function updateActivity(_zd) {
    if (!config.flag("setpresence")) {
        log.info("Presence updates are disabled");
        return;
    }

    if (!bot.readyAt) {
        log.info("bot is not ready");
        return;
    }

    var _msg = _zd.now_playing.one_line.line1;

    bot.user.setPresence({
        afk: false,
        status: "online",
        activity: {
            name: _msg,
            type: "LISTENING",
            url: "https://music.nuggethaus.net/",
            application: "Roon"
        }
    });

    log.info("Updated Presence");
}

function clearActivity() {
    if (!bot.readyAt) {
        log.info("bot is not ready");
        return;
    }

    bot.user.setActivity("", {});
    //bot.user.setStatus('idle');
    //bot.user.setAFK(true);

    bot.user.setPresence({
        afk: true,
        status: "idle",
        activity: {
            name: "silence",
            type: "LISTENING",
            url: "https://music.nuggethaus.net/",
            application: "Roon"
        }
    });

    log.info("Cleared Presence");
}

// 295363993311248384 // parallelsys
// 697505131570135180 // nugget
// 696784421784780882 // nuggethaus
// 331810131019038720 // me?

function listenersFromCache(_vcid) {
    log.info("Determining listener list from channel %s (cached)", _vcid);
    var ll = [];

    c = bot.channels.fetch(_vcid);

    channel = bot.channels.cache.get(_vcid);

    log.debug("CHANNEL", channel);

    channel.guild.voiceStates.cache.forEach(function (value, key) {
        if (value.channelID == _vcid) {
            if (value.serverDeaf || value.selfDeaf) {
                log.info("user " + value.id + " is in channel " + value.channelID + " but is deaf.  Skipping");
            } else {
                log.info("user " + value.id + " is in channel " + value.channelID);
                ll.push(value.id);
            }
        }
    });

    return ll;
}

function listenersFromEvent(_msg) {
    _vcid = config.get("voicechannelid");
    log.info("Determining listener list from event for vcid " + _vcid);

    var ll = [];
    log.debug("EVENT", _msg);

    voicechannels = _msg.guild.voiceStates.cache;
    voicechannels.forEach(function (value, key) {
        if (value.channelID == _vcid) {
            if (value.serverDeaf || value.selfDeaf) {
                log.info("user " + value.id + " is in channel " + value.channelID + " but is deaf.  Skipping");
            } else {
                log.info("user " + value.id + " is in channel " + value.channelID);
                ll.push(value.id);
            }
        }
    });

    return ll;
}

function isAnyoneListening(ll) {
    //
    // This is dumb but it will work for now
    //
    if (ll.length <= 1) {
        roonevents.drop_discord();
    } else {
        roonevents.add_discord();
    }
}

exports.bot = bot;
exports.say = say;
exports.announceplay = announceplay;
exports.updateActivity = updateActivity;
exports.clearActivity = clearActivity;
exports.listenersFromCache = listenersFromCache;
exports.listenersFromEvent = listenersFromEvent;
exports.isAnyoneListening = isAnyoneListening;
