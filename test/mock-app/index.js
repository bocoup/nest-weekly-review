'use strict';

var authModuleId = '../../src/server/auth';
var authModulePath = require.resolve(authModuleId);

if (process.env.NODE_ENV === 'production') {
  console.error(
    'Cannot run the development application in "production" mode.'
  );
  process.exit(1);
}

if (process.env.BP_BYPASS_AUTH) {
  // Prime the `require` cache
  require(authModuleId);
  // Inject the mock authentication router
  require.cache[authModulePath].exports = require('./auth');
}

require('../..');
