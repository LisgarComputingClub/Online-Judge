// Packages
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// User schema
var userSchema = mongoose.Schema({
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    grader: {
        firstLogin: Boolean,
        username: String,
        points: Number,
        problemsSolved: [
            {
                sid: String,
                pid: String, 
                name: String,
                points: Number,
                maxpoints: Number
            }
        ],
        school: String,
        age: Number,
        website: String,
        country: String,
        bio: String
    }
});

// Methods

// Generate a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if a password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// Create and export the model
module.exports = mongoose.model("User", userSchema);