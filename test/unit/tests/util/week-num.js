'use strict';
var weekNum = require('../../../../src/client/modules/util/week-num');

suite('weekNum', function() {
  suite('fromDate', function() {
    var fromDate = weekNum.fromDate;

    test('first week', function() {
      assert.deepEqual(
        fromDate(new Date(2014, 0, 5)),
        { year: 2014, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 6)),
        { year: 2014, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 7)),
        { year: 2014, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 8)),
        { year: 2014, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 9)),
        { year: 2014, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 10)),
        { year: 2014, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 11)),
        { year: 2014, week: 0 }
      );

      assert.deepEqual(
        fromDate(new Date(2015, 0, 4)),
        { year: 2015, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 5)),
        { year: 2015, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 6)),
        { year: 2015, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 7)),
        { year: 2015, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 8)),
        { year: 2015, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 9)),
        { year: 2015, week: 0 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 10)),
        { year: 2015, week: 0 }
      );
    });

    test('during daylight savings time', function() {
      assert.deepEqual(
        fromDate(new Date(2015, 2, 15)),
        { year: 2015, week: 10 }
      );
    });

    test('second weeks', function() {
      assert.deepEqual(
        fromDate(new Date(2014, 0, 12)),
        { year: 2014, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 13)),
        { year: 2014, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 14)),
        { year: 2014, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 15)),
        { year: 2014, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 16)),
        { year: 2014, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 17)),
        { year: 2014, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 0, 18)),
        { year: 2014, week: 1 }
      );

      assert.deepEqual(
        fromDate(new Date(2015, 0, 11)),
        { year: 2015, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 12)),
        { year: 2015, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 13)),
        { year: 2015, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 14)),
        { year: 2015, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 15)),
        { year: 2015, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 16)),
        { year: 2015, week: 1 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 17)),
        { year: 2015, week: 1 }
      );
    });

    test('penultimate week', function() {
      assert.deepEqual(
        fromDate(new Date(2014, 11, 21)),
        { year: 2014, week: 50 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 22)),
        { year: 2014, week: 50 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 23)),
        { year: 2014, week: 50 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 24)),
        { year: 2014, week: 50 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 25)),
        { year: 2014, week: 50 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 26)),
        { year: 2014, week: 50 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 27)),
        { year: 2014, week: 50 }
      );
    });

    test('final week', function() {
      assert.deepEqual(
        fromDate(new Date(2014, 11, 28)),
        { year: 2014, week: 51 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 29)),
        { year: 2014, week: 51 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 30)),
        { year: 2014, week: 51 }
      );
      assert.deepEqual(
        fromDate(new Date(2014, 11, 31)),
        { year: 2014, week: 51 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 1)),
        { year: 2014, week: 51 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 2)),
        { year: 2014, week: 51 }
      );
      assert.deepEqual(
        fromDate(new Date(2015, 0, 3)),
        { year: 2014, week: 51 }
      );
    });
  });

  suite('toDate', function() {
    var toDate = weekNum.toDate;

    test('first week', function() {
      assert.equalDate(toDate(2007, 0), new Date(2007, 0, 7));
      assert.equalDate(toDate(2010, 0), new Date(2010, 0, 3));
      assert.equalDate(toDate(2011, 0), new Date(2011, 0, 2));
      assert.equalDate(toDate(2012, 0), new Date(2012, 0, 1));
      assert.equalDate(toDate(2013, 0), new Date(2013, 0, 6));
      assert.equalDate(toDate(2014, 0), new Date(2014, 0, 5));
      assert.equalDate(toDate(2015, 0), new Date(2015, 0, 4));
    });

    test('second week', function() {
      assert.equalDate(toDate(2007, 1), new Date(2007, 0, 14));
      assert.equalDate(toDate(2010, 1), new Date(2010, 0, 10));
      assert.equalDate(toDate(2011, 1), new Date(2011, 0, 9));
      assert.equalDate(toDate(2012, 1), new Date(2012, 0, 8));
      assert.equalDate(toDate(2013, 1), new Date(2013, 0, 13));
      assert.equalDate(toDate(2014, 1), new Date(2014, 0, 12));
      assert.equalDate(toDate(2015, 1), new Date(2015, 0, 11));
    });

    test('penultimate week', function() {
      assert.equalDate(toDate(2007, 50), new Date(2007, 11, 23));
      assert.equalDate(toDate(2010, 50), new Date(2010, 11, 19));
      assert.equalDate(toDate(2011, 50), new Date(2011, 11, 18));
      assert.equalDate(toDate(2012, 50), new Date(2012, 11, 16));
      assert.equalDate(toDate(2013, 50), new Date(2013, 11, 22));
      assert.equalDate(toDate(2014, 50), new Date(2014, 11, 21));
      assert.equalDate(toDate(2015, 50), new Date(2015, 11, 20));
    });

    test('final week', function() {
      assert.equalDate(toDate(2007, 51), new Date(2007, 11, 30));
      assert.equalDate(toDate(2010, 51), new Date(2010, 11, 26));
      assert.equalDate(toDate(2011, 51), new Date(2011, 11, 25));
      assert.equalDate(toDate(2012, 51), new Date(2012, 11, 23));
      assert.equalDate(toDate(2013, 51), new Date(2013, 11, 29));
      assert.equalDate(toDate(2014, 51), new Date(2014, 11, 28));
      assert.equalDate(toDate(2015, 51), new Date(2015, 11, 27));
    });
  });

  suite('between', function() {
    var between = weekNum.between;

    test('same time', function() {
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 1)), 0);
    });

    test('less than one week', function() {
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 2)), 1/7);
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 3)), 2/7);
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 4)), 3/7);
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 5)), 4/7);
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 6)), 5/7);
      assert.equal(between(new Date(2014, 11, 1), new Date(2014, 11, 7)), 6/7);
    });

    test('exactly 1 (Sunday)', function() {
      assert.equal(between(new Date(2014, 11, 7), new Date(2014, 11, 14)), 1);
    });

    test('exactly 1 (Tuesday)', function() {
      assert.equal(between(new Date(2014, 11, 2), new Date(2014, 11, 9)), 1);
    });

    test('between 1 and two', function() {
      assert.equal(between(new Date(2014, 11, 7), new Date(2014, 11, 15)), 8/7);
      assert.equal(between(new Date(2014, 11, 2), new Date(2014, 11, 13)), 11/7);
    });

    test('across year boundary', function() {
      assert.equal(between(new Date(2014, 11, 30), new Date(2015, 0, 7)), 8/7);
    });

    test('across DST boundary', function() {
      assert.equal(between(new Date(2015, 2, 10), new Date(2015, 2, 17)), 1);
    });
  });
});
