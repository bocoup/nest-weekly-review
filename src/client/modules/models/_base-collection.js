'use strict';
var Collection = require('ampersand-rest-collection');

module.exports = Collection.extend({
  typeAttribute: 'modelType',
  getType: function() {
    return this[this.typeAttribute];
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
