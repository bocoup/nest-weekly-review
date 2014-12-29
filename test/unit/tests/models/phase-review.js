'use strict';
var PhaseReview = require('../../../../src/client/modules/models/phase-review');

suite('PhaseReview', function() {
  test('`first_day` attribute', function() {
    var review = new PhaseReview({ first_day: '2014-12-21T05:00:00.000Z' });

    assert.instanceOf(review.get('first_day'), Date);
    assert.equalDate(review.get('first_day'), new Date(2014, 11, 21));
  });
});
