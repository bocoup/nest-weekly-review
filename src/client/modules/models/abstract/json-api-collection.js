'use strict';
var Collection = require('ampersand-rest-collection');

var parse = require('../../util/parse-json-api-resp');
var setBearer = require('../../ajax-config');
var API_ROOT = require('../../api-root');

module.exports = Collection.extend({
  typeAttribute: 'modelType',
  ajaxConfig: setBearer,

  getType: function() {
    return this[this.typeAttribute];
  },

  url: function() {
    return API_ROOT + '/' + this.getType();
  },

  parse: function(data) {
    return parse(this.getType(), data);
  },

  serialize: function() {
    var wrapped = {};
    var type = this.getType();

    wrapped[type] = this.map(function(model) {
      return model.serialize()[type];
    });

    return wrapped;
  }
});
