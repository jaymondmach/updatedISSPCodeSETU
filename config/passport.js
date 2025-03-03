const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const users = [
    { id: 1, name: "Rishi", email: "rishi@example.com", password: "pass123", isAdmin: true },
    { id: 2, name: "Samantha", email: "samantha@example.com", password: "pass123", isAdmin: false },
]; // Mock database for users

// Local strategy
passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        const user = users.find((user) => user.email === email);
        if (!user) {
            return done(null, false, { message: "No user with this email" });
        }
        if (user.password !== password) {
            return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
    })
);

// Google strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: "YOUR_GOOGLE_CLIENT_ID",
            clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
            callbackURL: "/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            let user = users.find((user) => user.googleId === profile.id);
            if (!user) {
                user = {
                    id: Date.now().toString(),
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                };
                users.push(user);
            }
            return done(null, user);
        }
    )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find((user) => user.id === id);
    done(null, user);
});

module.exports = { users }; // Export the mock database