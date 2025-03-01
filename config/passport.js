const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

const users = [{ id: '1', name: 'Samantha', email: 'samantha@example.com', password: 'pass123' }];

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return done(null, false, { message: 'Invalid credentials' });
    return done(null, user);
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    let user = users.find(u => u.email === profile.emails[0].value);
    if (!user) {
        user = { id: profile.id, name: profile.displayName, email: profile.emails[0].value };
        users.push(user);
    }
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

module.exports = { passport, users }; 
