'use strict';

var build = require('../../build/build');
var StringStream = require('./string-stream');

var providersSrc = 'module.exports = ' +
  JSON.stringify([
    { url: '/?access_token=fake-token-for-testing', name: 'Bypassed Auth' }
  ]) +
  ';';

module.exports = function(req, res) {
  var toInject = [];

  if (process.env.WR_BYPASS_AUTH) {
    toInject.push({
      file: new StringStream(providersSrc),
      expose: '../../auth-providers.json'
    });
  }

  build(toInject).pipe(res);
};
