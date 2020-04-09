var zonedata = require("./zonedata.js"),
    discord = require("./discord.js");

var roon_zones = {};



function core_paired(core) {
    let transport = core.services.RoonApiTransport;
    transport.subscribe_zones(handler);
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

exports.core_paired = core_paired;
exports.core_unpaired = core_unpaired;
