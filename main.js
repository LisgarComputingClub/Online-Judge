// Include server update checker and languages update checker
var checkUpdate = require("./js/updateServer.js").checkUpdate;
var updateLanguages = require("./js/updateLanguages.js").updateLanguages;

// Start the website
var website = require("./website.js");

// Variables
var severUpdateDelay = 1800000;
var languagesUpdateDelay = 1800000;

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
        }
    });
}

// Log arguments to user
console.log("Settings:");
console.log("Server update delay: " + serverUpdateDelay + "ms");
console.log("Langauges update delay: " + languagesUpdateDelay + "ms");

// Check for updates once on startup
checkUpdate();

// Check for updates on startup and every hour
setInterval(function() { checkUpdate(); }, updateDelay);