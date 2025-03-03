// middleware/checkAuth.js

// Ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/"); // Redirect to login if not authenticated
  }
  
  // Ensure the user is an admin
  function ensureAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
      return next();
    }
    res.status(403).send("Access denied"); // Send 403 if the user is not an admin
  }
  
  module.exports = { ensureAuthenticated, ensureAdmin };