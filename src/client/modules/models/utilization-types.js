'use strict';
var Collection = require('ampersand-rest-collection');
var UtilizationType = require('./utilization-type');
var setBearer = require('../ajax-config');
var parse = require('../util/parse-json-api-resp')('utilization-types');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  url: API_ROOT + '/utilization-types',
  model: UtilizationType,
  ajaxConfig: setBearer,

  parse: parse
});
