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
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 1, 2),
      last_day: new Date(2012, 1, 3),
      billable: true
    });
    var u2 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: true
    });
    var u3 = new Utilization({
      utilization_type_id: 3,
      employee_id: 2,
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: true
    });
    var u4 = new Utilization({
      utilization_type_id: 2,
      employee_id: 3,
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: true
    });
    var u5 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: true
    });
    var u6 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      project_id: 3,
      project_phase_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: true
    });
    var u7 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      project_id: 2,
      project_phase_id: 3,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: true
    });
    var u8 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 4, 4),
      last_day: new Date(2012, 4, 5),
      billable: false
    });

    test('positive with models', function() {
      assert.strictEqual(u1.matches(u2), true);
      assert.strictEqual(u2.matches(u1), true);
    });

    test('positive with plain objects', function() {
      assert.strictEqual(u1.matches(u2.toJSON().utilizations), true);
      assert.strictEqual(u2.matches(u1.toJSON().utilizations), true);
    });

    test('negative', function() {
      assert.strictEqual(u1.matches(u3), false);
      assert.strictEqual(u1.matches(u4), false);
      assert.strictEqual(u1.matches(u6), false);
      assert.strictEqual(u1.matches(u7), false);
      assert.strictEqual(u1.matches(u8), false);
      assert.strictEqual(u2.matches(u3), false);
      assert.strictEqual(u2.matches(u4), false);
      assert.strictEqual(u2.matches(u6), false);
      assert.strictEqual(u2.matches(u7), false);
      assert.strictEqual(u2.matches(u8), false);
      assert.strictEqual(u3.matches(u4), false);
      assert.strictEqual(u3.matches(u5), false);
      assert.strictEqual(u3.matches(u6), false);
      assert.strictEqual(u3.matches(u7), false);
      assert.strictEqual(u3.matches(u8), false);
      assert.strictEqual(u4.matches(u5), false);
      assert.strictEqual(u4.matches(u6), false);
      assert.strictEqual(u4.matches(u7), false);
      assert.strictEqual(u4.matches(u8), false);
      assert.strictEqual(u5.matches(u6), false);
      assert.strictEqual(u5.matches(u7), false);
      assert.strictEqual(u5.matches(u8), false);
      assert.strictEqual(u6.matches(u7), false);
      assert.strictEqual(u6.matches(u8), false);
      assert.strictEqual(u7.matches(u8), false);
    });
  });

  /**
   * Note: this test depends on the correct behavior of `Utilization#matches`
   * (asserted above)
   */
  test('#createMatching', function() {
    var u1 = new Utilization({
      utilization_type_id: 2,
      employee_id: 2,
      project_id: 2,
      project_phase_id: 2,
      first_date: new Date(2012, 1, 2),
      last_day: new Date(2012, 1, 3),
      billable: true
    });

    assert.ok(u1.matches(u1.createMatching()));
  });
});
