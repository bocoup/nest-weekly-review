'use strict';
var Model = require('ampersand-model');

var UtilizationType = require('./utilization-type');
var setBearer = require('../ajax-config');
var parse = require('../util/parse-json-api-resp')('utilization');

var API_ROOT = require('../api-root');
var local = new Date('2014-01-01').getTime();

// TODO: Remove this when/if it is implemented upstream:
// https://github.com/AmpersandJS/ampersand-state/pull/124
var tzPattern = /(Z|[-+]\d\d:\d\d)$/;
function normalize(date) {
  var offset;

  if (typeof date !== 'string') {
    return date;
  } else if (tzPattern.test(date)) {
    return date;
  }

  offset = new Date(2014, 0, 1) - local;

  // The offset will be zero in the follow cases:
  //
  // 1. The client's time zone is currently equivalent to GMT
  // 2. The code is executed in an ECMAScript 6-compliant environment (where
  //    date strings without explicit time zone information are interpreted in
  //    the local time zone).
  //
  // The offset value cannot be pre-computed or cached because it will vary in
  // accordance with the client's time settings and entrance/exit of daylight
  // savings time.
  if (offset === 0) {
    return date;
  }

  return new Date(new Date(date).getTime() + offset);
}

module.exports = Model.extend({
  urlRoot: API_ROOT + '/utilizations',
  ajaxConfig: setBearer,
  parse: function(data) {
    data = parse(data);

    if (data) {
      if (typeof data.first_day) {
        data.first_day = normalize(data.first_day);
      }
      if (typeof data.last_day) {
        data.last_day = normalize(data.last_day);
      }
    }

    return data;
  },

  props: {
    id: 'number',
    utilization_type_id: 'number',
    employee_id: 'number',
    position_id: 'number',
    project_id: 'any',
    first_day: 'date',
    last_day: 'date',
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
    if (other.toJSON) {
      other = other.toJSON();
    }

    return this.get('utilization_type_id') === other.utilization_type_id &&
      this.get('employee_id') === other.employee_id &&
      this.get('position_id') === other.position_id &&
      this.get('project_id') === other.project_id;
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

    if (project) {
      attrs.project = project;
    }

    if (type) {
      attrs.type = type;
    }

    return new module.exports(attrs);
  }
});
