// Include update checker
var update = require("./js/update.js");

// Start the website
var website = require("./website.js");

// Check for update on startup
update.checkUpdate();

// Check for updates every hour
setInterval(update.checkUpdate(), 3600000);