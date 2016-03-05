var http = require('http');
var express = require('express');

var server = express();

server.set('view engine', 'ejs');

server.use('/', express.static(__dirname + '/'));

server.get('/', function(req, res) {
	res.render('pages/index');
});

server.listen(8080, function() {
	console.log("Listening on 8080");
});
