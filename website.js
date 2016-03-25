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


exports.server.post('/login_verify', 
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/login',
                                     failureFlash: true })
);
// Homepage
exports.server.get('/', function(req, res) {
    res.render('pages/index', { title: "LCI Online Judge" });
});
exports.server.get('/index', function(req, res) {
    res.render('pages/index', { title: "LCI Online Judge" });
});

// Login page
exports.server.get('/login', function(req, res) {
    res.render('pages/login', { title: "Log In" });
});

// Signin page
exports.server.get('/signin', function(req, res) {
    res.render('pages/signin', { title: "LCI Online Judge" });
});

// Profile page
exports.server.get('/profile', function(req, res) {
    res.render('pages/profile', { title: "Profile" });
});

// Users page
exports.server.get('/users', function(req, res) {
    res.render('pages/users', { title: "Users" });
});

// Contests page
exports.server.get('/contests', function(req, res) {
    res.render('pages/contests', { title: "Contests" });
});

// Problems page
exports.server.get('/problems', function(req, res) {
    getProblem(req, res);
});

// About page
exports.server.get('/about', function(req, res) {
    res.render('pages/about', { title: "About" });
});

// Organizations page
exports.server.get('/organizations', function(req, res) {
    res.render('pages/organizations', { title: "Organizations" });
});

// Individual problems
exports.server.get(/\/problems\//, function(req, res) {
    var pid = req.url.substr(10);
    MongoClient.connect(url, function(err, db) {
        var problem = db.collection('problems').findOne({'pid':pid});
        res.render('pages/problems/' + req.url.substr(10), problem);    
    });    
});

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
