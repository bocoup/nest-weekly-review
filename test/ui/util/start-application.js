'use strict';

var spawnNpmScript = require('./spawn-npm-script');

var pollHttp = require('./poll-http');

module.exports = function(applicationPort, mockApiPort) {
  var env = {
    WR_API: 'http://localhost:' + mockApiPort,
    WR_BYPASS_AUTH: '1',
    NODE_PORT: applicationPort,
    PATH: process.env.PATH
  };
  var child = spawnNpmScript(
    '../../../package.json', 'start-dev', { env: env }
  );
  var kill = child.kill.bind(child, 'SIGTERM');

  return pollHttp(applicationPort).then(function() {
      return kill;
    }, function(err) {
      try {
        kill();
      } catch(err) {}

      throw err;
    });
};
