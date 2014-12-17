'use strict';
var Collection = require('ampersand-rest-collection');

var Project = require('./project');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  url: API_ROOT + '/projects?with_phases',
  model: Project
});
