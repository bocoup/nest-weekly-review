'use strict';

function injectDependency(targetModuleId, mockModuleId) {
  var targetModulePath = require.resolve(targetModuleId);
  var mockModulePath = require.resolve(mockModuleId);

  // Prime the `require` cache. Run-time errors can be ignored because the
  // module will not be used.
  try {
    require(targetModuleId);
  } catch(err) {}

  // Inject the mock dependency
  require(mockModuleId);
  require.cache[targetModulePath] = require.cache[mockModulePath];
}

if (process.env.NODE_ENV === 'production') {
  console.error(
    'Cannot run the development application in "production" mode.'
  );
  process.exit(1);
}

if (process.env.BP_BYPASS_AUTH) {
  injectDependency('../../src/server/auth', './auth');
}

injectDependency('../../src/server/serve-app', './serve-app');

require('../..');
