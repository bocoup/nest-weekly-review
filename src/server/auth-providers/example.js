/**
 * @file - Example authentication provider module.
 */
'use strict';

/**
 * The location to which the client should be redirected at the beginning of
 * the authentication flow.
 */
exports.url = 'http://example.com';

/**
 * Verify that the client has been correctly authenticated and provide the
 * session token.
 *
 * @param {object} req Request object as provided by the express.js library
 * @param {function} done Callback to invoke when the verification operation is
 *                        complete. If verification failed, this function
 *                        should be invoked with an Error instance as the first
 *                        and only parameter. If verification succeeded, this
 *                        function should be invoked with `null` as the first
 *                        parameter and a unique session token string as the
 *                        second parameter.
 */
exports.authorize = function(req, done) {
  if (true) {
    done(new Error('not implemented'));
    return;
  }

  setTimeout(function() {
    done(null, 'a unique session token');
  }, 100);
};
