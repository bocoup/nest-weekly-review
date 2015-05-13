'use strict';
var JsonApiCollection = require('./abstract/nest-api-collection');

var Project = require('./project');

module.exports = JsonApiCollection.extend({
  modelType: 'projects',
  model: Project
});
