'use strict';
var Ractive = require('ractive/ractive.runtime');

module.exports = Ractive.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-phase-day': require('./phase-day')
  }
});
