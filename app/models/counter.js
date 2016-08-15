// Packages
var mongoose = require("mongoose");

// User schema
var counterSchema = mongoose.Schema({
    _id: String,
    seq: Number
});

// Create and export the model
module.exports = mongoose.model("Counter", counterSchema);