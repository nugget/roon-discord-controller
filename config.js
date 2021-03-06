//
// If we failed to load a config from roon.load_config we will populate our
// settings object with these values
//
DefaultConfig = {
    bottoken: "",
    channelid: "",
    announcetracks: false,
    commandprefix: "!",
    setpresence: true,
    voicechannelid: "",
    streamerid: "",
    streamingzone: { output_id: "", name: "" },
    localzone: { output_id: "", name: "" },
    debug: false
};

var current = {};

function load(roon) {
    console.log("Loading configuration cache");
    current = roon.load_config("settings") || DefaultConfig;
    console.log("Debugging output is " + current.debug);
}

function get(_key) {
    return current[_key];
}
 
function set(_key, value) {
    current[_key] = value;
    if (current["debug"]) {
        console.log("set config value for '%s' with '%s'", _key, current[_key]);
    }
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
    console.log("Updating configuration cache");
    current = _settings;
    console.log("Debugging output is " + current.debug);
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
            },
            {
                type: "string",
                title: "Command Prefix",
                setting: "commandprefix"
            },
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
                type: "dropdown",
                title: "Link Zones",
                values: fakeBoolean,
                setting: "linkzones"
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
exports.set = set;
exports.update = update;
exports.all = all;
exports.flag = flag;
