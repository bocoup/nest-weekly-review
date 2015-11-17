'use strict';
var Table = require('cli-table');
var wrap = require('wordwrap');

var configurableItems = [
  {
    name: 'WR_API',
    desc: 'Data source',
    dflt: 'https://api-staging.bocoup.com/v1'
  },
  { name: 'NODE_PORT', desc: 'Application server port', dflt: '8000' },
  {
    name: 'WR_BYPASS_AUTH',
    desc: 'Bypass authentication. Set to any value to enable',
    dflt: ''
  }
];
var tableStr;

function processEnv() {
  var colWidths = [16, 29, 25, 30];
  var wrapFns = colWidths.map(function(width) { return wrap.hard(width - 1); });
  var table = new Table({
    head: ['Environmental\nVar', 'Description', 'Default', 'Current value'],
    colWidths: colWidths
  });

  configurableItems.forEach(function(item) {
    var name = item.name;
    var rows;

    if (!(name in process.env)) {
      process.env[name] = item.dflt;
    }

    rows = [name, item.desc, item.dflt, process.env[item.name]]
      .map(String)
      .map(function(val, idx) {
        return wrapFns[idx](val);
      });

    table.push(rows);
  });

  return table.toString();
}

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

tableStr = processEnv();

if (process.env.NODE_ENV === 'production') {
  console.error(
    'Cannot run the development application in "production" mode.'
  );
  process.exit(1);
}

injectDependency('../../src/server/serve-app', './serve-app');

require('../..');

console.log(tableStr);
