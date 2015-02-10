'use strict';
var JsonApiCollection = require('./abstract/json-api-collection');

var Project = require('./project');

module.exports = JsonApiCollection.extend({
  modelType: 'projects',
  model: Project
});
