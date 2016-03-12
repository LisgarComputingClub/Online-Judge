// This module automatically checks for updates from the Github repo
// We're using child process
var exec = require("child_process").exec;

// This function executes a bash command asynchronously
function execute(command, callback) {
    exec(command, function(error, stdout, stderr) {
        callback(stdout);
    });
}

// Run a command to check for updates
module.exports.checkUpdate = function(callback) {
    execute("git fetch && git status", function(output) {
        if (output.indexOf("Your branch is behind") > -1) {
            console.log("Update available. Automatically installing and rebooting.");
            
            // Start the update script and stop this server
            execute("bash update.sh", function(updateOutput) {
                process.exit();
            });
        } else {
            console.log("No updates available.");
        }
    });
};