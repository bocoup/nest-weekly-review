'use strict';
var os = require('../../../../src/client/modules/util/ordinal-suffix');

suite('ordinalSuffix', function() {
  test('0', function() {
    assert.equal(os(0), 'th');
  });

  test('1', function() {
    assert.equal(os(1), 'st');
  });

  test('2', function() {
    assert.equal(os(2), 'nd');
  });

  test('3', function() {
    assert.equal(os(3), 'rd');
  });

  test('4', function() {
    assert.equal(os(4), 'th');
  });

  test('8', function() {
    assert.equal(os(8), 'th');
  });

  test('11', function() {
    assert.equal(os(11), 'th');
  });

  test('12', function() {
    assert.equal(os(12), 'th');
  });

  test('13', function() {
    assert.equal(os(13), 'th');
  });

  test('21', function() {
    assert.equal(os(21), 'st');
  });

  test('32', function() {
    assert.equal(os(32), 'nd');
  });

  test('43', function() {
    assert.equal(os(43), 'rd');
  });

  test('54', function() {
    assert.equal(os(54), 'th');
  });

  test('111', function() {
    assert.equal(os(111), 'th');
  });

  test('1112', function() {
    assert.equal(os(1112), 'th');
  });

  test('11113', function() {
    assert.equal(os(11113), 'th');
  });
});
