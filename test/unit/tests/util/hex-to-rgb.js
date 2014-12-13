'use strict';

var hexToRgb = require('../../../../src/client/modules/util/hex-to-rgb');

describe('hexToRgb', function() {
  test('six character', function() {
    assert.equal(hexToRgb('100aff'), '16,10,255');
  });

  test('three character', function() {
    assert.equal(hexToRgb('a90'), '160,144,0');
  });
});
