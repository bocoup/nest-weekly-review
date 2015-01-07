'use strict';
var pollHttp = require('./poll-http');

/**
 * Wrap a server "start" function in asynchronous checks for port availability.
 * Fail if the port is already in use prior to function execution or if the
 * port does not become utilized after execution.
 *
 * The only reliable way to determine if a server process has started
 * successfully is to poll the port it has been assigned. If this port is
 * already in use*, the child process will fail to start, but the current
 * process will consider the operation a success. This invalidates the `kill`
 * function created by this module and will likely lead to errors during test
 * cleanup.
 *
 * * This condition will most commonly be caused by a zombie server instance
 *   erroneously created in some prior test run.
 *
 * @param {number} port
 * @param {function} startFn A function that starts a server process on the
 *                           supplied port. This function should return a
 *                           `kill` callback function that kills the server.
 *
 * @returns {Promise} rejected if the port is already in use or if requests to
 *                    the specified port fail after startup. Resolved with the
 *                    `kill` callback function provided by `startFn`.
 */
module.exports = function(port, startFn) {
  return pollHttp(port).then(function() {
      throw new Error(
          'Refusing to start server process on port ' + port +
          ' (port already in use)'
        );
    }, function() {
      // No server found; okay to proceed.
    }).then(function() {
      var kill = startFn();

      return pollHttp(port).then(function() {
        return kill;
      });
    });
};
