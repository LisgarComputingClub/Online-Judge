var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://127.0.0.1/online-judge');
var conn = mongoose.connection;
 
var fs = require('fs');
 
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
 
conn.once('open', function () {
    var gfs = Grid(conn.db);
    var writestream = gfs.createWriteStream({filename: process.argv[process.argv.length - 1]});
    fs.createReadStream(process.argv[2]).pipe(writestream);
 
    writestream.on('close', function (file) {
        process.exit(0);
    });
});