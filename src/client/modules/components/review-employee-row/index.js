'use strict';
var Moment = require('moment');

var Component = require('../../util/component');

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
    this.on('wr-employee-row-day.set', this.setUtilization.bind(this));
  },

  computed: {
    monday: function() {
      return new Moment(this.get('date')).add(1, 'days').toDate();
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
    this.selected = utilization.createMatching();
  },

  setUtilization: function(component, date, values) {
    var utilizations = this.get('utilizations');
    var old = utilizations.atDate(date);
    var current = utilizations.setAtDate(date, values, { silent: true });
    var done = function() {
      this.update('utilizations');
      component.set('isSaving', false);
    }.bind(this);

    current.set('verified', false, { silent: true });
    component.set('isSaving', true);

    utilizations.save().then(function() {
        component.set('utilization', current);
      }.bind(this), function(err) {
        utilizations.setAtDate(date, old, { silent: true });

        this.fire('error', {
          title: 'Failed to save utilization', desc: err
        });
      }.bind(this)).then(done, done);
  },

  brushUtilization: function(component, date) {
    if (!this.selected) {
      return;
    }

    this.setUtilization(component, date, this.selected);
  },

  deselectUtilization: function() {
    this.selected = null;
  }
});
