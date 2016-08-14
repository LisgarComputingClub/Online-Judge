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
// Comments model
var Comment = require("./models/comment.js");

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
                    console.log("emitting problem");
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
                    // Check if the user has solved problems
                    if(doc.grader.problemsSolved.length > 0) {
                        // Loop through solved problems
                        var count = 0;
                        doc.grader.problemsSolved.forEach((val, index, arr) => {
                            Problem.findOne({ pid: val }, (err, problem) => {
                                userObj.grader.problemsSolved[index] = problem;
                                count++;
                                if(count >= doc.grader.problemsSolved.length) {
                                    // Send the user info to the socket
                                    socket.emit("profile-response", userObj);
                                }
                            });
                        });
                    } else {
                        // Send the user info to the socket
                        socket.emit("profile-response", userObj);
                    }
                    
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
                if (typeof doc != "undefined") {
                    // Tell the client that we found the problem in the database
                    socket.emit("submission-status", "found");

                    var num_eval = 0;
                    var score = 0;
                    socket.emit("submission-status", "evaluated");
                    for (num_eval = 0; num_eval < doc.testcases.input.length; num_eval++) {
                        // Run code through HackerRank
                        HackerRank.evaluateCode(data.code, data.lang, doc.testcases.input.slice(num_eval, num_eval + 1), doc.testcases.output.slice(num_eval, num_eval + 1), (res) => {
                            if (res.results[0] === true) {
                                score += doc.testcases.weight[num_eval] * doc.points;
                            }
                            console.log(res);
                            // Send the results to the client
                            socket.emit("submission-results", res);
                        });
                        if (!doc.partial) {
                            doc.score = 0;
                        }
                    }
                    //TODO: points worked out here; score contains total score for this submission (counts partial vs no partial)
                    User.findById(socket.request.session.passport.user, (err, found) => {
                        // Check if the problem hasn't yet been solved
                        if(found.grader.problemsSolved.indexOf(doc.pid) < 0) {


                            // Add this problem to solved problems
                            found.grader.problemsSolved.push(doc.pid);
                            // Save user
                            found.save();
                        }
                    });
                } else {
                    // Error
                    console.log("Error");
                }
            });
        });

        // Problem editor list
        socket.on("editor-list-request", (data) => {
            // Double check that usernames match
            User.findById(socket.request.session.passport.user, (err, userDoc) => {
                if(err || userDoc.grader.username != data) {
                    // Redirect the user
                    socket.emit("redirect", "/");
                    // Stop
                    return;
                }
            });

            // Get a list of the user's problems
            Problem.find({ author: data }, (err, problemDocs) => {
                // Go through each problem adding it to an array to send to the client
                var problems = [];
                problemDocs.forEach((val, index, arr) => {
                    problems.push({
                        pid: val.pid,
                        name: val.name,
                        partial: val.partial,
                        points: val.points,
                        languages: val.languages,
                        approved: val.approved
                    });
                });

                // Send the user the list of problems
                socket.emit("editor-list-response", problems);
                console.log(problems);
            });
        });

        // Get Comments
        socket.on("comments-request", (data) => {
            // Check the type of comments
            if(data.type == "problem") {
                // Find comments
                Comment.find({ contentType: "problem", contentId: data.pid, deleted: false }, (err, docs) => {
                    // Check if we found something
                    if(!docs || err) {
                        // Redirect the user
                        socket.emit("redirect", "/problems");
                        // Stop
                        return;
                    } else {
                        // Send the comments to the user
                        console.log("ay");
                        socket.emit("comments-response", docs);
                    }
                });
            }
        });
    });
};