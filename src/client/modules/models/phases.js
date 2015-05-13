'use strict';
var JsonApiCollection = require('./abstract/nest-api-collection');

var Phase = require('./phase');
var Employees = require('./employees');


module.exports = JsonApiCollection.extend({
  modelType: 'project-phases',
  model: Phase,

  initialize: function() {
    this.employees = new Employees();
  },

  /**
   * Retrieve phase data for a specific project.
   *
   * @param {number} projectId
   * @param {Object} [options] Behavior modifiers exposed by
   *                           `Collection#fetch`.
   */
  fetchByProject: function(projectId, options) {
    options.url = this.url + '?project_id=' + projectId;

    return this.fetch(options);
  }
});
