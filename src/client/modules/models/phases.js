'use strict';
var Collection = require('ampersand-rest-collection');

var Phase = require('./phase');
var Employees = require('./employees');
var getOrFetch = Collection.prototype.getOrFetch;

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  model: Phase,
  url: API_ROOT + '/project_phases',

  initialize: function() {
    this.employees = new Employees();
  },

  getOrFetchold: function() {
    var employees = this.employees;
    var callback = arguments[arguments.length - 1];
    var args = Array.prototype.slice.call(arguments);

    args[arguments.length - 1] = function(err, phase) {
      var done = callback.bind(this, err, phase);
      if (err) {
        done();
        return;
      }

      employees.fetchBetween({
        start: phase.get('date_start'),
        end: phase.get('date_end'),
        success: done,
        error: callback
      });
    };

    getOrFetch.apply(this, args);
  }
});
