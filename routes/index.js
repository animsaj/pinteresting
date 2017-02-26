var express = require('express');
var router = express.Router();
var passport = require("passport");

//login routes 
router.get("/", function (req, res) {
    res.redirect("/wall");
});

router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/auth/twitter' }),
  function(req, res) {
    req.flash("success", "Welcome " + req.user.name);
    res.redirect('/wall');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash("success", "Logged Out");
  res.redirect('/wall');
});

module.exports = router;
