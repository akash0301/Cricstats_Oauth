//Importing required modules 
const express = require('express')
const passport = require('passport')
const router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile','email'], accessType: 'offline'}))

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/news')
    }
)

router.get('/logout', (req, res) => {
    req.logout()
    req.session.destroy();
    res.redirect('/')
})

module.exports = router