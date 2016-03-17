// Include server update checker and languages update checker
var checkUpdate = require("./js/updateServer.js").checkUpdate;
var updateLanguages = require("./js/updateLanguages.js").updateLanguages;

// Fancy console output
var Table = require("easy-table");
var colours = require("colors");

// Check for server and languages updates once on startup
checkUpdate();
updateLanguages();

// Start the website
var website = require("./website.js");

// Include code submision
var submit = require("./js/submit");

// Variables
var serverUpdateDelay = 1800000;
var languagesUpdateDelay = 1800000;
var port = 8080;

// Check command line arguments
if (process.argv.length > 2) {
    process.argv.forEach(function (val, index, array) {
        switch(true) {
            case /^serverUpdateDelay=\d+$/.test(val):
                var temp = val.split("=");
                serverUpdateDelay = Number(temp[1]);
                break;
            case /^updateLanguagesDelay=\d+$/.test(val):
                var temp = val.split("=");
                languagesUpdateDelay = Number(temp[1]);
                break;
            case /^port=\d+$/.test(val):
                var temp = val.split("=");
                port = Number(temp[1]);
                break;
        }
    });
}

// Log arguments to user
console.log("\nSettings".green.bold.underline);
var args = [
    { name: "Server update check delay", value: serverUpdateDelay + " ms"},
    { name: "Languages update delay", value: languagesUpdateDelay + " ms"},
    { name: "Port", value: port}
];

var t = new Table;

args.forEach(function(data) {
    t.cell("Argument", data.name);
    t.cell("Value", data.value);
    t.newRow();
});

console.log("" + t.toString());

// Check for server updates on a delay set by the user
setInterval(function() { checkUpdate(); }, serverUpdateDelay);

// Check for languages updates on a delay set by the user
setInterval(function() { updateLanguages(); }, languagesUpdateDelay);