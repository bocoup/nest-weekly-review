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

        if (!val) {
          return;
        }

        if (!utilizations.fullyUtilized(monday, 5)) {
          this.fire('error', {
            title: 'Cannot verify developer week.',
            desc: 'A utilization must be set for every weekday before that ' +
              'week can be verified.'
          });

          // Explicitly uncheck the "verify" input element in this component's
          // DOM.
          // TODO: Investigate why this is necessary (calling
          //       `this.update('verified')` has no effect.
          this.nodes['verify-' + this.get('employee.id')].checked = false;

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
