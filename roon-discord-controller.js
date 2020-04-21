var config = require("./config.js"),
    zonedata = require("./zonedata.js"),
    roonevents = require("./roonevents.js"),
    discord = require("./discord.js"),
    log = require("./log.js"),
    pjson = require("./package.json");

var RoonApi = require("node-roon-api"),
    RoonApiStatus = require("node-roon-api-status"),
    RoonApiTransport = require("node-roon-api-transport"),
    RoonApiSettings = require("node-roon-api-settings"),
    RoonApiImage = require("node-roon-api-image"),
    RoonApiBrowse = require("node-roon-api-browse");

var roon = new RoonApi({
    extension_id: "org.macnugget.discord",
    display_name: "Discord Controller",
    display_version: pjson.version,
    publisher: pjson.author.name,
    email: pjson.author.email,
    website: pjson.homepage,
    core_paired: roonevents.core_paired,
    core_unpaired: roonevents.core_unpaired,
    log_level: "none"
});

var roon_svc_status = new RoonApiStatus(roon);

var roon_svc_settings = new RoonApiSettings(roon, {
    get_settings: function (cb) {
        cb(config.layout(config.all()));
        set_core_log_level();
    },
    save_settings: function (req, isdryrun, settings) {
        let l = config.layout(settings.values);
        req.send_complete(l.has_error ? "NotValid" : "Success", {
            settings: l
        });

        if (!isdryrun && !l.has_error) {
            roon_svc_settings.update_settings(l);
            roon.save_config("settings", l.values);
            config.update(l.values);
            set_core_log_level();
        }
    }
});

function set_core_log_level() {
    if (config.flag("debug")) {
        // Can also set to "all" but that's way too chatty for me
        roon.log_level = "quiet";
    } else {
        roon.log_level = "none";
    }
    log.info("Set roon core log level to %s", roon.log_level);
}

config.load(roon);

roon.init_services({
    required_services: [RoonApiTransport, RoonApiBrowse],
    provided_services: [roon_svc_settings, roon_svc_status]
});

discord.bot.on("message", message => {
    log.debug(message);
});

discord.bot.on("voiceStateUpdate", message => {
    ll = discord.listenersFromEvent(message);
    discord.isAnyoneListening(ll);
});

discord.bot.login(config.get("bottoken"));

discord.bot.once("ready", () => {
    log.info("Connected to Discord");
    ll = discord.listenersFromCache(config.get("voicechannelid"));
    discord.isAnyoneListening(ll);
    discord.clearActivity();
});

roon.start_discovery();
