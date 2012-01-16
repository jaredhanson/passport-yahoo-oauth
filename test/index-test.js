var vows = require('vows');
var assert = require('assert');
var util = require('util');
var yahoo = require('passport-yahoo-oauth');


vows.describe('passport-yahoo').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(yahoo.version);
    },
  },
  
}).export(module);
