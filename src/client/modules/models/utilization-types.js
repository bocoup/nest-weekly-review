'use strict';
var Collection = require('ampersand-rest-collection');
var UtilizationType = require('./utilization-type');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  url: API_ROOT + '/utilization_types',
  model: UtilizationType
});
