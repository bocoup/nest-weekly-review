'use strict';
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
