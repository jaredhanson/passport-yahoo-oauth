# Passport-Yahoo-OAuth

[Passport](https://github.com/jaredhanson/passport) strategies for
authenticating with [Yahoo!](http://www.yahoo.com/) using the OAuth 1.0a API.

## Installation

    $ npm install passport-yahoo-oauth

## Usage

#### Configure Strategy

The Yahoo authentication strategy authenticates users using a Yahoo account
and OAuth tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a consumer key, consumer secret, and callback URL.

    passport.use(new YahooStrategy({
        consumerKey: YAHOO_CONSUMER_KEY,
        consumerSecret: YAHOO_CONSUMER_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/yahoo/callback"
      },
      function(token, tokenSecret, profile, done) {
        User.findOrCreate({ yahooId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'yahoo'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/yahoo',
      passport.authenticate('yahoo'),
      function(req, res){
        // The request will be redirected to Yahoo for authentication, so this
        // function will not be called.
      });

    app.get('/auth/yahoo/callback',
      passport.authenticate('yahoo', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Note regarding common "401 Unauthorized" request error

If you receive this error, it is most likely because you have not yet specified
any application "Permissions".  Once you do so, Yahoo! will generate new
credentials for usage, and will then authenticate your requests properly.

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-yahoo/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-yahoo-oauth.png)](http://travis-ci.org/jaredhanson/passport-yahoo-oauth)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
