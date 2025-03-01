const express = require('express');
const passport = require('passport');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth'); 
const { users } = require('../config/passport'); 

//const users = []; // Mock database

router.get('/signup', (req, res) => {
    res.render('signup');  
});

// Manual Signup
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user already exists
    if (users.find(user => user.email === email)) {
        return res.send('User already exists');
    }

    // Add new user to mock database
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);

    // Automatically log in the new user
    req.login(newUser, (err) => {
        if (err) return res.send('Error during login');
        return res.redirect('/home');  
    });
});

// Manual Login
router.post('/manual-login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/'
}));

// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/'
}));

// Logout
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

router.get('/home', checkAuth, (req, res) => {
    res.render('home', { user: req.user });
});

module.exports = router;
