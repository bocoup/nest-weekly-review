'use strict';
var JsonApiCollection = require('./abstract/json-api-collection');

var Position = require('./position');

module.exports = JsonApiCollection.extend({
  modelType: 'positions',
  model: Position
});
