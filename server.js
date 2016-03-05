var http = require('http');
var express = require('express');

var server = express();

server.set('view engine', 'ejs');

server.use('/', express.static(__dirname + '/'));

server.get('/', function(req, res) {
	res.render('pages/index',{title:"LCI Online Judge"});
});

server.get('/index', function(req, res) {
	res.render('pages/index',{title:"LCI Online Judge"});
});

server.get('/profile', function(req, res) {
	res.render('pages/profile',{title:"Profile"});
});

server.get('/users', function(req, res) {
	res.render('pages/users',{title:"Users"});
});

server.get('/contests', function(req, res) {
	res.render('pages/contests',{title:"Contests"});
});

server.get('/problems', function(req, res) {
	res.render('pages/problems',{title:"Problems"});
});

server.get('/about', function(req, res) {
	res.render('pages/about',{title:"About"});
});

server.get('/organizations', function(req, res) {
	res.render('pages/organizations',{title:"Organizations"});
});

server.get(/\/problems\//, function(req, res) {
	console.log(req.url);
	res.render('pages/problems/' + req.url.substr(10), {title:req.url.substr(10)});
});

server.listen(8080, function() {
	console.log("Listening on 8080");
});
