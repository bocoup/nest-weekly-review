'use strict';

var suffixes = ['th', 'st', 'nd', 'rd'];

/**
 * Return the English suffix for the ordinal form of a given integer.
 *
 * @param {number} num
 *
 * @returns {string}
 */
module.exports = function(num) {
  var tens = num % 100;
  if (tens > 9 && tens < 21) {
    return 'th';
  }

  return suffixes[tens % 10] || 'th';
};
