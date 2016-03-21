// Require HackerRank API and FS
var fs = require("fs");
var HackerRank = require("machinepack-hackerrank");

// Get languages file
var languages = JSON.parse(fs.readFileSync('languages.json', 'utf8')).languages.codes;

// Submit a string of code
module.exports.evaluateCode = function(code, language, testcases, answers, callback) {
    var results = [];
    HackerRank.submit({
        apiKey: 'hackerrank|731195-684|a196c8ef286bf980b8b79ba0cff378e550678d5e',
        source: code,
        language: languages[language],
        testcases: testcases,
        wait: true,
        format: "json"
    }).exec({
        // Unexpected error
        error: function(err) {
            throw err;
        },
        // Code compiled successfully
        success: function(response) {
            response = JSON.parse(response).result;
            response.stderr.forEach(function(val, index, array) {
                if (val === false) {
                    if (response.stdout[index] == answers[index]) {
                        results.push(true);
                    } else {
                        results.push(false);
                    }
                } else {
                    results.push("error");
                }
            });
            console.log("Results: " + results);
            callback(results);
        }
    });
};

// Submit a file with code
module.exports.evaluateFile = function(file, language, testcases, answers, callback) {
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
            console.log(err);
        },
        // Code compiled successfully
        success: function(response) {
            JSON.parse(response).result.stdout.forEach(function(val, index, array) {
                if (val == answers[index]) {
                    results.push(true);
                } else {
                    results.push(false);
                }
            });
            callback(results);
        }
    });
};