'use strict';
var Collection = require('ampersand-rest-collection');

var Employee = require('./employee');
var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');

module.exports = Collection.extend({
  model: Employee,
  ajaxConfig: setBearer,
  url: API_ROOT + '/employees/utilizations',

  fetchUtilizations: function(options) {
    var ids = this.pluck('id');
    var success = options.success;

    options.url = this.url + '?ids=' + ids.join(',');
    options.success = function(resp) {
      this.reset(resp, options);

      if (success) {
        success(this, resp, options);
      }
    }.bind(this);

    this.sync('read', this, options);
  }
});
