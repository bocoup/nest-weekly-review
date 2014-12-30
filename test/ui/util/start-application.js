'use strict';

var spawn = require('child_process').spawn;

var pollHttp = require('./poll-http');

module.exports = function(port) {
  var env = {
    BP_BYPASS_AUTH: '1',
    NODE_PORT: port,
    PATH: process.env.PATH
  };
  var child = spawn('node',  ['.'], { env: env });
  var kill = child.kill.bind(child, 'SIGKILL');

  return pollHttp(port).then(function() {
      return kill;
    }, function(err) {
      try {
        kill();
      } catch(err) {}

      throw err;
    });
};
