//
// If we failed to load a config from roon.load_config we will populate our
// settings object with these values
//
DefaultConfig = {
    bottoken: "",
    channelid: "",
    announcetracks: false,
};


function load(roon) {
    return roon.load_config("settings") || DefaultConfig;
}

function layout(settings) {
    var l = {
        values: settings,
        layout: [],
        has_error: false
    };

    l.layout.push({
        type: "string",
        title: "Discord Bot Token",
        setting: "bottoken"
    });

    l.layout.push({
        type: "string",
        title: "Channel ID",
        setting: "channelid"
    });

    l.layout.push({
        type: "string",
        title: "Announce plays to Discord channel",
        setting: "announcetracks",
    });

    return l;
}

exports.load = load;
exports.layout = layout;
