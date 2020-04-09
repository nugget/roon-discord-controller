var config = require("./config.js"),
    zonedata = require("./zonedata.js"),
    roonevents = require("./roonevents.js"),
    discord = require("./discord.js");

var RoonApi = require("node-roon-api"),
    RoonApiStatus = require("node-roon-api-status"),
    RoonApiTransport = require("node-roon-api-transport"),
    RoonApiSettings = require("node-roon-api-settings"),
    RoonApiImage = require("node-roon-api-image");

var roon = new RoonApi({
    extension_id: "org.macnugget.discord",
    display_name: "Discord Controller",
    display_version: "0.0.1",
    publisher: "Nugget",
    email: "nugget@macnugget.org",
    website: "https://github.com/nugget/roon-discord-controller",
    core_paired: roonevents.core_paired,
    core_unpaired: roonevents.core_unpaired
});

var roon_svc_status = new RoonApiStatus(roon);

var roon_svc_settings = new RoonApiSettings(roon, {
    get_settings: function (cb) {
        cb(config.layout(config.all()));
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
        }
    }
});

config.load(roon);

roon.init_services({
    required_services: [RoonApiTransport],
    provided_services: [roon_svc_settings, roon_svc_status]
});

discord.bot.on("message", message => {
    console.log(message);
});

discord.bot.on("voiceStateUpdate", message => {
    ll = discord.listenersFromEvent(message);
    discord.isAnyoneListening(ll);
});

discord.bot.login(config.get("bottoken"));

discord.bot.once("ready", () => {
    console.log("Connected to Discord");
    ll = discord.listenersFromCache(config.get("voicechannelid"));
    discord.isAnyoneListening(ll);
});

roon.start_discovery();

console.log("Starting my tests");