'use strict';

/**
 * Continuously invoke some Promise-returning function until one of the
 * following events occurs:
 *
 * - the Promise it returns resolves successfully
 * - a certain amount of time has passed
 *
 * @param {Function} conditionFn should return a Promise with each invocation.
 *                               When the Promise is rejected, polling will
 *                               continue (unless the timoue has been reached).
 *                               When the Promise is fulfilled, the Promise
 *                               returned by this function will also be
 *                               fulfilled.
 * @param {object} [options]
 * @param {number} [options.timeout] the amount of time to wait before
 *                                   considering the polling operation "failed"
 *                                   and rejecting the returned Promise
 * @param {string} [options.errorMsg] the message with which to reject the
 *                                    Promise
 */
module.exports = function waitFor(conditionFn, options) {
  var start = new Date().getTime();
  var timeout, errorMsg;

  if (!options) {
    options = {};
  }

  timeout = options.timeout || 1000;
  errorMsg = options.errorMsg || 'Timeout';

  return conditionFn()
    .then(function(result) {
      var delay, remaining;

      if (result) {
        return;
      }

      delay = new Date().getTime() - start;
      remaining = timeout - delay;

      if (delay < 0) {
        throw new Error(errorMsg);
      }

      return waitFor(conditionFn, remaining);
    });
};
