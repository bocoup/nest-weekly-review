'use strict';
var JsonApiModel = require('./abstract/nest-api-model');

module.exports = JsonApiModel.extend({
  modelType: 'utilization-types',

  props: {
    'id': 'number',
    'name': 'string',
    'color': 'string',
    'project_required': 'boolean'
  }
});
