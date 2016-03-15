// HTTP for download and FS for saving to file
var http = require("http");
var fs = require("fs");

module.exports.updateLanguages = function() {
    console.log("Updating languages.");

    // Delete languages.json if exists
    fs.exists("languages.json", function(exists) {
        if (exists) {
            fs.unlink("languages.json");
        }
    });

    // Download new languages.json
    var file = fs.createWriteStream("lanuages.json");
    var request = http.get("http://api.hackerrank.com/checker/languages.json", function(response) {
        response.pipe(file);
    });
};