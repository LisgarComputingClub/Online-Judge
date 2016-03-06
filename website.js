var http = require('http');
var express = require('express');

exports.server = express();

exports.server.set('view engine', 'ejs');

exports.server.use('/', express.static(__dirname + '/'));

exports.server.get('/', function(req, res) {
	res.render('pages/index',{title:"LCI Online Judge"});
});

exports.server.get('/index', function(req, res) {
	res.render('pages/index',{title:"LCI Online Judge"});
});

exports.server.get('/profile', function(req, res) {
	res.render('pages/profile',{title:"Profile"});
});

exports.server.get('/users', function(req, res) {
	res.render('pages/users',{title:"Users"});
});

exports.server.get('/contests', function(req, res) {
	res.render('pages/contests',{title:"Contests"});
});

exports.server.get('/problems', function(req, res) {
	res.render('pages/problems',{title:"Problems"});
});

exports.server.get('/about', function(req, res) {
	res.render('pages/about',{title:"About"});
});

exports.server.get('/organizations', function(req, res) {
	res.render('pages/organizations',{title:"Organizations"});
});

exports.server.listen(8080, function() {
	console.log("Listening on 8080");
});
