'use strict';
var JsonApiCollection = require('./abstract/json-api-collection');

var Employee = require('./employee');
var Utilizations = require('./utilizations');

module.exports = JsonApiCollection.extend({
  modelType: 'employees',
  model: Employee,

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
  }
});
