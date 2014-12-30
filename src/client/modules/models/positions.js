'use strict';
var Collection = require('ampersand-rest-collection');

var Position = require('./position');
var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  url: API_ROOT + '/positions',
  model: Position,
  ajaxConfig: setBearer
});
