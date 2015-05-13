'use strict';
var JsonApiModel = require('./abstract/nest-api-model');

module.exports = JsonApiModel.extend({
  modelType: 'organizations',
  props: {
    'id': 'number',
    'name': 'string'
  }
});
