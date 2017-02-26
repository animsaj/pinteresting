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

//edit route
router.get("/wall/:pin_id/edit", middleware.isPinOwner, function (req, res) {
    Pin.findById(req.params.pin_id, function (err, foundPin) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("edit", { pin: foundPin });
        }
    });
});
//update route
router.put("/wall/:pin_id", middleware.isPinOwner, function (req, res) {
    req.body.pin.description = req.sanitize(req.body.pin.description);
    Pin.findByIdAndUpdate(req.params.pin_id, req.body.pin, function (err, updatedPin) {
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            User.update({ _id: req.user._id, "pins._id": req.params.pin_id }, 
            {'$set': {
                'pins.$.url': req.body.pin.url,
                'pins.$.description': req.body.pin.description          
            }}, function (err, updatedUser) {
                if(err) {
                    res.redirect("back");
                } else {
                    req.flash("success", "Pin edited");
                    res.redirect("/wall/" + req.user._id);
                }
            }); 
        }
    });
});
//update likes route
router.put("/wall/:pin_id/likes", function (req, res) {
    User.findById({ _id: req.user._id}, function (err, user) {
        if(err) {
            res.redirect("back");
        } else {
            if(!user.pins.id(req.params.pin_id)) {
                Pin.findByIdAndUpdate({_id: req.params.pin_id}, { $inc: { likes: 1 }}, {new: true}, function (err, updatedPin) {
                    if(err) {
                        res.redirect("back");
                    } else {
                        user.pins.push(updatedPin);
                        user.save();
                        req.flash("success", "Pin added to your wall");
                        res.redirect("/wall/" + req.user._id);
                    }
                });
            } else {
                Pin.findByIdAndUpdate({_id: req.params.pin_id}, { $inc: { likes: -1 }}, function (err) {
                    if(err) {
                        res.redirect("back");
                    } else {
                        User.update({_id: req.user._id},
                        { $pull: { "pins" : { _id: req.params.pin_id } } }, function(err) {
                            req.flash("success", "Pin removed from your wall");
                            res.redirect("/wall/" + req.user._id);
                        });
                    }
                });
            }
        }
    });
});
//destroy route
router.delete("/wall/:pin_id", middleware.isPinOwner, function (req, res) {
    Pin.findByIdAndRemove(req.params.pin_id, function (err) {
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            User.update({_id: req.user._id},
            { $pull: { "pins" : { _id: req.params.pin_id } } }, function(err) {
                if(err) {
                    res.redirect("back");
                } else {
                    req.flash("success", "Your pin has been deleted");
                    res.redirect("/wall");
                }
            });
        }
    });
});

module.exports = router;