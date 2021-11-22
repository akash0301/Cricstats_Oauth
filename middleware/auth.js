
module.exports = {
    // if user is authenticated the redirected to next page else redirect to login page
    ensureAuth: function (req, res, next) {

        let token = req.cookies['x-access-token'];
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        if (req.isAuthenticated() || (token!==null && token!==undefined && token!=="")) {
            return next()
        } else {
            res.redirect('/')
        }
    },

    // if user is authenticated and going to login page then redirected to home page if not authenticated redirected to login page  .
    ensureGuest: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/news');
        }
    },
}