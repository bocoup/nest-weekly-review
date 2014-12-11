'use strict';
var Collection = require('ampersand-rest-collection');

var Employees = require('./employees');
var getOrFetch = Collection.prototype.getOrFetch;

module.exports = Collection.extend({
  model: require('./phase'),
  url: '/api/phases',

  initialize: function() {
    this.employees = new Employees();
  },

  getOrFetch: function() {
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
        success: function() {
          phase.detectUtilizations();
          done();
        }
      });
    };

    getOrFetch.apply(this, args);
  }
});
