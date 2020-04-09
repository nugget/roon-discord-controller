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
};

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

                    if (
                        typeof zd.state !== "undefined" &&
                        zd.state == "playing"
                    ) {
                        console.log("PLAYING");
                        console.log(zd);

                        if (zd.now_playing.seek_position < 10) {
                            var msg =
                                "Playing: " + zd.now_playing.one_line.line1;
                            discord.announceplay(msg);
                        }
                    }
                }
            }
        }
    }
};

function core_unpaired(core) {
    console.log(
        core.core_id,
        core.display_name,
        core.display_version,
        "-",
        "LOST"
    );
};

function add_discord() {
    transport.group_outputs(['1701fa13b47e4ae20588acf651c74e9a6302', '1701bffdbdb0615b297e24788d379c14e4d9'], function (msg) {
        console.log("GROUPED", msg);
    });
}

function drop_discord() {
    transport.ungroup_outputs(['1701fa13b47e4ae20588acf651c74e9a6302', '1701bffdbdb0615b297e24788d379c14e4d9'], function (msg) {
        console.log("UNGROUPED", msg);
    });
}

exports.core_paired = core_paired;
exports.core_unpaired = core_unpaired;
exports.add_discord = add_discord;
exports.drop_discord = drop_discord;