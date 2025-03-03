
//the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.pendingApproval) {
            return res.status(403).send("Your account is pending approval.");
        }
        return next();
    }
    res.redirect("/");
}

//the user is an admin
function ensureAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    res.status(403).send("Access denied");
}

module.exports = { ensureAuthenticated, ensureAdmin };