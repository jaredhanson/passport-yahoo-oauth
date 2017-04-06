'use strict';

/**
 * Module dependencies.
 */
var util = require('util'),
	OAuth2Strategy = require('passport-oauth2').Strategy,
	InternalOAuthError = require('passport-oauth2').InternalOAuthError,
  request = require('request');

/**
 * `Strategy` constructor.
 *
 * The Yahoo authentication strategy authenticates requests by delegating to
 * Yahoo using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to Yahoo
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *   - `callbackURL`     URL to which Yahoo will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new YahooStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/yahoo/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  //https://api.login.yahoo.com/oauth2/request_auth
  options = options || {};

  options.authorizationURL = options.authorizationURL || 'https://api.login.yahoo.com/oauth2/request_auth';
  options.tokenURL = options.tokenURL || 'https://api.login.yahoo.com/oauth2/get_token';
  options.profileURL = options.profileURL || 'https://social.yahooapis.com/v1/user/:xoauthYahooGuid/profile?format=json';

  OAuth2Strategy.call(this, options, verify);

  this._options = options;
  this.name = 'yahoo';
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Yahoo.
 * inpired from post: http://yahoodevelopers.tumblr.com/post/105969451213/implementing-yahoo-oauth2-authentication
 * other code from : passport-yahoo-token repo
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `displayName`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  var xoauthYahooGuid = 'me';

  this._oauth2._useAuthorizationHeaderForGET = true;
  var request_options = {
    url: this._options.profileURL.replace(':xoauthYahooGuid', xoauthYahooGuid),
    headers: {
      Authorization: this._oauth2.buildAuthHeader(accessToken)
    },
    rejectUnauthorized: false,
    json: true
  };

  request.get(request_options, function(err, response, body) {
    if(err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try{
      var json = body.profile;
      json.id = json.guid;

      var profile = {
        provider: 'yahoo',
        id: json.id,
        displayName: [json.givenName || '', json.familyName || ''].join(' '),
        name: {
          familyName: json.familyName || '',
          givenName: json.givenName || ''
        },
        emails: [{
          value: (json.emails && json.emails[0].handle) || '',
          type: (json.emails && json.emails[0].type) || ''
        }],
        photos: [{
          value: (json.image && json.image.imageUrl) || ''
        }],
        _raw: body,
        _json: json
      };
      done(null, profile);
    }catch(e) {
      done(e);
    }
  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
