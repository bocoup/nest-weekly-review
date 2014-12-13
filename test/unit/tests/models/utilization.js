'use strict';
var Utilization = require('../../../../src/client/modules/models/utilization');

suite('Utilization model', function() {
  suite('#includes', function() {
    var u = new Utilization({
        first_day: new Date(2013, 8, 2),
        last_day: new Date(2013, 8, 4)
    });
    test('positive', function() {
      assert.strictEqual(u.includes(new Date(2013, 8, 2)), true);
      assert.strictEqual(u.includes(new Date(2013, 8, 3)), true);
      assert.strictEqual(u.includes(new Date(2013, 8, 4)), true);
    });

    test('negative', function() {
      assert.strictEqual(u.includes(new Date(2013, 8, 1)), false);
      assert.strictEqual(u.includes(new Date(2013, 8, 5)), false);
    });
  });

  suite('#matches', function() {
    var u1 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      position_id: 2,
      project_id: 2,
      first_date: new Date(2012, 1, 2),
      last_day: new Date(2012, 1, 3)
    });
    var u2 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      position_id: 2,
      project_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5)
    });
    var u3 = new Utilization({
      utilization_type_id: 3,
      employee_id: 2,
      position_id: 2,
      project_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5)
    });
    var u4 = new Utilization({
      utilization_type_id: 2,
      employee_id: 3,
      position_id: 2,
      project_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5)
    });
    var u5 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      position_id: 3,
      project_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5)
    });
    var u6 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      position_id: 2,
      project_id: 3,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5)
    });

    test('positive with models', function() {
      assert.strictEqual(u1.matches(u2), true);
      assert.strictEqual(u2.matches(u1), true);
    });

    test('positive with plain objects', function() {
      assert.strictEqual(u1.matches(u2.toJSON()), true);
      assert.strictEqual(u2.matches(u1.toJSON()), true);
    });

    test('negative', function() {
      assert.strictEqual(u1.matches(u3), false);
      assert.strictEqual(u1.matches(u4), false);
      assert.strictEqual(u1.matches(u5), false);
      assert.strictEqual(u1.matches(u6), false);
      assert.strictEqual(u2.matches(u3), false);
      assert.strictEqual(u2.matches(u4), false);
      assert.strictEqual(u2.matches(u5), false);
      assert.strictEqual(u2.matches(u6), false);
      assert.strictEqual(u3.matches(u4), false);
      assert.strictEqual(u3.matches(u5), false);
      assert.strictEqual(u3.matches(u6), false);
      assert.strictEqual(u4.matches(u5), false);
      assert.strictEqual(u4.matches(u6), false);
      assert.strictEqual(u5.matches(u6), false);
    });
  });
});
