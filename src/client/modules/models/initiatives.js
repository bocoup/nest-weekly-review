'use strict';
var JsonApiCollection = require('./abstract/nest-api-collection');
var Initiative = require('./initiative');

module.exports = JsonApiCollection.extend({
  modelType: 'initiatives',
  model: Initiative
});
