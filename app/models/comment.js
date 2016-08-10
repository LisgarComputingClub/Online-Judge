// Packages
var mongoose = require("mongoose");

// Comment schema
var commentchema = mongoose.Schema({
    contentType: String,
    contentId: String,
    author: String,
    creationDate: Date,
    lastEdit: Date,
    content: String,
    deleted: Boolean
});

// Create and export the model
module.exports = mongoose.model("Comment", commentSchema);