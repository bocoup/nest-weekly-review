'use strict';
var JsonApiCollection = require('./abstract/nest-api-collection');
var UtilizationType = require('./utilization-type');

module.exports = JsonApiCollection.extend({
  modelType: 'utilization-types',
  model: UtilizationType
});
