'use strict';
var PhaseReviews = require('../../../../src/client/modules/models/phase-reviews');

suite('PhaseReviews', function() {
  suite('#atWeek', function() {
    var reviews;

    setup(function() {
      reviews = new PhaseReviews([
        { id: 1, week_number: 2 },
        { id: 2, week_number: 3 },
        { id: 3, week_number: 4 }
      ]);
    });

    test('empty set', function() {
      var emptySet = new PhaseReviews();
      assert.strictEqual(emptySet.atWeek(0), null);
    });

    test('none (before all)', function() {
      assert.strictEqual(reviews.atWeek(1), null);
    });

    test('first', function() {
      assert.strictEqual(reviews.atWeek(2), reviews.at(0));
    });

    test('middle', function() {
      assert.strictEqual(reviews.atWeek(3), reviews.at(1));
    });

    test('middle (with string)', function() {
      assert.strictEqual(reviews.atWeek('3'), reviews.at(1));
    });

    test('final', function() {
      assert.strictEqual(reviews.atWeek(4), reviews.at(2));
    });

    test('none (after all)', function() {
      assert.strictEqual(reviews.atWeek(5), null);
    });
  });
});
