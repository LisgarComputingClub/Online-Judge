// This module contains all the web server code.

// Filesystem access
var fs = require("fs");

// Website hosting
var http = require('http');
var express = require('express');

// IP address tools
var ip = require("ip");

// MongoDB
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

// Website
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Simple file exist checking
var exists = require("simple-exist");

// Validate code submissions
var HackerRank = require("./js/submit.js");

// Passport for user authentication
var passport = require("passport");

// MongoDB
var url = 'mongodb://159.203.47.121:27017/ONLINE_JUDGE';

// Start and configure web server
server = express();

// Store languages.json
var languages = JSON.parse(fs.readFileSync("languages.json", "utf8"));

// Store port
var port;

var routes = require('./routes')(server, db);

var LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });   
            }
            return done(null, user);
        });
    }
));

// Check if a port was specified
if (process.argv.length > 2) {
    process.argv.forEach(function (val, index, array) {
        switch(true) {
            case /^port=\d+$/.test(val):
                var temp = val.split("=");
                port = Number(temp[1]);
                break;
            default:
                port = 8080;
        }
    });
}

// Start Socket.io
var io = require("socket.io").listen(server.listen(port));

// Export Socket.io and web server
exports.io = io;
exports.server = server;

// Setup webserver
exports.server.set('view engine', 'ejs');

// Root directory
exports.server.use('/', express.static(__dirname + '/'));

// Socket.io
exports.io.sockets.on("connection", function(socket) {
    // A user connected
    console.log("Connect");
    
    // A user is requesting languages
    socket.on("languages request", function() {
        socket.join("languages");
        io.to("languages").emit("languages", languages);
        socket.leave("languages");
    });
    
    // A user submitted code
    socket.on("code submission", function(data) {
        // Validate code
        data = JSON.parse(data);
        
        MongoClient.connect(url, function(err, db) {
            db.collection('problems').findOne({'pid':data.problem}, function(err, problem) {
                console.log(data.problem);
                console.log(problem);
                HackerRank.evaluateCode(data.code, data.lang, problem.input, problem.output, function(results) {
                    // Add socket to result room so only they get results
                    socket.join("result");
                    // Send the results
                    io.to("result").emit("code results", results);
                    // Remove the socket from the room
                    socket.leave("result");
                });
            });
        });
    });
});

// Decide which problem to serve to the user
function getProblem(req, res) {
    // Check if the GET paramater "problem" was specified
    if (req.query.hasOwnProperty("problem")) {
        // It was, check if that problem exists
        problemExists(req.query.problem, function(data) {
            if (data) {
                // Problem exists, give it to the user
                res.render('pages/problems/' + req.query.problem + '.ejs', { title: "Problems", ip: ip.address(), port: port });
            } else {
                // Problem doesn't exist, give them the list of problems
                res.render('pages/problems', { title: "Problems" });
            }
        });
    } else {
        // It wasn't, take user to the list of problems
        res.render('pages/problems', { title: "Problems" });
    }
}

// Check if a problem exists
function problemExists(code, callback) {
    exists.exists('views/pages/problems/' + code + '.ejs', callback);
}

// Update languages.json
module.exports.updateLanguages = function() {
    fs.readFile("languages.json", "utf8", function(err, data) {
        if(err) {
            throw err;
        }
        languages = JSON.parse(data);
    });
};
