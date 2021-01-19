var express = require('express');
const passport = require('passport');
const {randomString} = require('../utils/setFile')
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render("loginGoogle", {title: 'Đăng nhập'});
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    function(req, res) {
    res.redirect('/index');
    }
)
router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})
router.get('/index', function (req, res,next){
    idRoom = randomString(10)
    res.render("index", {name:req.user.displayName,avata:req.user.photos[0].value,room:idRoom});
 });
router.get('/room', function (req, res,next){
   res.render("chat", {title : 'room'});
});
router.get('/call', function(req, res, next){
    res.render("videocall");
});
module.exports = router;
