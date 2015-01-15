'use strict';
var Model = require('ampersand-model');

var UtilizationType = require('./utilization-type');
var setBearer = require('../ajax-config');
var parse = require('../util/parse-json-api-resp')('utilization');
var dateStr = require('../util/date-string');

var API_ROOT = require('../api-root');

module.exports = Model.extend({
  urlRoot: API_ROOT + '/utilizations',
  ajaxConfig: setBearer,
  parse: parse,
  dataTypes: {
    dateStr: dateStr
  },

  props: {
    id: 'number',
    utilization_type_id: 'number',
    employee_id: 'number',
    position_id: 'number',
    project_id: 'number',
    project_phase_id: 'number',
    first_day: 'dateStr',
    last_day: 'dateStr',
    project: 'object',
    verified: 'boolean'
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
   * @param {Utilization|object} other
   *
   * @returns {boolean}
   */
  matches: function(other) {
    if (!other) {
      return false;
    }

    if (other.toJSON) {
      other = other.toJSON();
    }

    return this.get('utilization_type_id') === other.utilization_type_id &&
      this.get('employee_id') === other.employee_id &&
      this.get('position_id') === other.position_id &&
      this.get('project_id') === other.project_id &&
      this.get('project_phase_id') === other.project_phase_id;
  },

  /**
   * Create a new Utilization model that "matches" the current model (see
   * description of `Utilization#matches` for more on utilization matching).
   * Initialze the new model with any additional attributes.
   *
   * @param {object} [attrs] - Additional attributes to set on the new model
   *
   * @returns {Utilization}
   */
  createMatching: function(attrs) {
    var project = this.get('project');
    var type = this.get('type');

    attrs = attrs || {};
    attrs.utilization_type_id = this.get('utilization_type_id');
    attrs.employee_id = this.get('employee_id');
    attrs.position_id = this.get('position_id');
    attrs.project_id = this.get('project_id');
    attrs.project_phase_id = this.get('project_phase_id');

    if (project) {
      attrs.project = project;
    }

    if (type) {
      attrs.type = type.toJSON();
    }

    return new module.exports(attrs);
  }
});
