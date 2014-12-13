'use strict';
var Collection = require('ampersand-rest-collection');
var Employee = require('./employee');

function formatDateParam(date) {
  return date.toISOString().replace(/T.*$/, '');
}

module.exports = Collection.extend({
  model: Employee,
  url: '/api/utilizations',
  fetchBetween: function(options) {
    this.fetch({
      success: options.success,
      failure: options.failure,
      data: {
        start: formatDateParam(options.start),
        end: formatDateParam(options.end)
      }
    });
  }
});
