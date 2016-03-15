// Require HackerRank API and FS
var fs = require("fs");
var HackerRank = require("machinepack-hackerrank");

var languages = JSON.parse(fs.readFileSync('languages.json', 'utf8')).languages.codes;

module.exports.evaluateCode = function(file, language, testcases, answers) {
    var result = [];
    var total = testcases.length;
    var count = 0;
    HackerRank.submitFile({
        apiKey: 'hackerrank|731195-684|a196c8ef286bf980b8b79ba0cff378e550678d5e',
        filePath: file,
        language: languages[language],
        testcases: testcases,
        wait: true,
        format: "json"
    }).exec({
        // Unexpected error
        error: function(err) {
            console.log("Error: " + err);
        },

        success: function(response) {
            result = JSON.parse(response).result.stdout;
            console.log(result);
            console.log("Verify results: " + verifyResults(result, answers));
        }
    });
    count++;
};

function verifyResults(codeResults, results) {
    var result = [];
    codeResults.forEach(function(val, index, array) {
        if (val == results[index]) {
            result.push(true);
        } else {
            result.push(false);
        }
    });
    return result;
}