'use strict';

var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var debug = require('debug')('selenium');

var portGuard = require('./port-guard');
var jarFile = require('selenium-binaries').seleniumserver;

module.exports = function(port) {
  return portGuard(port, function() {
      var child = spawn('java', [
        '-jar', jarFile,
        '-port', port
      ]);
      var killed = false;
      var kill = function() {
        if (!killed) {
          child.stderr.removeAllListeners();
          child.stdout.removeAllListeners();
          child.kill();
          killed = true;
        }

        return new Promise(function(resolve, reject) {
          child.once('exit', resolve);
          child.once('error', reject);
        });
      };

      /**
       * Although access to the output of the Selenium server can be useful
       * when debugging tests, the real motivation for the following code is to
       * prevent communication failure during tests. Attaching to a child
       * process's output stream shouldn't effect behavior, but it does.
       */
      child.stderr.on('data', function(chunk) {
        debug(String(chunk));
      });
      child.stdout.on('data', function(chunk) {
        debug(String(chunk));
      });

      return kill;
    });
};
