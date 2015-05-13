'use strict';
var JSONApiModel = require('./abstract/nest-api-model');

module.exports = JSONApiModel.extend({
  modelType: 'project-phase-reviews',

  props: {
    id: 'number',
    project_phase_id: 'number',
    week_number: 'number',
    notes: 'string'
  }
});
