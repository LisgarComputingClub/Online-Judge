// Packages
var mongoose = require("mongoose");

// Problem schema
var contestSchema = mongoose.Schema({
    cid: String
    start: Date,
    end: Date,
    problems: [{
        pid: String,
        points: Number
    }],
    users: [String]
});

// Create and export the model
module.exports = mongoose.model("Contest", contestSchema);