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
    debug: false
};

var current = {};
var debug = false;

function load(roon) {
    current = roon.load_config("settings") || DefaultConfig;
}

function get(_key) {
    if (debug) {
        console.log("config getter for %s returned", _key, current[_key]);
    }
    return current[_key];
}

function flag(_key) {
    _val = current[_key];

    switch (typeof _val) {
        case "boolean":
            return _val;
            break;
        case "string":
            switch (_val) {
                case "true":
                case "on":
                case "yes":
                case "1":
                    return true;
                case "default":
                    return false;
            }
        default:
            console.log(
                "Unknown flag type " + _val + " (" + typeof _val + ")"
            );
            return false;
    }
}

function update(_settings) {
    current = _settings;
    debug = current["debug"];
    console.log("Debugging output is " + debug);
}

function all() {
    return current;
}

// https://community.roonlabs.com/t/settings-api-can-make-a-remote-crash/35899/4?u=nugget

const fakeBoolean = [
    { title: "On", value: true },
    { title: "Off", value: false }
];

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
                type: "dropdown",
                title: "Announce plays",
                values: fakeBoolean,
                setting: "announcetracks"
            },
            {
                type: "dropdown",
                title: "Update Presence",
                values: fakeBoolean,
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

    l.layout.push({
        type: "group",
        title: "Developer Settings",
        collapsable: true,
        items: [
            {
                type: "dropdown",
                values: fakeBoolean,
                title: "Debug Output",
                setting: "debug"
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
exports.flag = flag;
exports.debug = debug;
