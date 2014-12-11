'use strict';
var Model = require('ampersand-model');

module.exports = Model.extend({
  props: {
    id: 'number',
    utilization_type_id: 'number',
    employee_id: 'number',
    position_id: 'number',
    project_id: 'any',
    first_day: 'date',
    last_day: 'date',
    project: 'object',
    type: 'object'
  },

  /**
   * Determine if a given date falls within the time span described by the
   * utilization.
   *
   * @param {Date} date
   *
   * @returns {boolean}
   */
  includes: function(date) {
    var timestamp = date.getTime();
    return this.get('first_day').getTime() <= timestamp &&
      this.get('last_day').getTime() >= timestamp;
  },

  /**
   * Determine if another utilization model (or collection of properties)
   * describes the same utilization type as this one.
   *
   * @param {Utilization|object} other
   *
   * @returns {boolean}
   */
  matches: function(other) {
    if (other.toJSON) {
      other = other.toJSON();
    }

    return this.get('utilization_type_id') === other.utilization_type_id &&
      this.get('employee_id') === other.employee_id &&
      this.get('position_id') === other.position_id &&
      this.get('project_id') === other.project_id;
  }
});
