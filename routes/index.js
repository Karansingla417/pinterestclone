const express = require('express');
const router = express.Router();
const usermodel = require("./users");
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(usermodel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index', { title: 'letsgo' });
});

router.get('/login', function(req, res, next) {
  console.log(req.flash("error"));
  res.render('login', {error:req.flash('error') });
});

router.get('/feed', function(req, res, next) {
  res.render('feed', { title: 'letsgo' });
});


router.post('/register', function(req, res) {
  const { username, email, fullname } = req.body;
  const userdata = new usermodel({ username, email, fullname });

  usermodel.register(userdata, req.body.password)
    .then(function(){
      passport.authenticate("local")(req, res, function(){
        res.redirect("/profile");
      });
    })
    .catch(function(err){
      // Handle registration errors
      console.error(err);
      res.status(500).send("Error registering user.");
    });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user=await usermodel.findOne({
    username:req.session.passport.user
  })
  console.log(user)
  res.render("profile",{user});
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true 
}), function(req, res) {
});


router.get('/logout', function(req, res){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/login');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
