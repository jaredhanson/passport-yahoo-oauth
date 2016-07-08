/**
 * Module dependencies.
 */
var util = require('util'), 
	OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
	InternalOAuthError = require('passport-oauth').InternalOAuthError,
  crypto= require('crypto'),
  querystring= require('querystring'),
  https= require('https'),
  http= require('http'),
  url= require('url')
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
 * Override authenticate: 
 * inspired from post: http://yahoodevelopers.tumblr.com/post/105969451213/implementing-yahoo-oauth2-authentication
 *
 */
OAuth2Strategy.prototype.authenticate = function(req, options) {
  options = options || {};
  var self = this;
  
  if (req.query && req.query.error) {
    // TODO: Error information pertaining to OAuth 2.0 flows is encoded in the
    //       query parameters, and should be propagated to the application.
    return this.fail();
  }
  
  var callbackURL = options.callbackURL || this._callbackURL;
  if (callbackURL) {
    var parsed = url.parse(callbackURL);
    if (!parsed.protocol) {
      // The callback URL is relative, resolve a fully qualified URL from the
      // URL of the originating request.
      callbackURL = url.resolve(utils.originalURL(req), callbackURL);
    }
  }
  
  if (req.query && req.query.code) {
    var code = req.query.code;

    var params= params || {};
    params['client_id'] = self._options._clientId;
    params['client_secret'] = self._options._clientSecret;
    var codeParam = (params.grant_type === 'refresh_token') ? 'refresh_token' : 'authorization_code';
    params[codeParam]= code;

    var post_data= querystring.stringify( params );
    var post_headers= {
      'Content-Type': 'application/json'
    };

    var _authorization = [
      'Basic: ',
      new Buffer(self._options.clientID + ':' + self._options.clientSecret).toString('base64')
    ].join('');
    
    var request_options = {
      url: self._options.tokenURL,
      headers: {
        Authorization: _authorization
      },
      rejectUnauthorized: false,
      json: true,
      form: {
        code: code,
        redirect_uri: self._options.callbackURL,
        grant_type: codeParam
      }
    };

    request.post(request_options, function(err, response, body) {
      if (err) { return self.error(new InternalOAuthError('failed to obtain access token', err)); }

      var results = body;
      var guid = body.xoauth_yahoo_guid;
      var accessToken = body.access_token;
      var refreshToken = body.refresh_token;

      self._loadUserProfile({
        accessToken: accessToken,
        xoauth_yahoo_guid: guid
      }, function(err, profile) {
        if(err) return self.error(err);

        function verified(error, user, info) {
          if(error) return self.error(error);
          if(!user) return self.fail(info);

          return self.success(user, info);
        }

        if(self._passReqToCallback) {
          self._verify(req, accessToken, refreshToken, results, profile, verified);
        }else {
          self._verify(accessToken, refreshToken, results, profile, verified);
        }
      });
    });
  } else {
    // NOTE: The module oauth (0.9.5), which is a dependency, automatically adds
    //       a 'type=web_server' parameter to the query portion of the URL.
    //       This appears to be an artifact from an earlier draft of OAuth 2.0
    //       (draft 22, as of the time of this writing).  This parameter is not
    //       necessary, but its presence does not appear to cause any issues.
    
    var params = this.authorizationParams(options);
    params['response_type'] = 'code';
    params['redirect_uri'] = callbackURL;

    var scope = options.scope || this._scope;
    if (scope) {
      if (Array.isArray(scope)) { scope = scope.join(this._scopeSeparator); }
      params.scope = scope;
    }
    var state = options.state;
    if (state) { params.state = state; }
    
    var location = this._oauth2.getAuthorizeUrl(params);
    this.redirect(location);
  }
}

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
Strategy.prototype.userProfile = function (accessToken, xoauthYahooGuid, done) {

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
      json['id'] = json.guid;

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
}

/**
 * User profile
 * @param {Object} params
 * @param {Function} done
 * @private
 */
Strategy.prototype._loadUserProfile = function (params, done) {
  return this.userProfile(params.accessToken, params.xoauth_yahoo_guid, done);
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
