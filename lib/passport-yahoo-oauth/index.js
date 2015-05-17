/**
 * Module dependencies.
 */
var Strategy = require('./strategy');
var OAuth2Strategy = require('./oauth2');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;
exports.OAuth2Strategy = OAuth2Strategy;
