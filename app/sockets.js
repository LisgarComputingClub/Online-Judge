// Filesytem operations
var fs = require("fs");
// HackerRank configuration
var hrConfig = require("./../config/hr.js");
// HackerRank submissions
var HackerRank = require("node-hackerrank");
// Check if file exists
var exists = require("simple-exist");
// User model
var User = require("./models/user.js");
// Problems model
var Problem = require("./models/problem.js");

// Get languages
var languages;
// Check if languages file exists
exists.exists("languages.json", (data) => {
    if(data) {
        // Read in languages
        fs.readFile("languages.json", (err, data) => {
            // Check for errors
            if(err) {
                throw err;
            } else {
                languages = JSON.parse(data);
            }
        });
    } else {
        console.log(colours.error("Error getting languages. Try running the server again."));
    }
});

module.exports = function (io, sessionMiddleware) {

    // Use authentication middleware
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    // Check if new connections are logged in
    io.on("connection", (socket) => {

        if (typeof socket.request.session.passport !== "undefined") {
            console.log("Logged in: " + socket.request.session.passport.user);
        } else {
            // Make the Socket redirect the user to the homepage
            socket.emit("redirect", "/");
        }

        // Get list of users
        socket.on("users-request", (data) => {
            // Get array of users
            User.find({}, (err, users) => {
                // Check for errors
                if (err) {
                    console.log("Error getting list of users: " + err);
                } else {
                    // Generate an array of users
                    var userArr = [];
                    users.forEach((val, index, arr) => {
                        userArr.push({
                            username: val.grader.username,
                            name: val.google.name,
                            school: val.grader.school,
                            points: val.grader.points
                        });
                    });

                    // Send the array of users to the socket
                    socket.emit("users-response", userArr);
                }
            });
        });

        // Get list of problems
        socket.on("problems-request", (data) => {
            // Get array of problems
            Problem.find({}, (err, problems) => {
                // Check for errors
                if(err) {
                    console.log("Error getting list of problems: " + err);
                } else {
                    // Generate an array of problems
                    var problemArr = [];
                    problems.forEach((val, index, arr) => {
                        problemArr.push({
                            name: val.name,
                            pid: val.pid,
                            points: val.points,
                            partial: val.partial,
                            languages: val.languages
                        });
                    });

                    // Send the array of problems to the socket
                    socket.emit("problems-response", problemArr);
                }
            })
        });

        // Get info for an individual problem
        socket.on("problem-request", (data) => {
            // Get problem data
            Problem.find({pid: data}, (err, problem) => {
                // Check for errors
                if(err) {
                    console.log("Error getting info for problem " + pid + ": " + err);
                } else if(problem.length > 0) {
                    // Send the problem data to the user
                    socket.emit("problem-response", problem[0]);
                } else {
                    // The problem doesn't exist, redirect the user
                    socket.emit("redirect", "/problems");
                }
            });
        });

        // Get info for a user profile
        socket.on("profile-request", (data) => {
            // Get profile data
            User.findOne({ "grader.username": data }, (err, doc) => {
                // Check for errors
                if(err) {
                    console.log(err);
                }
                // Check if we found a doc
                if(typeof doc != "undefined") {
                    var userObj = {
                        name: doc.google.name,
                        grader: doc.grader
                    };
                    // Send the user data to the socket
                    socket.emit("profile-response", userObj);
                } else {
                    // The user doesn't exist, redirect the user
                    socket.emit("redirect", "/users");
                }
            });
        });

        // Get code submissions
        socket.on("code-submission", (data) => {
            // Tell the client that we got the code
            socket.emit("submission-status", "received");
            // Get this problem's info
            Problem.findOne({ "pid": data.pid }, (err, doc) => {
                // Check for errors
                if(err) {
                    console.log(err);
                }
                // Check if we found a doc
                if(typeof doc != "undefined") {
                    // Tell the client that we found the problem in the database
                    socket.emit("submission-status", "found");
                    // Run code through HackerRank
                    HackerRank.evaluateCode(data.code, data.lang, doc.testcases.input, doc.testcases.output, (res) => {
                        // Check if the user already solved the problem
                        User.findById(socket.request.session.passport.user, (err, found) => {
                            // Check if the problem hasn't yet been solved
                            if(found.grader.problemsSolved.indexOf(doc.pid) < 0) {
                                // Add points
                                if(doc.partial) {
                                    // TODO
                                } else {
                                    found.grader.points += doc.points;
                                }
                                // Add this problem to solved problems
                                found.grader.problemsSolved.push(doc.pid);
                                // Save user
                                found.save();
                            }
                        });
                        // Send the results to the client
                        socket.emit("submission-status", "evaluated");
                        socket.emit("submission-results", res);
                    });
                } else {
                    // Error
                    console.log("Error");
                }
            });
        });
    });
};