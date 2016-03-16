// Use filesystem
var fs = require("fs");

module.exports.exists = function(file, callback) {
    fs.stat(file, function(err, stat) {
        if(err === null) {
            callback(true);
        } else if(err.code == 'ENOENT') {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports.existsSync = function(file) {
    try {
        return fs.statSync(file).isFile();
    }
    catch (err) {
        return false;
    }
};