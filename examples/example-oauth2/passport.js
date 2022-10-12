var passport = require("passport");
var OAuth2Strategy = require("passport-oauth2");
var yahooConsumerKey = process.env.yahooConsumerKey;
var yahooConsumerSecret = process.env.yahooConsumerSecret;
var yahooCallbackURL = process.env.yahooCallbackURL;
var fetch = require("node-fetch");

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// ------------------------------------
// Yahoo Login OAuth2 passport strategy
// ------------------------------------
passport.use(new OAuth2Strategy({
    authorizationURL: `https://api.login.yahoo.com/oauth2/request_auth_fe?client_id=${yahooConsumerKey}&response_type=code&redirect_uri=${yahooCallbackURL}&language=en-US`,
    tokenURL: "https://api.login.yahoo.com/oauth2/get_token",
    clientID: yahooConsumerKey,
    clientSecret: yahooConsumerSecret,
    callbackURL: yahooCallbackURL
},
async function (accessToken, refreshToken, profile, cb) {
    let authHead = "Bearer " + accessToken;
    var profile = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
        method: "GET",
        headers: {
            "host": "api.login.yahoo.com",
            "Authorization": authHead
        }
    })
        .then(response => response.json())
        .catch(error => console.log("error", error));
    return cb(null, profile);
}
));

module.exports = passport;