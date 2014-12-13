'use strict';
var UtilizationType = require(
  '../../../../src/client/modules/models/utilization-type'
);

suite('UtilizationType', function() {
  suite('isConsulting', function() {
    test('consulting utilization', function() {
      var type = new UtilizationType({ id: 1 });

      assert.strictEqual(type.isConsulting, true);
    });

    test('non-consulting utilization', function() {
      var type = new UtilizationType({ id: 2 });

      assert.strictEqual(type.isConsulting, false);
    });

    test('consulting to non-consulting utilization', function() {
      var type = new UtilizationType({ id: 1 });

      type.set('id', 3);

      assert.strictEqual(type.isConsulting, false);
    });

    test('non-consulting to consulting utilization', function() {
      var type = new UtilizationType({ id: 4 });

      type.set('id', 1);

      assert.strictEqual(type.isConsulting, true);
    });
  });
});
