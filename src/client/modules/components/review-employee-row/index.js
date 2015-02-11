'use strict';
var Component = require('../../util/component');

var DAY_MS = 1000 * 60 * 60 * 24;

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'wr-employee-row-day': require('../review-employee-row-day/index')
  },

  onconstruct: function() {
    this.on('wr-employee-row-day.select', this.selectUtilization.bind(this));
    this.on('wr-employee-row-day.deselect', this.deselectUtilization.bind(this));
    this.on('wr-employee-row-day.brush', this.brushUtilization.bind(this));
  },

  computed: {
    monday: function() {
      return new Date(this.get('date').getTime() + DAY_MS);
    },
    verified: {
      get: function() {
        return this.isVerified();
      },
      set: function(val) {
        var monday = this.get('monday');
        var utilizations = this.get('utilizations');

        this.set('_verified', val);

        if (!val) {
          return;
        }

        // The `Utilizations#verify` method may change more than one model.
        // Make these changes "silently" and then explicitly notify Ractive.js
        // of the change after the fact to avoid UI thrashing while rendering
        // databound structures.
        utilizations.verify(monday, 5, { silent: true });
        this.update('utilizations');
      }
    }
  },

  isVerified: function() {
    return this.get('utilizations').areVerified(this.get('monday'), 5);
  },

  selectUtilization: function(utilization) {
    this.selected = utilization.createMatching().toJSON();
  },

  brushUtilization: function(component, date) {
    if (!this.selected) {
      return;
    }

    component.setAndSave(date, this.selected);
  },

  deselectUtilization: function() {
    this.selected = null;
  }
});
