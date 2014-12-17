'use strict';
var Model = require('ampersand-model');

var Utilizations = require('./utilizations');

module.exports = Model.extend({
  props: {
    id: 'number',
    first: 'string',
    last: 'string',
    github_user: 'string'
  },
  collections: {
    utilizations: Utilizations
  },
  setUtilizations: function(allEmployees) {
    var id = this.get('id');
    allEmployees.forEach(function(employee) {
      if (employee.get('id') !== id) {
        return;
      }

      //this.set('utilizations', new Utilizations(employee.utilizations));
    }, this);
  }
});
