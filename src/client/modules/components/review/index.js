'use strict';
var Component = require('../../util/component');

var WEEK_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  partials: {
    fullDate: require('../../partials/full-date.html')
  },
  components: {
    'bp-employee-row': require('../review-employee-row')
  },
  computed: {
    activeProjects: function() {
      var reviewStart = this.get('date').getTime();
      var reviewEnd = reviewStart + WEEK_MS;

      return this.get('projects').filter(function(project) {
        var projectStart = project.get('date_start').getTime();
        var projectEnd = project.get('date_end').getTime();
        return projectStart <= reviewEnd && projectEnd >= reviewStart;
      });
    }
  }
});
