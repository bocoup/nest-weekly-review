'use strict';
var Phase = require('../../../../src/client/modules/models/phase');

suite('Phases', function() {
  suite('#reviewAt', function() {
    var phase;
    setup(function() {
      phase = new Phase({
        id: 1,
        first_day: new Date(2014, 11, 7),
        reviews: [
          { id: 1, week_number: 2 },
          { id: 2, week_number: 3 },
          { id: 3, week_number: 4 }
        ]
      });
    });
    test('before phase', function() {
      assert.strictEqual(phase.reviewAt(new Date(2014, 11, 3)), null);
    });

    test('beginning of phase', function() {
      assert.strictEqual(phase.reviewAt(new Date(2014, 11, 7)), null);
    });

    test('before first review', function() {
      assert.strictEqual(phase.reviewAt(new Date(2014, 11, 20)), null);
    });

    test('beginning of first week', function() {
      assert.equal(phase.reviewAt(new Date(2014, 11, 21)), phase.reviews.at(0));
    });

    test('middle of first week', function() {
      assert.equal(phase.reviewAt(new Date(2014, 11, 24)), phase.reviews.at(0));
    });

    test('end of first week', function() {
      assert.equal(phase.reviewAt(new Date(2014, 11, 27)), phase.reviews.at(0));
    });

    test('beginning of second week', function() {
      assert.equal(phase.reviewAt(new Date(2014, 11, 28)), phase.reviews.at(1));
    });

    test('middle of second week', function() {
      assert.equal(phase.reviewAt(new Date(2015, 0, 1)), phase.reviews.at(1));
    });

    test('end of second week', function() {
      assert.equal(phase.reviewAt(new Date(2015, 0, 3)), phase.reviews.at(1));
    });

    test('beginning of third week', function() {
      assert.equal(phase.reviewAt(new Date(2015, 0, 4)), phase.reviews.at(2));
    });

    test('middle of third week', function() {
      assert.equal(phase.reviewAt(new Date(2015, 0, 7)), phase.reviews.at(2));
    });

    test('end of third week', function() {
      assert.equal(phase.reviewAt(new Date(2015, 0, 10)), phase.reviews.at(2));
    });

    test('after last review', function() {
      assert.equal(phase.reviewAt(new Date(2015, 0, 11)), null);
    });
  });
});
