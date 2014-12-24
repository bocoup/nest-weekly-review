'use strict';
var Component = require('../../util/component');

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
      return this.get('activePhases').map(function(phase) {
        return phase.project;
      }).filter(function(project, until, projects) {
        var idx;

        for (idx = 0; idx < until; ++idx) {
          if (projects[idx].id === project.id) {
            return false;
          }
        }

        return true;
      });
    }
  }
});
