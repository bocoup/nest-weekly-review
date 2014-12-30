'use strict';

var spawn = require('child_process').spawn;

var pollHttp = require('./poll-http');
var jarFile = require('selenium-binaries').seleniumserver;

module.exports = function(port) {
  var child = spawn('java', [
    '-jar', jarFile,
    '-port', port
  ]);
  var kill = child.kill.bind(child);

  return pollHttp(port).then(function() {
      return kill;
    }, function(err) {
      try {
        kill();
      } catch (err) {}

      throw err;
    });
};
