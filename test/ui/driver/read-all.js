'use strict';
var Promise = require('bluebird');

/**
 * Get the visible text in one or more LeadFoot Element instances.
 *
 * @param {Array<Leadfoot.Element>} els
 *
 * @returns {Promise} Eventual Array of strings
 */
module.exports = function(els) {
  return Promise.all(els.map(function(el) {
    return el.getVisibleText();
  }));
};
