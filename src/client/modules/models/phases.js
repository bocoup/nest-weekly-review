'use strict';
var Collection = require('ampersand-rest-collection');

var Phase = require('./phase');
var Employees = require('./employees');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  model: Phase,
  url: API_ROOT + '/project_phases',

  initialize: function() {
    this.employees = new Employees();
  },

  fetchByProject: function(projectId, options) {
    options.url = this.url + '?project_id=' + projectId;

    return this.fetch(options);
  }
});
