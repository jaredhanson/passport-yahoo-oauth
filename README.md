# Passport-Yahoo-OAuth

[Passport](http://passportjs.org/) strategies for authenticating with [Yahoo!](http://www.yahoo.com/)
using the OAuth 1.0a API and Oauth 2.0.

This module lets you authenticate using Yahoo! in your Node.js applications.
By plugging into Passport, Yahoo! authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation
    - Original version
    $ npm install passport-yahoo-oauth
    - Forked version
    $ npm install passport-yahoo-oauth2

## Usage

#### Configure Strategy

#### OAuth 1
var YahooStrategy = require('passport-yahoo-oauth').Strategy;

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

#### OAuth2 (forked version)
var YahooStrategy = require('passport-yahoo-oauth2').OAuth2Strategy;

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
      passport.authenticate('yahoo'));

    app.get('/auth/yahoo/callback',
      passport.authenticate('yahoo', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-yahoo/tree/master/examples/login).

## Issues

If you receive a `401 Unauthorized` error, it is most likely because you have
not yet specified any application "Permissions".  Once you do so, Yahoo! will
generate new credentials for usage, and will then authenticate your requests
properly.

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-yahoo-oauth.png)](http://travis-ci.org/jaredhanson/passport-yahoo-oauth)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - [Sahat Yalkabov](https://twitter.com/EvNowAndForever)
  - [Eugene Obrezkov](https://github.com/ghaiklor)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/vK9dyjRnnWsMzzJTQ57fRJpH/jaredhanson/passport-yahoo-oauth'>  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/vK9dyjRnnWsMzzJTQ57fRJpH/jaredhanson/passport-yahoo-oauth.svg' /></a>
