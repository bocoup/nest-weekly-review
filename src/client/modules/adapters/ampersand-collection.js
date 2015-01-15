/**
 * @file Ractive.js "adapter" for Ampersand Rest Collections. Based on the
 * Backbone.js adapter maintained by the Ractive project:
 * https://github.com/ractivejs/ractive-adaptors-backbone
 */
'use strict';

var lockProperty = '_ractiveAdaptorsAmpersandCollectionLock';
var CollectionWrapper;

function acquireLock( key ) {
  key[lockProperty] = ( key[lockProperty] || 0 ) + 1;
  return function release() {
    key[lockProperty] -= 1;
    if ( !key[lockProperty] ) {
      delete key[lockProperty];
    }
  };
}

function isLocked( key ) {
  return !!key[lockProperty];
}

CollectionWrapper = function ( ractive, collection, keypath ) {
  this.value = collection;

  collection.on( 'add remove reset sort', this.changeHandler = function () {
    // TODO smart merge. It should be possible, if awkward, to trigger smart
    // updates instead of a blunderbuss .set() approach
    var release = acquireLock( collection );
    ractive.set( keypath, collection.models );
    release();
  });
};

CollectionWrapper.prototype = {
  teardown: function () {
    this.value.off( 'add remove reset sort', this.changeHandler );
  },
  get: function () {
    return this.value.models;
  },
  reset: function ( models ) {
    if ( isLocked( this.value ) ) {
      return;
    }

    // If the new object is an Ampersand collection, assume this one is being
    // retired. Ditto if it's not a collection at all
    if ( models.isCollection || Object.prototype.toString.call( models ) !== '[object Array]' ) {
      return false;
    }

    // Otherwise if this is a plain array, reset the collection
    this.value.reset( models );
  }
};

module.exports = {
  filter: function ( object ) {
    return object && object.isCollection;
  },
  wrap: function ( ractive, object, keypath, prefix ) {
    return new CollectionWrapper( ractive, object, keypath, prefix );
  }
};
