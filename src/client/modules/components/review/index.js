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
  },
  handleSubmit: function() {
    this.event.original.preventDefault();
    this.submit();
  },
  submit: function() {
    var employeeRows = this.findAllComponents('bp-employee-row');
    var allVerified = employeeRows.every(function(employeeRow) {
      return employeeRow.get('verified');
    });

    if (!allVerified) {
      this.fire(
        'error',
        'Please verify utilizations for all employees before submitting ' +
          'the review.'
      );
      return;
    }

    // TODO: Verify each utilization for each employee.
    this.get('review').save();
  }
});
