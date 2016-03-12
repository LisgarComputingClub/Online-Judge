// This module automatically checks for updates from the Github repo
// We're using child process
var cmd = require("child_process");

// This function executes a bash command asynchronously
function execute(command, callback) {
    cmd.exec(command, function(error, stdout, stderr) {
        callback(stdout);
    });
}

// Run a command to check for updates
module.exports.checkUpdate = function(callback) {
    execute("git fetch && git status", function(output) {
        if (output.indexOf("Your branch is behind") > -1) {
            console.log("Automatically installing latest update.");
            
            cmd.execSync("bash update.sh");
            process.exit();
        } else {
            console.log("No updates available.");
        }
    });
};