'use strict';
var Table = require('cli-table');
var table = new Table({
  head: ['Environmental Var', 'Description', 'Current value'],
});
var configurableItems = [
  { name: 'BP_API', desc: 'Data source' },
  { name: 'NODE_PORT', desc: 'Application server' },
  { name: 'BP_BYPASS_AUTH', desc: 'Toggle authentication' }
];

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

process.env.BP_API = process.env.BP_API || 'https://api-staging.bocoup.com';

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

configurableItems.forEach(function(item) {
  table.push([
    item.name, item.desc, JSON.stringify(process.env[item.name] || '')
  ]);
});

console.log(table.toString());
