// Use filesystem
var fs = require("fs");

module.exports.exists = function(file) {
    try
    {
        return fs.statSync(file).isFile();
    }
    catch (err)
    {
        return false;
    }
};