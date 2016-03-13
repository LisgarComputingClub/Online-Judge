// This module automatically checks for updates from the Github repo
// We're using OS and child process
var os = require("os");
var exec = require("child_process").exec;

// This function executes a bash command asynchronously
function execute(command, callback) {
    exec(command, function(error, stdout, stderr) {
        callback(stdout);
    });
}

// Run a command to check for updates
module.exports.checkUpdate = function(callback) {
    // Check if runing Linux
    if (os.platform() == "linux") {
        execute("git fetch && git status", function(output) {
            if (output.indexOf("Your branch is behind") > -1) {
                console.log("Automatically installing latest update.");
                
                execute("bash update.sh");
                process.exit();
            } else {
                console.log("No updates available.");
            }
        });
    } else {
        // Not running Linux
        console.log("Sorry, auto-update only works on Linux.");
    }
    // Check platform
};

module.exports.checkUpdate = function(callback) {
    execute("git fetch && git status", function(output) {
        if (output.indexOf("Your branch is behind") > -1) {
            console.log("Automatically installing latest update.");
            
            // Check platform
            switch(os.platform()) {
                case "linux":
                    execute("bash update.sh", function (whoCares) {
                        // seriously, who does? actually lets exit this process
                        process.exit();
                    });
                    break;
                case "win32":
                    execute("update.bat", function (whoCares) {
                        // seriously, who does? actually lets exit this process
                        process.exit();
                    });
                    break;
                default:
                    console.log("Sorry, your platform does not support auto-updating.");
                    break;
            }
            
        } else {
            console.log("No updates available.");
        }
    });
}