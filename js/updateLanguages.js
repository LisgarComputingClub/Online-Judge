// Sync-request for download
var request = require("sync-request");

// FS for writing file
var fs = require("fs");

// Synchronous file checking
var exists = require("./exists.js").exists;

module.exports.updateLanguages = function() {

    console.log("Updating languages.");

    // Delete languages.json if exists
    if (exists("languages.json")) {
        fs.unlink("languages.json");
    }

    // Download new languages.json
    var res = request("GET", "http://api.hackerrank.com/checker/languages.json");
    
    // Write to file
    fs.writeFileSync("languages.json", res.getBody());
};