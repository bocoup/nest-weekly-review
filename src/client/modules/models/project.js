'use strict';
var Model = require('ampersand-model');

var Organization = require('./organization');
var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');

module.exports = Model.extend({
  urlRoot: API_ROOT + '/projects',
  ajaxConfig: setBearer,

  props: {
    id: 'number',
    name: 'string',
    first_day: 'date',
    calendar_weeks: 'number',
    developer_weeks: 'number'
  },
  children: {
    organization: Organization
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

    if ('first_day' in attrs) {
      attrs.first_day = new Date(attrs.first_day);
    }

    return attrs;
  }
});
