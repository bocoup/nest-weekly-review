'use strict';
var JsonApiCollection = require('./abstract/nest-api-collection');

var Employee = require('./employee');
var Utilizations = require('./utilizations');

module.exports = JsonApiCollection.extend({
  modelType: 'employees',
  model: Employee,

  /**
   * Specify the calendar ID for each employee's utilization collection. This
   * controls how new utilizations will be created and which utilizations are
   * displayed by the application.
   *
   * @param {number|null} id A "null" value designates that the default
   *                         calendar should be used.
   */
  setCalendarId: function(id) {
    this.calendarId = id;

    this.forEach(function(employee) {
      employee.get('utilizations').calendarId = id;
    });
  },

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

        this.setCalendarId(this.calendarId);
      }, this);

      if (success) {
        success.apply(this, arguments);
      }
    }.bind(this);

    utils.fetch(options);
  }
});
