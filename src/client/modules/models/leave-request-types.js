'use strict';

var JsonApiCollection = require('./abstract/nest-api-collection');
var LeaveRequestType = require('./leave-request-type');

module.exports = JsonApiCollection.extend({
  modelType: 'leave-request-types',
  model: LeaveRequestType
});
