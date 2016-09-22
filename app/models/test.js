var mongoose = require("mongoose");
var fs = require("fs");
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;
module.exports = {
	getData: (pid, callback) => {
		var gfs = Grid(conn.db);
		var readstream = gfs.createReadStream({filename: pid + ".json" });
		var buffer = "";
	    readstream.on("data", (chunk) => {
	        buffer += chunk;
	    });
	    readstream.on("end", () => {
	        callback(JSON.parse(buffer))
	    });
	}
}