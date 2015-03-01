'use strict';
var Model = require('ampersand-model');

var Organization = require('./organization');
var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');
var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Model.extend({
  urlRoot: API_ROOT + '/projects',
  ajaxConfig: setBearer,

  props: {
    id: 'number',
    name: 'string',
    date_start: 'date',
    calendar_weeks: 'number',
    developer_weeks: 'number'
  },
  children: {
    organization: Organization
  },

  derived: {
    date_end: {
      deps: ['date_start', 'calendar_weeks'],
      fn: function() {
        return new Date(
          this.get('date_start').getTime() +
          this.get('calendar_weeks') * WEEK_MS
        );
      }
    },
    org: {
      // will this work? seems like the dot notation would break down
      deps: ['organization', 'parent.project.organization'],
      fn: function () {
        if (this.parent) {
          return this.parent['project.organization'];
        }
        return this.organization;
      }
    }
  },

  /**
   * Fetch phase data for the current project.
   *
   * Although the endpoint driving this model returns some phase data, it does
   * not include employee membership information. In cases where that is
   * required, a dedicated request must be made.
   *
   * @param {Object} [options] Behavior modifiers exposed by
   *                           `Collection#fetch`.
   */
  fetchPhases: function(options) {
    return this.phases.fetchByProject(this.id, options);
  },

  parse: function(attrs) {

    if ('date_start' in attrs) {
      attrs.date_start = new Date(attrs.date_start);
    }

    return attrs;
  }
});
