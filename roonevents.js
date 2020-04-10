var zonedata = require("./zonedata.js"),
    discord = require("./discord.js"),
    config = require("./config.js");

var roon_zones = {};

var transport;

function core_paired(core) {
    transport = core.services.RoonApiTransport;
    transport.subscribe_zones(handler);

    transport.get_zones(function (msg, body) {
        if (config.debug) {
            console.log("GET_ZONES", body);
            console.log("ARRAY", body.zones[1].outputs);
        }
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

                    if (config.debug) {
                        console.log("PLAYING", zd);
                    }

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
                                console.log("UNKNOWN zone state: " + zd.state);
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

function core_unpaired(core) {
    console.log(
        core.core_id,
        core.display_name,
        core.display_version,
        "-",
        "LOST"
    );
}

function add_discord() {
    l = config.get("localzone");
    d = config.get("streamingzone");

    if (
        typeof l.output_id === "undefined" ||
        typeof d.output_id == "undefined"
    ) {
        return;
    }

    transport.group_outputs([l.output_id, d.output_id], function (msg) {
        console.log("Grouped %s and %s zones together", l.name, d.name);
    });
}

function drop_discord() {
    l = config.get("localzone");
    d = config.get("streamingzone");

    if (
        typeof l.output_id === "undefined" ||
        typeof d.output_id == "undefined"
    ) {
        return;
    }

    transport.ungroup_outputs([l.output_id, d.output_id], function (msg) {
        console.log("Ungrouped %s and %s zones", l.name, d.name);
    });
}

exports.core_paired = core_paired;
exports.core_unpaired = core_unpaired;
exports.add_discord = add_discord;
exports.drop_discord = drop_discord;
