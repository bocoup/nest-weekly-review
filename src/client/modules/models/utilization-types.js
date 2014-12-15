'use strict';
var Collection = require('ampersand-rest-collection');
var UtilizationType = require('./utilization-type');

module.exports = Collection.extend({
  url: '/api/utilization_types',
  model: UtilizationType
});
