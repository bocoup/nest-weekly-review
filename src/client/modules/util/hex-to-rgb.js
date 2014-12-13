'use strict';

/**
 * Create the comma-separated RGB representation of a hexidecimal color
 * definition.
 *
 * @param {string} hexString A color described in hexidecimal notation
 *
 * @returns {string} A comma-separated RGB representation of the color
 */
module.exports = function(hexString) {
  var advancement = hexString.length / 3;

  return [
    null, null, null
  ].map(function(_, idx) {
    var part = hexString.slice(idx * advancement, (idx + 1) * advancement);
    if (advancement === 1) {
      part += '0';
    }
    return parseInt(part, 16);
  }).join(',');
};
