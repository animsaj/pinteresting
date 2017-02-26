var express = require("express");
var bodyParser = require("body-parser");
var expressSanitizer = require('express-sanitizer');
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models").user;
var Pin = require("../models").pin;
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//config router
router.use(bodyParser.urlencoded({extended: true}));
router.use(expressSanitizer());

//index route
router.get("/wall", function (req, res) {
    Pin.find({}, function (err, allPins) {
        if(err) {
            console.log(err);
        } else {
            res.render("pins", { pins: allPins });
        }
    });
});
//post route
router.post("/wall", middleware.isLoggedIn, function (req, res) {
    //sanitize 
    req.body.pin.description = req.sanitize(req.body.pin.description);
    //handle the post request
    User.findById(req.user.id, function (err, user) {
        if(err) {
            console.log(err);
        } else {
            Pin.create(req.body.pin, function (err, newPin) {
                if(err) {
                    console.log(err);
                } else {
                    newPin.author.id = req.user.id;
                    newPin.author.name = req.user.name;
                    newPin.save();
                    user.pins.push(newPin);
                    user.save();
                    req.flash("success", "Pin Created");
                    res.redirect("/wall");
                }
            });
        }
    });
});
//new route
router.get("/wall/new", middleware.isLoggedIn, function (req, res) {
    res.render("new");
});

//show route
router.get("/wall/:user_id", function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if(err) {
            console.log(err);
        } else {
            res.render("pins", { pins: user.pins });
        }
    });
});


module.exports = router;