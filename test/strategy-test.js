var vows = require('vows');
var assert = require('assert');
var util = require('util');
var YahooStrategy = require('passport-yahoo-oauth/strategy');


vows.describe('YahooStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new YahooStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
    },
    
    'should be named yahoo': function (strategy) {
      assert.equal(strategy.name, 'yahoo');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new YahooStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        var body = '{   \
          "profile":   \
          {  \
            "uri":"http:\/\/social.yahooapis.com\/v1\/user\/12345\/profile",   \
            "guid": "12345",   \
            "created": "2008-08-26T23:35:16Z",  \
            "familyName": "Edgerton",   \
            "gender": "F",  \
            "givenName": "Samantha",  \
            "memberSince": "1996-10-09T01:33:06Z",  \
            "image":   \
            {   \
              "height": 225,  \
              "imageUrl": "http:\/\/img.avatars.yahoo.com\/users\/1YfXUc4vMAAEB9IFDbJ_vk45UmUYE==.large.png",   \
              "size": "150x225",   \
              "width": 150   \
            },   \
            "interests":   \
            [   \
              {   \
                "declaredInterests":  \
                [  \
                  "Pottery",   \
                  "Tennis",   \
                  "Skiing",   \
                  "Hiking",   \
                  "Travel",   \
                  "picnics"  \
                ],   \
                "interestCategory": "prfFavHobbies"   \
              },   \
              {   \
                "declaredInterests":  \
                [  \
                  "Celtic"  \
                ],   \
                "interestCategory": "prfFavMusic"   \
              },   \
              {   \
                "declaredInterests":  \
                [  \
                  "Ratatouille"  \
                ],   \
                "interestCategory": "prfFavMovies"   \
              },  \
              {  \
                "declaredInterests": null,  \
                "interestCategory": "prfFavFutureMovies"  \
              },   \
              {   \
                "declaredInterests":  \
                [  \
                  ""  \
                ],   \
                "interestCategory": "prfFavBooks"   \
              },  \
              {  \
                "declaredInterests": null,  \
                "interestCategory": "prfFavFutureBooks"  \
              },   \
              {   \
                "declaredInterests":  \
                [  \
                  ""  \
                ],   \
                "interestCategory": "prfFavQuotes"   \
              },   \
              {   \
                "declaredInterests":  \
                [  \
                  "Indian",   \
                  "Ethiopean"  \
                ],   \
                "interestCategory": "prfFavFoods"   \
              },   \
              {   \
                "declaredInterests":  \
                [  \
                  "Britain",   \
                  "California"  \
                ],   \
                "interestCategory": "prfFavPlaces"   \
              },   \
              {  \
                "declaredInterests": null,  \
                "interestCategory": "prfFavFuturePlaces"  \
              },  \
              {   \
                "declaredInterests":  \
                [  \
                  ""  \
                ],   \
                "interestCategory": "prfFavAelse"   \
              }   \
            ],   \
            "lang": "en-US",   \
            "location": "Palo Alto",   \
            "lookingFor":   \
            [  \
              "FRIENDSHIP",  \
              "NETWORKING"  \
            ],   \
            "nickname": "Sam",  \
            "profileUrl": "http:\/\/social.yahooapis.com\/v1/user\/profile\/usercard",  \
             "relationshipStatus": "MARRIED",   \
            "schools":   \
            [   \
              {   \
                "id": 1,   \
                "schoolName": "San Francisco State University",  \
                "schoolType": "c",   \
                "schoolYear": "2005"   \
              },   \
              {   \
                "id": 2,   \
                "schoolName": "Univerity of Massachusetts",  \
                "schoolType": "c",   \
                "schoolYear": "1989"   \
              }   \
            ],   \
            "status":   \
            {   \
              "lastStatusModified": "2008-08-29",   \
              "message": "I&#39;m working"  \
            },   \
            "timeZone": "America\/Los_Angeles",   \
            "works":  \
            [   \
              {   \
                "current": true,   \
                "id": 3,   \
                "startDate": "2005-06-01",  \
                "title": "Documentation Manager",   \
                "workName": "Yahoo!"   \
              }   \
            ],   \
            "isConnected": true   \
          }   \
        }';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'yahoo');
        assert.equal(profile.id, '12345');
        assert.equal(profile.displayName, 'Samantha Edgerton');
        assert.equal(profile.name.familyName, 'Edgerton');
        assert.equal(profile.name.givenName, 'Samantha');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new YahooStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        callback(new Error('something went wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
