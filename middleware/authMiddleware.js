module.exports = function (req, res, next) {
    // Check if session is initialized
    if (!req.session) {
        return res.status(500).json({ message: "Session not initialized properly." });
    }

    // Allow access to login and phpmyadmin without authentication
    const allowedPaths = ['/login', '/phpmyadmin'];

    if (!req.session.user && !allowedPaths.includes(req.url)) {
        return res.redirect('/login');
    }

    // Proceed to the next middleware or route
    next();
};
