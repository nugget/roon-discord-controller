var config = require("./config.js"),
    pjson = require("./package.json");

const chalk = require("chalk");

function tslog(template, ...args) {
    var ts = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    template = "%s " + template;
    console.log(template, ts, ...args);
}

function trace(template, ...args) {
    if (config.flag("debug")) {
        tslog(chalk.white("[TRACE] ") + template, ...args);
    }
}

function debug(template, ...args) {
    if (config.flag("debug")) {
        tslog(chalk.white("[DEBUG] ") + template, ...args);
    }
}

function info(template, ...args) {
    tslog(chalk.cyan("[INFO] ")+template, ...args);
}

function warn(template, ...args) {
    tslog(chalk.yellow("[WARN] ")+template, ...args);
}

function error(template, ...args) {
    tslog(chalk.redBright("[ERROR] ")+template, ...args);
}

function fatal(template, ...args) {
    tslog(chalk.redBright("[ERROR] ")+template, ...args);
    process.exit(255);
}

exports.trace = trace;
exports.debug = debug;
exports.info = info;
exports.warn = warn;
exports.error = error;
exports.fatal = fatal;
