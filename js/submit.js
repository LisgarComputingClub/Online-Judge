// Require HackerRank API and FS
var fs = require("fs");
var HackerRank = require("machinepack-hackerrank");

var languages = JSON.parse(fs.readFileSync('languages.json', 'utf8')).languages.codes;

module.exports.evaluateCode = function(file, language, testcases, answers, callback) {
    var results = [];
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
            throw err;
        },
        success: function(response) {
            JSON.parse(response).result.stdout.forEach(function(val, index, array) {
                if(val == answers[index]) {
                    results.push(true);
                } else {
                    results.push(false);
                }
            });
            callback(results);
        }
    });
};

function verifyResults(codeResults, results, callback) {
    console.log("verify");
    var result = [];
    codeResults.forEach(function(val, index, array) {
        if (val == results[index]) {
            result.push(true);
        } else {
            result.push(false);
        }
    });
    console.log(result);
    callback(result);
}