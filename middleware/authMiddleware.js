
module.exports = function (req, res, next) {
    // Ensure req.session exists before accessing user
//console.log(req.session.user);
    if (!req.session) {
        return res.status(500).json({ message: "Session not initialized properly." });
    }

    // Check if the user is logged in (except for login route)
    if (!req.session.user && req.url !== '/login') {
        // If not logged in, redirect to login
        return res.redirect('/login');
    }
    //console.log('File upload success');
    // Proceed to the next middleware or route handler
    next();
};
