'use strict';

var Promise = require('bluebird');

var spawnNpmScript = require('./spawn-npm-script');
var portGuard = require('./port-guard');

module.exports = function(port, apiUrl) {
  var env = {
    WR_API: apiUrl,
    WR_BYPASS_AUTH: '1',
    NODE_PORT: port,
    PATH: process.env.PATH
  };
  return portGuard(port, function() {
      var child = spawnNpmScript(
        '../../../package.json', 'start-dev', { env: env }
      );
      var kill = function() {
        child.kill();

        return new Promise(function(resolve, reject) {
          child.once('exit', resolve);
          child.once('error', reject);
        });
      };

      return kill;
    });
};
