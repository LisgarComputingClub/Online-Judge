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
// Submissions model
var Submission = require("./models/submission.js");
// Comments model
var Comment = require("./models/comment.js");
// Counter model
var Counter = require("./models/counter.js");
var Contest = require("./models/contest.js");

// Get languages
var languages;
// Check if languages file exists
exists.exists("languages.json", (data) => {
    if (data) {
        // Read in languages
        fs.readFile("languages.json", (err, data) => {
            // Check for errors
            if (err) {
                throw err;
            } else {
                languages = JSON.parse(data);
            }
        });
    } else {
        console.log(colours.error("Error getting languages. Try running the server again."));
    }
});

function getNextSequence(name) {
    Counter.findById(name, (err, doc) => {
        if (typeof doc == "undefined" || doc == null) {
            var c = new Counter({
                _id: name,
                seq: 1
            });
            c.save();
        } else {
            if (err) {
                console.log(err);
            } else {
                doc.seq++;
                doc.save();
                return doc.seq;
            }
        }
    });
    return 0;
}

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
                if (err) {
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
            // Check if data was sent
            if(data) {
                // Get problem data
                Problem.find({ pid: data }, (err, problem) => {
                    // Check for errors
                    if (err) {
                        console.log("Error getting info for problem " + pid + ": " + err);
                    } else if (problem.length > 0) {
                        if (!problem.contest) {
                            // Send the problem data to the user
                            console.log("emitting problem");
                            socket.emit("problem-response", problem[0]);
                        } else {
                            //dw it probably works 
                            Contest.findOne({ cid: problem[0].contest.cid }, (err, contest) => {
                                if (err) {
                                    console.log("Error getting contest info for " + cid + ": " + err);
                                } else {
                                    var d = new Date();
                                    if (d >= contest.start) {
                                        User.findById(socket.request.session.passport.user, (err, user) => {
                                            if (err) {
                                                console.log("Error getting user info");
                                            } else {
                                                if (contest.users.indexOf(user.grader.username) > -1) {
                                                    socket.emit("problem-response", problem[0]);
                                                } else {
                                                    console.log("This user is not registered");
                                                }
                                            }
                                        });
                                    } else {
                                        console.log("This contest has not started yet");
                                    }
                                }
                            });
                        }
                    } else {
                        // The problem doesn't exist, redirect the user
                        socket.emit("redirect", "/problems");
                    }
                });
            } else {
                // Redirect the user
                socket.emit("redirect", "/problems");
            }
        });

        // Get info for a user profile
        socket.on("profile-request", (data) => {
            // Check if a username was sent
            if(data) {
                // Get profile data
                User.findOne({ "grader.username": data }, (err, doc) => {
                    // Check for errors
                    if (err) {
                        console.log(err);
                    }
                    // Check if we found a doc
                    if (doc) {
                        var userObj = {
                            name: doc.google.name,
                            grader: doc.grader
                        };
                        socket.emit("profile-response", userObj);
                    } else {
                        // The user doesn't exist, redirect the user
                        socket.emit("redirect", "/users");
                    }
                });
            } else {
                // Redirect the socket
                socket.emit("redirect", "/users");
            }
        });

        // Get code submissions
        socket.on("code-submission", (data) => {
            // Tell the client that we got the code
            socket.emit("submission-status", "received");
            // Get this problem's info
            Problem.findOne({ "pid": data.pid }, (err, doc) => {
                // Check for errors
                if (err) {
                    console.log(err);
                }

                // Check if we found a doc
                if (typeof doc != "undefined") {
                    // Tell the client that we found the problem in the database
                    socket.emit("submission-status", "found");
                    var s = new Submission({
                        sid: getNextSequence("submissionCounter"),
                        pid: doc.pid,
                        author: "U.N. Owen",
                        creation: new Date(),
                        status: "test",
                        points: 0,
                        code: data.code,
                        language: data.lang
                    });

                    var num_eval = 0;
                    var num_eval_2 = 0;
                    var score = 0.0;
                    var abort = false;
                    socket.emit("submission-status", "evaluated");
                    socket.emit("submission-status", doc.testcases.input.length);
                    for (i = 0; i < doc.testcases.input.length; i++) {
                        // Run code through HackerRank
                        HackerRank.evaluateCode(i, data.code, data.lang, doc.testcases.input.slice(i, i + 1), doc.testcases.output.slice(i, i + 1), HackerRank.defaultChecker, (res) => {
                            if (abort) {
                                return;
                            }
                            if (typeof res.results[0] == "string" && res.results[0].substr(0, 4) == "solu") {
                                abort = true;
                                socket.emit("submission-results", res);
                                return;
                            } else if (res.results[0] === true) {
                                if (doc.testcases.weight != undefined) {
                                    score += doc.testcases.weight[res.case] * doc.points;
                                } else {
                                    score += doc.points / doc.testcases.input.length;
                                }
                            }

                            // Send the results to the client
                            socket.emit("submission-results", res);
                            num_eval++;

                            if (num_eval == doc.testcases.input.length) {

                                if (Math.abs(score - doc.points) <= 0.0001) {
                                    score = doc.points;
                                }
                                if (!doc.partial && score < doc.points) {
                                    score = 0;
                                }

                                console.log(score);

                                //TODO: points worked out here; score contains total score for this submission (counts partial vs no partial)
                                User.findById(socket.request.session.passport.user, (err, found) => {
                                    var i = -1;
                                    for (var j = 0; j < found.grader.problemsSolved.length; j++) {
                                        if (found.grader.problemsSolved[j].pid === doc.pid) {
                                            i = j;
                                            break;
                                        }
                                    }
                                    s.author = found.grader.username;
                                    s.points = score;
                                    s.save();
                                    if (i < 0) {
                                        // Add this problem to solved problems
                                        if (score != 0) {
                                            found.grader.problemsSolved.push({ sid: s.sid, pid: doc.pid, name: doc.name, points: score, maxpoints: doc.points });
                                            found.grader.points += score;
                                            // Save user
                                            found.save();
                                        }
                                    } else {
                                        found.grader.points -= found.grader.problemsSolved[i].points;
                                        found.grader.points += score;
                                        found.grader.problemsSolved[i] = { sid: s.sid, pid: doc.pid, name: doc.name, points: score, maxpoints: doc.points };
                                        found.save();
                                    }
                                });
                            }
                        });
                    }
                } else {
                    // Error
                    console.log("Error");
                }
            });
        });

        socket.on("submission-request", (data) => {
            console.log("request received for " + data);
            Submission.findOne({ sid: data }, (err, submissionDoc) => {
                if (err) {
                    console.log(err);
                }
                User.findById(socket.request.session.passport.user, (err, userDoc) => {
                    var i = -1;
                    for (var j = 0; j < userDoc.grader.problemsSolved.length; j++) {
                        if (userDoc.grader.problemsSolved[j].pid === submissionDoc.pid) {
                            i = j;
                            break;
                        }
                    }
                    if (i >= 0) {
                        Problem.findOne({ pid: submissionDoc.pid }, (err, problemDoc) => {
                            if (problemDoc.points == userDoc.grader.problemsSolved[i].points || submissionDoc.author == userDoc.grader.username) {
                                socket.emit("submission-response", submissionDoc);
                            } else {
                                socket.emit("submission-response", "unauth");
                            }
                        });
                    } else {
                        socket.emit("submission-response", "unauth");
                    }
                });
            });
        });

       
        // Problem editor list
        socket.on("editor-list-request", (data) => {
            // Double check that usernames match
            User.findById(socket.request.session.passport.user, (err, userDoc) => {
                if (err || userDoc.grader.username != data) {
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
            if (data.type == "problem") {
                // Find comments
                Comment.find({ contentType: "problem", contentId: data.pid, deleted: false }, (err, docs) => {
                    // Check if we found something
                    if (!docs || err) {
                        // Redirect the user
                        socket.emit("redirect", "/problems");
                        // Stop
                        return;
                    } else {
                        // Send the comments to the user
                        socket.emit("comments-response", docs);
                    }
                });
            }
        });

        socket.on("comment-delete-request", (data) => {
            Comment.findById(data, (err, commentDoc) => {
                if (err) {
                    console.log(err);
                    socket.emit("comment-delete-response", false);
                } else {
                    User.findById(socket.request.session.passport.user, (err, userDoc) => {
                        if (err) {
                            console.log(err);
                            socket.emit("comment-delete-response", false);
                        } else if (userDoc.grader.username === commentDoc.author) {
                            commentDoc.remove();
                            socket.emit("comment-delete-response", true);
                        }
                    });
                }
            });
        });

        socket.on("comment-edit-request", (data) => {
            Comment.findById(data.id, (err, commentDoc) => {
                if (commentDoc == null) {
                    socket.emit("comment-edit-response", false);
                } else if (err) {
                    console.log(err);
                    socket.emit("comment-edit-response", false);
                } else {
                    User.findById(socket.request.session.passport.user, (err, userDoc) => {
                        if (err) {
                            console.log(err);
                            socket.emit("comment-edit-response", false);
                        } else if (userDoc.grader.username === commentDoc.author) {
                            commentDoc.content = data.text;
                            console.log(commentDoc.content);
                            commentDoc.save();
                            socket.emit("comment-edit-response", true);
                        }
                    });
                }
            })
        });

        socket.on("problem-submissions-request", (data) => {
            // Check if a problem ID was specified
            if (data) {
                // Find the user
                User.findById(socket.request.session.passport.user, (err, userDoc) => {
                    // Check if we found the user
                    if (userDoc) {
                        // Find submissions for the user
                        Submission.find({ pid: data, author: userDoc.grader.username }, (err, submissionDocs) => {
                            if (submissionDocs) {
                                // Build a safer array of submissions
                                var submissionsArr = [];
                                if (submissionDocs.length > 0) {
                                    submissionDocs.forEach((val, index, arr) => {
                                        submissionsArr.push({
                                            sid: val.sid,
                                            creation: val.creation,
                                            status: val.status,
                                            points: val.points,
                                            code: val.code,
                                            language: val.language
                                        });
                                    });
                                }
                            }
                            // Send the array to the user
                            socket.emit("problem-submissions-response", submissionsArr);
                        });
                    } else if (err) {
                        console.log(err);
                    } else if (!userDoc) {
                        console.log("No user found for submission request: " + JSON.stringify(data));
                    }
                });
            }
        });
    });
};