'use strict';
var BaseModel = require('./_base-model');
var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');

module.exports = BaseModel.extend({
  modelType: 'project-phase-reviews',
  urlRoot: API_ROOT + '/project-phase-reviews',
  ajaxConfig: setBearer,

  props: {
    id: 'number',
    project_phase_id: 'number',
    week_number: 'number',
    notes: 'string'
  }
});
