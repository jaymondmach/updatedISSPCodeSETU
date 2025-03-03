const express = require("express");
const passport = require("passport");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/checkAuth");
const { users } = require("../config/passport"); // Mock database

// Signup page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// Manual signup
router.post("/signup", (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user already exists
    if (users.find((user) => user.email === email)) {
        return res.send("User already exists");
    }

    // Add new user to mock database
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);

    // Automatically log in the new user
    req.login(newUser, (err) => {
        if (err) return res.send("Error during login");
        return res.redirect("/home");
    });
});

// Manual login
router.post(
    "/manual-login",
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/",
    })
);

// Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: "/home",
        failureRedirect: "/",
    })
);

// Logout Route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/"); // Redirect to home or login page after logout
    });
  });
  
  // Admin Dashboard (Only for Admins)
  router.get("/admin-dashboard", ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render("admin-dashboard", { user: req.user });
  });
  
  module.exports = router;