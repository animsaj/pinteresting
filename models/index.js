var mongoose = require("mongoose");

var pinSchema = new mongoose.Schema({
    url: String,
    description: String,
    author: {
        id: { type: mongoose.Schema.ObjectId, ref: "User" },
        name: String
    },
    created: {type: String, default: new Date(Date.now()).toDateString()},
    likes: {type: Number, default: 0 }
});

var UserSchema = new mongoose.Schema({
    oauthID: Number,
    name: String,
    pins: [pinSchema]
});

module.exports = {
    user: mongoose.model("User", UserSchema),
    pin: mongoose.model("Pin", pinSchema)
};