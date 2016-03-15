// Include update checker
var update = require("./js/update.js");

// Start the website
var website = require("./website.js");

// Check for updates on startup and every hour
setInterval(update.checkUpdate(), 3600000);