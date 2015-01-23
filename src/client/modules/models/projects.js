'use strict';
var Collection = require('ampersand-rest-collection');

var Project = require('./project');
var setBearer = require('../ajax-config');
var parse = require('../util/parse-json-api-resp')('projects');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  url: API_ROOT + '/projects',
  model: Project,
  ajaxConfig: setBearer,
  parse: parse
});
