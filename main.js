// Include update checker
var checkUpdate = require("./js/updateServer.js").checkUpdate;

// Start the website
var website = require("./website.js");

// Variables
var updateDelay = 1800000;

// Check command line arguments
if (process.argv.length > 2) {
    process.argv.forEach(function (val, index, array) {
        switch(true) {
            case /^updateDelay=\d+$/.test(val):
                var temp = val.split("=");
                updateDelay = Number(temp[1]);
                console.log("Update check delay set to " + updateDelay + "ms");
        }
    });
}

// Check for updates once on startup
checkUpdate();

// Check for updates on startup and every hour
setInterval(function() { checkUpdate(); }, updateDelay);