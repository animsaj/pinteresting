var express = require("express");
require('dotenv').config();
var path = require("path");
var bodyParser = require("body-parser");
var methodOverride = require('method-override')
var mongoose = require("mongoose");
var session = require("express-session");
var flash = require("connect-flash");
var indexRoutes = require("./routes/index");
var wallRoutes = require("./routes/wall");
var pinsRoutes = require("./routes/pins");
var passport = require("passport");
var auth = require("./auth");

var app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@ds157819.mlab.com:57819/pinteresting');


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({
    secret: "Koula is cute",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//PASSPORT SETUP
passport.use(auth);

//MONGOOSE SETUP
var User = require("./models").user;
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//ROUTES SETUP
app.use(indexRoutes);
app.use(wallRoutes);
app.use(pinsRoutes);

app.listen(process.env.PORT, function () {
    console.log("Server is running...");
});