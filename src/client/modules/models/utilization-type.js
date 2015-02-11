'use strict';
var Model = require('ampersand-model');

var parse = require('../util/parse-json-api-resp')('type');

module.exports = Model.extend({
  props: {
    'id': 'number',
    'name': 'string',
    'color': 'string',
    'project_required': 'boolean'
  },
  parse: parse
});
