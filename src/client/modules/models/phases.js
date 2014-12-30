'use strict';
var Collection = require('ampersand-rest-collection');

var Phase = require('./phase');
var Employees = require('./employees');
var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  model: Phase,
  url: API_ROOT + '/project-phases',
  ajaxConfig: setBearer,

  initialize: function() {
    this.employees = new Employees();
  },

  /**
   * Retrieve phase data for a specific project.
   *
   * @param {number} projectId
   * @param {object} [options] Behavior modifiers exposed by
   *                           `Collection#fetch`.
   */
  fetchByProject: function(projectId, options) {
    options.url = this.url + '?project_id=' + projectId;

    return this.fetch(options);
  }
});
