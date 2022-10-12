var passport = require("passport.js");

module.exports = function (app) {

    app.get("/auth/yahoo/callback",
        passport.authenticate("oauth2", { failureRedirect: "/oauth-error", session: true }),
        function (req, res) {
            //
            // Your code, post-authentication
            //
            // Example:
            res.json(req.user);
        });

}