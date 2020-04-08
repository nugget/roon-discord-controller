const Discord = require('discord.js');
var bot = new Discord.Client();

var debug = false;
var trace = false;
var roon_core, roon_zones = {};

var RoonApi 			= require("node-roon-api"),
	RoonApiStatus		= require("node-roon-api-status"),
	RoonApiTransport	= require("node-roon-api-transport"),
	RoonApiSettings		= require('node-roon-api-settings');

var mysettings;


var roon = new RoonApi({
  	extension_id:        'org.macnugget.discord',
	display_name:        "Discord Controller",
	display_version:     "0.0.1",
	publisher:           'Nugget',
	email:               'nugget@macnugget.org',
	website:             'https://github.com/nugget/roon-discord-controller',

  	core_paired: function(core_) {
		roon_core = core_;
		let transport = core_.services.RoonApiTransport;
		transport.subscribe_zones(function(cmd, data) {
			if ( debug ) { console.log('we know of zones: %s', Object.keys(roon_zones) );}
			if ( typeof data !== "undefined" ) {
				for ( var zoneevent in data ) {
					if ( debug ) { console.log('zoneevent=%s', zoneevent); }
					if ( zoneevent =='zones_removed' ) {
						for ( var zoneindex in data[zoneevent] ) {
							var zoneid=data[zoneevent][zoneindex];
							zonename = roonzone_find_by_id(zoneid);
							if ( debug ) { console.log('removed zone with id %s and name %s', zoneid, zonename); }
							//mqtt_publish_JSON( 'roon/'+zonename, mqtt_bot, { 'state' : 'removed' });
							delete roon_zones[zonename];
						}
					} else {
						var zones=data[zoneevent];
						for( var index in zones ) {
							var zonedata = roonzone_json_changeoutputs(zones[index]);
							var zonename = zonedata.display_name;

							if (typeof zonename !== 'undefined' && zonename) {
								//var regex = '';
								zonename = zonename.replace(/ \+.*/,'');
								roon_zones[zonename] = JSON.parse(JSON.stringify(zonedata));

    							if (typeof zonedata.state !== 'undefined' && zonedata.state == "playing") {
                                    console.log("PLAYING")
                                    console.log(zonedata)

                                    if(zonedata.now_playing.seek_position < 10) {
                                        var msg = "Playing: " + zonedata.now_playing.one_line.line1;
                                        console.log("ONE_LINE", zonedata.now_playing.one_line);
                                        bot.channels.cache.get(mysettings.channelid).send(msg);
                                    }

                                    console.log("BOT", bot);

                                    if(bot.user !== null) {
                                    bot.user.setStatus('available')
                                    bot.user.setPresence({
                                        name: "Playing music",
                                        type: "STREAMING",
                                        url: "https://music.nuggethaus.net"
                                    });
                                    }
                                }

							}
						}
					}
				}
			}
		});
	},

	core_unpaired: function(core_) {
		console.log(core_.core_id,
			core_.display_name,
			core_.display_version,
			"-",
			"LOST");
	}

});

mysettings = roon.load_config("settings") || {
    bottoken: "",
    channelid: "",
};

function roonzone_find_by_id(zoneid) {
	for ( var zonename in roon_zones ) {
		if ( roon_zones[zonename]["zone_id"] === zoneid ) {
			return zonename;
		}
	}
	return null;
}
function roonzone_find_outputid_by_name(zonename,outputname) {
	for ( var output in roon_zones[zonename]["outputs"] ) {
		if ( roon_zones[zonename]["outputs"][output]["display_name"] === outputname ) {
			return roon_zones[zonename]["outputs"][output]["output_id"];
		}
	}
	return null;

}
function roonzone_json_changeoutputs( zonedata ) {
	var newoutputs = {};
	for ( var index in zonedata["outputs"] ) {
		newoutputs[zonedata["outputs"][index]["display_name"]] = JSON.parse(JSON.stringify(zonedata["outputs"][index]));
	}
	zonedata["outputs"] = JSON.parse(JSON.stringify(newoutputs));
	return zonedata;
}
function makelayout(settings) {
    var l = {
        values:    settings,
		layout:    [],
		has_error: false
    };

    l.layout.push({
		type:    "string",
		title:   "Discord Bot Token",
		setting: "bottoken",
    });

    l.layout.push({
        type: "string",
        title: "Channel ID",
        setting: "channelid",
    });

   return l;
}

var roon_svc_status = new RoonApiStatus(roon);

var roon_svc_settings = new RoonApiSettings(roon, {
    get_settings: function(cb) {
        cb(makelayout(mysettings));
    },
    save_settings: function(req, isdryrun, settings) {
		let l = makelayout(settings.values);
        req.send_complete(l.has_error ? "NotValid" : "Success", { settings: l });

        if (!isdryrun && !l.has_error) {
            mysettings = l.values;
            roon_svc_settings.update_settings(l);
            roon.save_config("settings", mysettings);
        }
    }
});

roon.init_services({
	required_services: [ RoonApiTransport ],
	provided_services: [ roon_svc_settings, roon_svc_status ]
});

bot.on('message', message => {
    console.log(message.content);
});

bot.login(mysettings.bottoken);

bot.once('ready', () => {
	console.log('Ready!');
});

roon.start_discovery();
