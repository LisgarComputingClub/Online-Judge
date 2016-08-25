// Packages
var mongoose = require("mongoose");

// Problem schema
var problemSchema = mongoose.Schema({
    pid: String,
    name: String,
    author: String,
    creation: Date,
    lastEdit: Date,
    approved: Boolean,
    approvalDate: Date,
    statement: String,
    points: Number,
    partial: Boolean,
    languages: [String],
    testcases: {
        input: [String],
        output: [String],
        points: [Number]
    },
    contest: {
        cid: String,
        points: Number
    }
});

// Create and export the model
module.exports = mongoose.model("Problem", problemSchema);