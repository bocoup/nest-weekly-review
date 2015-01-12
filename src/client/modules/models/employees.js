'use strict';
var Collection = require('ampersand-rest-collection');

var Employee = require('./employee');
var setBearer = require('../ajax-config');
var parse = require('../util/parse-json-api-resp')('employees');
var Utilizations = require('./utilizations');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  model: Employee,
  ajaxConfig: setBearer,
  url: API_ROOT + '/employees',

  fetchUtilizations: function(options) {
    var ids = this.pluck('id');
    var success = options.success;
    var utils = new Utilizations();

    options.data = {
      employee_id: ids.join(','),
      include: ['project', 'type']
    };

    options.success = function() {
      this.forEach(function(employee) {
        employee.set('utilizations', utils.select(function(utilization) {
          return utilization.get('employee_id') === employee.get('id');
        }));
      }, this);

      if (success) {
        success.apply(this, arguments);
      }
    }.bind(this);

    utils.fetch(options);
  },

  parse: parse
});
