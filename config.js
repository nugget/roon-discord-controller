//
// If we failed to load a config from roon.load_config we will populate our
// settings object with these values
//
DefaultConfig = {
    bottoken: "",
    channelid: "",
    announcetracks: false,
    setpresence: true,
    voicechannelid: "",
    streamerid: "",
    streamingzone: "",
    localzone: "",
};

var debug = true;

var current = {};

function load(roon) {
    current = roon.load_config("settings") || DefaultConfig;
}

function get(_key) {
    if (debug) {
        console.log("config getter for %s returned", _key, current[_key]);
    }
    return current[_key];
}

function update(_settings) {
    current = _settings;
}

function all() {
    return current;
}

// https://community.roonlabs.com/t/settings-api-can-make-a-remote-crash/35899/4?u=nugget

function layout(settings) {
    var l = {
        values: settings,
        layout: [],
        has_error: false
    };

    l.layout.push({
        type: "group",
        title: "Discord Server",
        items: [
            {
                type: "string",
                title: "Discord Bot Token",
                setting: "bottoken"
            },
            {
                type: "string",
                title: "Text Channel ID",
                setting: "channelid"
            },
            {
                type: "string",
                title: "Announce plays",
                setting: "announcetracks"
            },
            {
                type: "string",
                title: "Update Presence",
                setting: "setpresence"
            }
        ]
    });

    l.layout.push({
        type: "group",
        title: "Streaming Settings",
        collapsable: true,
        items: [
            {
                type: "string",
                title: "Voice Channel ID",
                setting: "voicechannelid"
            },
            {
                type: "string",
                title: "Streamer User ID",
                setting: "streamerid"
            },
            {
                type: "zone",
                title: "Streaming Zone",
                setting: "streamingzone"
            },
            {
                type: "zone",
                title: "Local Zone",
                setting: "localzone"
            }
        ]
    });

    return l;
}

exports.load = load;
exports.layout = layout;
exports.get = get;
exports.update = update;
exports.all = all;
exports.debug = debug;
