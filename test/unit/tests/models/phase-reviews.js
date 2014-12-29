'use strict';
var PhaseReviews = require('../../../../src/client/modules/models/phase-reviews');

suite('PhaseReviews', function() {
  suite('#forDate', function() {
    var reviews;

    setup(function() {
      reviews = new PhaseReviews([
        { id: 1, first_day: new Date(2014, 11, 7) },
        { id: 2, first_day: new Date(2014, 11, 14) },
        { id: 2, first_day: new Date(2014, 11, 21) }
      ]);
    });

    test('empty set', function() {
      var emptySet = new PhaseReviews();
      assert.strictEqual(emptySet.forDate(new Date(2014, 11, 6)), null);
    });

    test('no review (before all existing)', function() {
      assert.strictEqual(reviews.forDate(new Date(2014, 11, 6)), null);
    });

    test('no review (after all existing)', function() {
      assert.strictEqual(reviews.forDate(new Date(2014, 11, 28)), null);
    });

    suite('via timestamp', function() {
      test('beginning of first review in a set', function() {
        assert.equal(
          reviews.forDate(new Date(2014, 11, 7).getTime()),
          reviews.at(0)
        );
      });
      test('beginning of middle review in a set', function() {
        assert.equal(
          reviews.forDate(new Date(2014, 11, 14).getTime()),
          reviews.at(1)
        );
      });
      test('beginning of final review in a set', function() {
        assert.equal(
          reviews.forDate(new Date(2014, 11, 21).getTime()),
          reviews.at(2)
        );
      });
      test('during a given week', function() {
        assert.equal(
          reviews.forDate(new Date(2014, 11, 17).getTime()),
          reviews.at(1)
        );
      });
    });

    suite('via Date object', function() {
      test('beginning of first review in a set', function() {
        assert.equal(reviews.forDate(new Date(2014, 11, 7)), reviews.at(0));
      });
      test('beginning of middle review in a set', function() {
        assert.equal(reviews.forDate(new Date(2014, 11, 14)), reviews.at(1));
      });
      test('beginning of final review in a set', function() {
        assert.equal(reviews.forDate(new Date(2014, 11, 21)), reviews.at(2));
      });
      test('during a given week', function() {
        assert.equal(
          reviews.forDate(new Date(2014, 11, 17)),
          reviews.at(1)
        );
      });
    });
  });
});
