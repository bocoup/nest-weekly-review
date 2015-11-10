'use strict';
var LeaveRequestType = require('../../../../src/client/modules/models/leave-request-type');

suite('LeaveRequestType', function() {
  suite('displayName', function() {
    test('prefers `display_name`', function() {
      var l = new LeaveRequestType({
        name: 'foo',
        display_name: 'bar'
      });

      assert.strictEqual(l.get('displayName'), 'bar');
    });

    test('uses `name` when `display_name` is unavailable', function() {
      var l = new LeaveRequestType({
        name: 'foo',
        display_name: null
      });

      assert.strictEqual(l.get('displayName'), 'foo');
    });
  });
});
