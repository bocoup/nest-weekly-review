'use strict';
var JsonApiModel = require('./abstract/nest-api-model');

var UtilizationType = require('./utilization-type');
var dateStr = require('../util/date-string');

module.exports = JsonApiModel.extend({
  modelType: 'utilizations',
  dataTypes: {
    dateStr: dateStr
  },

  props: {
    id: 'number',
    utilization_type_id: 'number',
    leave_request_type_id: 'number',
    initiative_id: 'number',
    employee_id: 'number',
    project_id: 'number',
    project_phase_id: 'number',
    sketch_calendar_id: {
      type: 'number',
      default: null
    },
    first_day: 'dateStr',
    last_day: 'dateStr',
    project: 'object',
    verified: 'boolean',
    billable: 'boolean'
  },

  children: {
    type: UtilizationType
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
   * @param {Utilization|Object} other
   *
   * @returns {boolean}
   */
  matches: function(other) {
    var sketchMatch = true;
    var otherType;
    if (!other) {
      return false;
    }

    if (other.toJSON) {
      otherType = other.getType();
      other = other.toJSON();
      if (otherType) {
        other = other[otherType];
      }
    }

    if ('sketch_calendar_id' in other) {
      sketchMatch = this.get('sketch_calendar_id') === other.sketch_calendar_id;
    }

    return this.get('utilization_type_id') === other.utilization_type_id &&
      this.get('leave_request_type_id') === other.leave_request_type_id &&
      this.get('initiative_id') === other.initiative_id &&
      this.get('employee_id') === other.employee_id &&
      this.get('project_id') === other.project_id &&
      this.get('project_phase_id') === other.project_phase_id &&
      this.get('billable') === other.billable &&
      sketchMatch;
  },

  /**
   * Create a new Utilization model that "matches" the current model (see
   * description of `Utilization#matches` for more on utilization matching).
   * Initialze the new model with any additional attributes.
   *
   * @param {Object} [attrs] - Additional attributes to set on the new model
   *
   * @returns {Utilization}
   */
  createMatching: function(attrs) {
    var project = this.get('project');
    var type = this.get('type');
    var initiative = this.get('initiative');

    attrs = attrs || {};
    attrs.utilization_type_id = this.get('utilization_type_id');
    attrs.leave_request_type_id = this.get('leave_request_type_id');
    attrs.initiative_id = this.get('initiative_id');
    attrs.employee_id = this.get('employee_id');
    attrs.project_id = this.get('project_id');
    attrs.project_phase_id = this.get('project_phase_id');
    attrs.billable = this.get('billable');
    attrs.sketch_calendar_id = this.get('sketch_calendar_id');

    if (project) {
      attrs.project = project;
    }

    if (type) {
      attrs.type = type.toJSON()['utilization-types'];
    }

    if (initiative) {
      attrs.initiative = initiative.toJSON().initiatives;
    }

    return new module.exports(attrs);
  }
});
