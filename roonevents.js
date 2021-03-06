var zonedata = require("./zonedata.js"),
    discord = require("./discord.js"),
    log = require("./log.js"),
    config = require("./config.js");

var roon_zones = {};

var core, transport;

function ready() {
    // log.info("READYCHECK", transport);
    if (!transport) {
        return false;
    }

    return true;
}

function core_paired(_core) {
    core = _core;

    transport = core.services.RoonApiTransport;
    transport.subscribe_zones(handler);

    transport.get_zones(function (msg, body) {
        log.debug("GET_ZONES", body);
        log.debug("ARRAY", body.zones[1].outputs);
    });
}

function handler(cmd, data) {
    if (typeof data !== "undefined") {
        for (var zoneevent in data) {
            var zones = data[zoneevent];
            for (var index in zones) {
                var zd = zonedata.parse(zones[index]);
                var zonename = zd.display_name;

                if (typeof zonename !== "undefined" && zonename) {
                    //var regex = '';
                    zonename = zonename.replace(/ \+.*/, "");
                    roon_zones[zonename] = JSON.parse(JSON.stringify(zd));

                    log.debug("PLAYING", zd);

                    if (typeof zd.state !== "undefined") {
                        switch (zd.state) {
                            case "loading":
                                // Do nothing during short-lived loading pauses
                                break;
                            case "playing":
                                playing_handler(zd);
                                break;
                            case "paused":
                            case "stopped":
                                stopped_handler(zd);
                                break;
                            default:
                                log.info("UNKNOWN zone state: " + zd.state);
                                stopped_handler();
                        }
                    }
                }
            }
        }
    }
}

function playing_handler(zd) {
    if (zd.now_playing.seek_position < 10) {
        // Only announce playing at the start of a song, so we avoid double
        // announcemened after restarts or pause/resume operations
        var msg = "Playing: " + zd.now_playing.one_line.line1;
        discord.announceplay(msg);
    }

    discord.updateActivity(zd);
}

function stopped_handler(zd) {
    discord.clearActivity();
}

function core_unpaired(_core) {
    core = _core;
    log.warn("Roon core unpaired", core);
}

function add_discord() {
    if (!config.flag("linkzones")) {
        drop_discord();
        return;
    }

    if (!ready()) {
        return;
    }

    l = config.get("localzone");
    d = config.get("streamingzone");

    if (
        typeof l.output_id === "undefined" ||
        typeof d.output_id == "undefined"
    ) {
        return;
    }

    transport.group_outputs([d.output_id, l.output_id], function (msg) {
        log.info("Grouped %s and %s zones together", l.name, d.name);
    });
}

function drop_discord() {
    l = config.get("localzone");
    d = config.get("streamingzone");

    if (!ready()) {
        return;
    }

    if (
        typeof l.output_id === "undefined" ||
        typeof d.output_id == "undefined"
    ) {
        return;
    }

    transport.ungroup_outputs([d.output_id, l.output_id], function (msg) {
        log.info("Ungrouped %s and %s zones", l.name, d.name);
    });
}

exports.core_paired = core_paired;
exports.core_unpaired = core_unpaired;
exports.add_discord = add_discord;
exports.drop_discord = drop_discord;
