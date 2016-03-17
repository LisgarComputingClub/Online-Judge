// This module contains all the web server code.

// Website hosting
var http = require('http');
var express = require('express');

// MongoDB
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

// Website
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Simple file exist checking
var exists = require("simple-exist");

// MongoDB
var url = 'mongodb://localhost:27017/ONLINE_JUDGE';

// Start and configure web server
exports.server = express();

exports.server.set('view engine', 'ejs');

exports.server.use('/', express.static(__dirname + '/'));

exports.server.get('/', function(req, res) {
    res.render('pages/index', { title: "LCI Online Judge" });
});

exports.server.get('/index', function(req, res) {
    res.render('pages/index', { title: "LCI Online Judge" });
});

exports.server.get('/login', function(req, res) {
    res.render('pages/login', { title: "Log In" });
});

exports.server.post('/login_verify', urlencodedParser, function(req, res) {
    // Connect to MongoDB and lookup username
    MongoClient.connect(url, function(err, db) {
        var cursor = db.collection('users').find({ 'username': req.body.username });
        if (cursor.size === 0)
            throw "No user with that username found";
        else {
            var logged_in = false;
            cursor.each(function(err, doc) {
                console.log(doc);
                if (doc !== null) {
                    //todo: actual crypto lol
                    if (doc.password == req.body.password) {
                        logged_in = true;
                        //todo: actual logins lol
                    }
                }
            });
            if (!logged_in)
                throw "Incorrect password";
        }
    });
});

exports.server.get('/signin', function(req, res) {
    res.render('pages/signin', { title: "LCI Online Judge" });
});

exports.server.get('/profile', function(req, res) {
    res.render('pages/profile', { title: "Profile" });
});

exports.server.get('/users', function(req, res) {
    res.render('pages/users', { title: "Users" });
});

exports.server.get('/contests', function(req, res) {
    res.render('pages/contests', { title: "Contests" });
});

exports.server.get('/problems', function(req, res) {
    getProblem(req, res);
});

exports.server.get('/about', function(req, res) {
    res.render('pages/about', { title: "About" });
});

exports.server.get('/organizations', function(req, res) {
    res.render('pages/organizations', { title: "Organizations" });
});

exports.server.get(/\/problems\//, function(req, res) {
    res.render('pages/problems/' + req.url.substr(10), { title: req.url.substr(10) });
});

exports.server.get('/submit', function(req, res) {
    console.log("request sent to /submit");
});

exports.server.listen(8080, function() {
    console.log("Listening on 8080");
});

// Decide which problem to serve to the user
function getProblem(req, res) {
    // Check if the GET paramater "problem" was specified
    if(req.query.hasOwnProperty("problem")) {
        // It was, check if that problem exists
        problemExists(req.query.problem, function(data) {
            if(data) {
                // Problem exists, give it to the user
                res.render('pages/problems/' + req.query.problem + '.ejs', { title: "Problems" });
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

function problemExists(code, callback) {
    exists.exists('views/pages/problems/' + code + '.ejs', callback);
}