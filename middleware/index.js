var User = require("../models").user;
var Pin = require("../models").pin;
var middleware = {};

middleware.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to login to do that");
    res.redirect("/login");
};

middleware.isPinOwner = function (req, res, next) {
    if(req.isAuthenticated()) {
        Pin.findById(req.params.pin_id, function (err, foundPin) {
            if(err) {
                res.redirect("back");
            } else {
                if(req.user._id.equals(foundPin.author.id)) {
                    next();
                } else {
                    req.flash("error", "You are not authorised to do that");
                    res.redirect("back");
                }
            }
        }); 
    } else {
        req.flash("error", "You need to login to do that");
        res.redirect("back");
    }
};

module.exports = middleware;