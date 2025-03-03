const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Mock database for users
const users = [
    { id: 1, name: "Rishi", email: "rishi@example.com", password: "pass123", isAdmin: true },
    { id: 2, name: "Samantha", email: "samantha@example.com", password: "pass123", isAdmin: false },
];

// Store users pending approval
const pendingUsers = []; 


passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        const user = users.find((user) => user.email === email);
        if (!user) {
            return done(null, false, { message: "No user with this email" });
        }
        if (user.password !== password) {
            return done(null, false, { message: "Incorrect password" });
        }
        if (user.pendingApproval) {
            return done(null, false, { message: "Your account is pending approval." });
        }
        return done(null, user);
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: "YOUR_GOOGLE_CLIENT_ID",
            clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
            callbackURL: "/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            let user = users.find((user) => user.googleId === profile.id);
            if (user) {
                if (user.pendingApproval) {
                    return done(null, false, { message: "Your account is pending approval." });
                }
                return done(null, user);
            }

            // If the user doesn't exist, add them to pendingUsers
            const newUser = {
                id: Date.now(),
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                isAdmin: false,
                pendingApproval: true,
            };
            pendingUsers.push(newUser); // Add to pending users
            return done(null, false, { message: "Your account is pending approval." });
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find((user) => user.id === id) || pendingUsers.find((user) => user.id === id);
    done(null, user);
});

module.exports = { users, pendingUsers };