'use strict';
var Promise = require('bluebird');
var sinon = require('sinon');

var Utilizations = require(
  '../../../../src/client/modules/models/utilizations'
);
function dateStr(year, month, day) {
  return new Date(year, month, day).toISOString().replace(/T.*$/, '');
}

suite('Utilizations collection', function() {
  suite('#save', function() {
    var sync;

    function syncReport() {
      var report = {};

      sync.args.forEach(function(args) {
        var method = args[0];
        var id = args[1].id;
        if (!(method in report)) {
          report[method] = [];
        }

        report[method].push(id);
      });

      return report;
    }

    setup(function() {
      sync = Utilizations.prototype.model.prototype.sync =
        sinon.spy(function(operation, model, options) {
          if (options.success) {
            setTimeout(options.success, 0);
          }
        });
    });

    teardown(function() {
      delete Utilizations.prototype.model.prototype.sync;
    });

    test('updates previously-existing changed models', function() {
      var u = new Utilizations([{ id: 32 }]);

      u.at(0).set('id', 34);

      return u.save().then(function() {
        assert.sameMembers(syncReport().update, [34]);
      });
    });
    test('does not update previously-existing unchanged models', function() {
      var u = new Utilizations([{ id: 32 }]);

      return u.save().then(function() {
        assert.notOk(syncReport().update);
      });
    });
    test('creates new models', function() {
      var u = new Utilizations();

      u.add({});
      return u.save().then(function() {
        assert.equal(syncReport().create.length, 1);
      });
    });
    test('updates previously-existing changed models before saving new models', function() {
      var u = new Utilizations([{ id: 32 }]);

      u.at(0).set('id', 34);
      u.add({});

      return u.save().then(function() {
        assert.equal(sync.args[0][0], 'update');
        assert.equal(sync.args[1][0], 'create');
      });
    });

    suite('removal', function() {
      test('destroys removed models', function() {
        var u = new Utilizations([
          { id: 55 },
          { id: 56 },
          { id: 57 },
          { id: 58 },
          { id: 59 },
          { id: 60 }
        ]);

        // Removed as a single ID-specifying object literal
        u.remove({ id: 55 });
        // Removed as an array of ID-specifying object literals
        u.remove([{ id: 56 }, { id: 57 }]);
        // Removed as a single model instance
        u.remove(u.get(58));
        // Removed as an array of model instances
        u.remove([u.get(59), u.get(60)]);

        return u.save().then(function() {
          assert.sameMembers(syncReport().delete, [55, 56, 57, 58, 59, 60]);
        });
      });
      test('updates models that have been removed then re-inserted', function() {
        var u = new Utilizations([{ id: 23 }]);
        var model = u.get(23);
        var report;

        u.remove(model);
        u.add(model);
        model.set('id', 45);

        return u.save().then(function() {
          report = syncReport();
          assert.sameMembers(report.update, [45]);
          assert.notOk(report.delete);
        });
      });
      test('does not reference previously-destroyed models in subsequent invocations', function() {
        var u = new Utilizations([
          { id: 81 },
          { id: 82 },
          { id: 83 },
          { id: 84 },
          { id: 85 },
          { id: 86 },
          { id: 87 }
        ]);

        u.remove({ id: 81 });
        u.remove({ id: 84 });
        u.remove({ id: 87 });

        return u.save().then(function() {
            u.remove({ id: 82 });
            return u.save();
          }).then(function() {
            var deleted = syncReport().delete;
            assert.equal(deleted.length, 4);
            assert.sameMembers(deleted.slice(0, 3), [81, 84, 87]);
            assert.equal(deleted[3], 82);
          });
      });

      test('does not reference models that are in the process of being destroyed in subsequent invocations', function() {
        var u = new Utilizations([
          { id: 1 },
          { id: 2 },
          { id: 3 }
        ]);

        u.remove({ id: 2 });

        return Promise.all([u.save(), u.save()]).then(function() {
          assert.deepEqual(syncReport().delete, [2]);
        });
      });
    });

    /**
     * Ensure that update requests are made in the correct order so as to avoid
     * invalid state. These tests are written to avoid asserting non-essential
     * request order details--inline comments describe update "phases"; within
     * each phase, request order is inconsequential.
     */
    suite('model update order', function() {
      test('best case', function() {
        //        [  +] _____ [- +] _____ [-  ]
        // Pass 1   x           x           x
        var u = new Utilizations([
          { id: 1, first_day: new Date(2012, 4, 1), last_day: new Date(2012, 4, 3) },
          { id: 2, first_day: new Date(2012, 4, 5), last_day: new Date(2012, 4, 7) },
          { id: 3, first_day: new Date(2012, 4, 9), last_day: new Date(2012, 4, 12) }
        ]);

        // Growing on the right
        u.get(1).set({ last_day: new Date(2012, 4, 4) });
        // Shrinking on the left, growing on the right
        u.get(2).set({ first_day: new Date(2012, 4, 6), last_day: new Date(2012, 4, 8) });
        // Shrinking on the left
        u.get(3).set({ first_day: new Date(2012, 4, 10) });

        return u.save().then(function() {
          assert.sameMembers(syncReport().update, [1, 2, 3]);
        });
      });

      test('worst case', function() {
        //        [  +] [- +] [- +] [-  ]
        // Pass 1                     x
        // Pass 2               x
        // Pass 3         x
        // Pass 4   x
        var u = new Utilizations([
          { id: 1, first_day: new Date(2012, 4, 1), last_day: new Date(2012, 4, 3) },
          { id: 2, first_day: new Date(2012, 4, 4), last_day: new Date(2012, 4, 6) },
          { id: 3, first_day: new Date(2012, 4, 7), last_day: new Date(2012, 4, 9) },
          { id: 4, first_day: new Date(2012, 4, 10), last_day: new Date(2012, 4, 12) }
        ]);

        // Growing on the right
        u.get(1).set({ last_day: new Date(2012, 4, 4) });
        // Shrinking on the left, growing on the right
        u.get(2).set({ first_day: new Date(2012, 4, 5), last_day: new Date(2012, 4, 7) });
        // Shrinking on the left, growing on the right
        u.get(3).set({ first_day: new Date(2012, 4, 8), last_day: new Date(2012, 4, 10) });
        // Shrinking on the left
        u.get(4).set({ first_day: new Date(2012, 4, 11) });

        return u.save().then(function() {
          assert.deepEqual(syncReport().update, [4, 3, 2, 1]);
        });
      });

      test('distributed', function() {
        //        [  +] [- +] [-  ] [  -] [+ -] [+  ]
        // Pass 1               x     x
        // Pass 2         x                 x
        // Pass 3   x                             X
        var u = new Utilizations([
          { id: 1, first_day: new Date(2012, 4, 1), last_day: new Date(2012, 4, 3) },
          { id: 2, first_day: new Date(2012, 4, 4), last_day: new Date(2012, 4, 6) },
          { id: 3, first_day: new Date(2012, 4, 7), last_day: new Date(2012, 4, 9) },
          { id: 4, first_day: new Date(2012, 4, 10), last_day: new Date(2012, 4, 12) },
          { id: 5, first_day: new Date(2012, 4, 13), last_day: new Date(2012, 4, 15) },
          { id: 6, first_day: new Date(2012, 4, 16), last_day: new Date(2012, 4, 18) }
        ]);

        // Growing on right
        u.get(1).set({ last_day:  new Date(2012, 4, 4) });
        // Shrinking on left, growing on right
        u.get(2).set({ first_day: new Date(2012, 4, 6), last_day: new Date(2012, 4, 7) });
        // Shrinking on left
        u.get(3).set({ first_day: new Date(2012, 4, 8) });
        // Shrinking on the right
        u.get(4).set({ last_day: new Date(2012, 4, 11) });
        // Growing on left, shrinking on right
        u.get(5).set({ first_day: new Date(2012, 4, 12), last_day: new Date(2012, 4, 14) });
        // Growing on left
        u.get(6).set({ first_day: new Date(2012, 4, 15) });

        return u.save().then(function() {
          var updated = syncReport().update;

          assert.sameMembers(updated.slice(0, 2), [3, 4]);
          assert.sameMembers(updated.slice(2, 4), [2, 5]);
          assert.sameMembers(updated.slice(4, 6), [1, 6]);
        });
      });
    });
  });

  suite('#atDate', function() {
    var u = new Utilizations([
      { first_day: new Date(2012, 2, 2), last_day: new Date(2012, 2, 3) },
      { first_day: new Date(2012, 2, 5), last_day: new Date(2012, 2, 7) },
      { first_day: new Date(2012, 2, 8), last_day: new Date(2012, 2, 9) }
    ]);

    test('no utilization', function() {
      assert.strictEqual(u.atDate(new Date(2012, 2, 1)), null);
      assert.strictEqual(u.atDate(new Date(2012, 2, 4)), null);
      assert.strictEqual(u.atDate(new Date(2012, 2, 10)), null);
    });

    test('utilized', function() {
      assert.equal(u.atDate(new Date(2012, 2, 2)), u.at(0));
      assert.equal(u.atDate(new Date(2012, 2, 3)), u.at(0));
      assert.equal(u.atDate(new Date(2012, 2, 5)), u.at(1));
      assert.equal(u.atDate(new Date(2012, 2, 6)), u.at(1));
      assert.equal(u.atDate(new Date(2012, 2, 7)), u.at(1));
      assert.equal(u.atDate(new Date(2012, 2, 8)), u.at(2));
      assert.equal(u.atDate(new Date(2012, 2, 9)), u.at(2));
    });

    test('with offset', function() {
      assert.equal(u.atDate(new Date(2012, 2, 2), 2), null);
      assert.equal(u.atDate(new Date(2012, 2, 2), 3), u.at(1));
      assert.equal(u.atDate(new Date(2012, 2, 2), 4), u.at(1));
      assert.equal(u.atDate(new Date(2012, 2, 2), 5), u.at(1));
      assert.equal(u.atDate(new Date(2012, 2, 2), 6), u.at(2));
      assert.equal(u.atDate(new Date(2012, 2, 2), 7), u.at(2));
    });

    test('with offset (into DST)', function() {
      var u = new Utilizations([
        { first_day: new Date(2015, 2, 6), last_day: new Date(2015, 2, 9) },
        { first_day: new Date(2015, 2, 10), last_day: new Date(2015, 2, 11) }
      ]);

      assert.equal(u.atDate(new Date(2015, 2, 7), 1), u.at(0));
      assert.equal(u.atDate(new Date(2015, 2, 7), 2), u.at(0));
      assert.equal(u.atDate(new Date(2015, 2, 7), 3), u.at(1));
      assert.equal(u.atDate(new Date(2015, 2, 7), 4), u.at(1));
      assert.equal(u.atDate(new Date(2015, 2, 7), 5), null);

      assert.equal(u.atDate(new Date(2015, 2, 8), 1), u.at(0));
      assert.equal(u.atDate(new Date(2015, 2, 8), 2), u.at(1));
      assert.equal(u.atDate(new Date(2015, 2, 8), 3), u.at(1));
      assert.equal(u.atDate(new Date(2015, 2, 8), 4), null);
    });

    test('with offset (out of DST)', function() {
      var u = new Utilizations([
        { first_day: new Date(2015, 9, 30), last_day: new Date(2015, 10, 2) },
        { first_day: new Date(2015, 10, 3), last_day: new Date(2015, 10, 4) }
      ]);

      assert.equal(u.atDate(new Date(2015, 9, 31), 1), u.at(0));
      assert.equal(u.atDate(new Date(2015, 9, 31), 2), u.at(0));
      assert.equal(u.atDate(new Date(2015, 9, 31), 3), u.at(1));
      assert.equal(u.atDate(new Date(2015, 9, 31), 4), u.at(1));
      assert.equal(u.atDate(new Date(2015, 9, 31), 5), null);

      assert.equal(u.atDate(new Date(2015, 10, 1), 1), u.at(0));
      assert.equal(u.atDate(new Date(2015, 10, 1), 2), u.at(1));
      assert.equal(u.atDate(new Date(2015, 10, 1), 3), u.at(1));
      assert.equal(u.atDate(new Date(2015, 10, 1), 4), null);
    });
  });

  suite('#setAtDate', function() {
    test('empty', function() {
      var u = new Utilizations();
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 3
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 1);
      assert.equal(current, u.at(0));
      assert.deepEqual(models, [{
        utilization_type_id: 3,
        first_day: dateStr(2013, 3, 4),
        last_day: dateStr(2013, 3, 4)
      }]);
    });

    test('two-sided split', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 5
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 3);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 5,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 4)
        }, {
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5)
        }
      ]);
    });

    test('two-sided join', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 1);
      assert.equal(current, u.at(0));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 5)
        }]
      );
    });

    test('one-sided join (left)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 2);
      assert.equal(current, u.at(0));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 4)
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5)
        }]
      );
    });

    test('one-sided join (left with missing right)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 1);
      assert.equal(current, u.at(0));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 4)
        }]
      );
    });

    test('one-sided join (right)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 25
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 2);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 5)
        }]
      );
    });

    test('one-sided join (right with missing left)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 25
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 1);
      assert.equal(current, u.at(0));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 5)
        }]
      );
    });

    test('one-sided split (left)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 24
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 3);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 24,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 4),
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5)
        }]
      );
    });

    test('one-sided split (right)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 24
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 3);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 24,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 4),
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5)
        }]
      );
    });

    test('join and split', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 2);
      assert.equal(current, u.at(0));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 4)
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5),
        }]
      );
    });

    test('split and join', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 25
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 2);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 5),
        }]
      );
    });

    test('direct update', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4),
          project_id: 23
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 21
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 3);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 21,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 4),
          project_id: 23
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5),
        }]
      );
    });

    test('equivalent value (no change)', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        },
        {
          utilization_type_id: 24,
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models, current;

      current = u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 24
      });

      models = u.toJSON().utilizations;

      assert.equal(models.length, 3);
      assert.equal(current, u.at(1));
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: dateStr(2013, 3, 3),
          last_day: dateStr(2013, 3, 3)
        }, {
          utilization_type_id: 24,
          first_day: dateStr(2013, 3, 4),
          last_day: dateStr(2013, 3, 4),
        }, {
          utilization_type_id: 25,
          first_day: dateStr(2013, 3, 5),
          last_day: dateStr(2013, 3, 5),
        }]
      );
    });

    suite('options', function() {
      var u, events;

      setup(function() {
        u = new Utilizations([
          {
            utilization_type_id: 23,
            first_day: new Date(2013, 3, 3),
            last_day: new Date(2013, 3, 5)
          }
        ]);

        events = [];

        u.on('all', function(eventName) {
          events.push(eventName);
        });
      });

      test('triggers events by default', function() {
        u.setAtDate(new Date(2013, 3, 4), {
          utilization_type_id: 45
        });

        assert.sameMembers(
          events, ['add', 'change', 'change:last_day']
        );
      });

      test('honors `silent` flag when present', function() {
        u.setAtDate(new Date(2013, 3, 4), {
          utilization_type_id: 45
        }, { silent: true });

        assert.deepEqual(events, []);
      });
    });

    suite('unset (null utilization)', function() {
      test('empty', function() {
        var u = new Utilizations();
        var models, current;

        current = u.setAtDate(new Date(2013, 3, 4), null);

        models = u.toJSON().utilizations;

        assert.equal(models.length, 0);
        assert.strictEqual(current, null);
      });

      test('two-sided split', function() {
        var u = new Utilizations([
          {
            utilization_type_id: 23,
            first_day: new Date(2013, 3, 3),
            last_day: new Date(2013, 3, 5)
          }
        ]);
        var models, current;

        current = u.setAtDate(new Date(2013, 3, 4), null);

        models = u.toJSON().utilizations;

        assert.equal(models.length, 2);
        assert.strictEqual(current, null);
        assert.deepEqual(
          models,
          [{
            utilization_type_id: 23,
            first_day: dateStr(2013, 3, 3),
            last_day: dateStr(2013, 3, 3)
          }, {
            utilization_type_id: 23,
            first_day: dateStr(2013, 3, 5),
            last_day: dateStr(2013, 3, 5)
          }
        ]);
      });

      test('direct update', function() {
        var u = new Utilizations([
          {
            utilization_type_id: 23,
            first_day: new Date(2013, 3, 3),
            last_day: new Date(2013, 3, 3)
          },
          {
            utilization_type_id: 24,
            first_day: new Date(2013, 3, 4),
            last_day: new Date(2013, 3, 4)
          },
          {
            utilization_type_id: 25,
            first_day: new Date(2013, 3, 5),
            last_day: new Date(2013, 3, 5)
          }
        ]);
        var models, current;

        current = u.setAtDate(new Date(2013, 3, 4), null);

        models = u.toJSON().utilizations;

        assert.equal(models.length, 2);
        assert.equal(current, null);
        assert.deepEqual(
          models,
          [{
            utilization_type_id: 23,
            first_day: dateStr(2013, 3, 3),
            last_day: dateStr(2013, 3, 3)
          }, {
            utilization_type_id: 25,
            first_day: dateStr(2013, 3, 5),
            last_day: dateStr(2013, 3, 5),
          }]
        );
      });
    });
  });

  suite('#split', function() {
    test('splits utilization at given date', function() {
      var u = new Utilizations([{
        first_day: new Date(2013, 3, 1),
        last_day: new Date(2013, 3, 5)
      }]);
      var newUtilization;

      newUtilization = u.split(new Date(2013, 3, 3));

      assert.equal(u.length, 2);
      assert.equalDate(u.at(0).get('first_day'), new Date(2013, 3, 1));
      assert.equalDate(u.at(0).get('last_day'), new Date(2013, 3, 2));
      assert.equalDate(u.at(1).get('first_day'), new Date(2013, 3, 3));
      assert.equalDate(u.at(1).get('last_day'), new Date(2013, 3, 5));
      assert.equal(newUtilization, u.at(1));
    });

    suite('no splitting required', function() {
      test('no utilization preceeding', function() {
        var u = new Utilizations([{
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 5)
        }]);
        var newUtilization;

        newUtilization = u.split(new Date(2013, 3, 4));

        assert.equal(u.length, 1);
        assert.strictEqual(newUtilization, null);
      });

      test('no utilization following', function() {
        var u = new Utilizations([{
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 5)
        }]);
        var newUtilization;

        newUtilization = u.split(new Date(2013, 3, 6));

        assert.equal(u.length, 1);
        assert.strictEqual(newUtilization, null);
      });

      test('no utilization at specified date', function() {
        var u = new Utilizations([{
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 5)
        }]);
        var newUtilization;

        newUtilization = u.split(new Date(2013, 3, 7));

        assert.equal(u.length, 1);
        assert.strictEqual(newUtilization, null);
      });

      test('distinct utilizations at split point', function() {
        var u = new Utilizations([
          {
            first_day: new Date(2013, 3, 4),
            last_day: new Date(2013, 3, 5)
          }, {
            first_day: new Date(2013, 3, 6),
            last_day: new Date(2013, 3, 7)
          }]);
        var newUtilization;

        newUtilization = u.split(new Date(2013, 3, 6));

        assert.equal(u.length, 2);
        assert.strictEqual(newUtilization, null);
      });
    });

    suite('events', function() {
      var u, events;

      setup(function() {
        u = new Utilizations([{
          first_day: new Date(2013, 3, 1),
          last_day: new Date(2013, 3, 5)
        }]);
        events = [];

        u.on('all', function(eventName) {
          events.push(eventName);
        });
      });
      test('triggers appropriate events by default', function() {
        u.split(new Date(2013, 3, 3));

        assert.sameMembers(events, ['add', 'change', 'change:last_day']);
      });
      test('honors `silent` flag when present', function() {
        u.split(new Date(2013, 3, 3), { silent: true });

        assert.deepEqual(events, []);
      });
    });
  });

  suite('#verify', function() {
    test('sets flag on specified utilization', function() {
      var u = new Utilizations([{
        first_day: new Date(2013, 3, 3),
        last_day: new Date(2013, 3, 3)
      }]);
      var model = u.at(0);

      u.verify(new Date(2013, 3, 3));

      assert.ok(model.get('verified'));
    });

    test('sets flag on all utilizations in specified interval', function() {
      var u = new Utilizations([
        {
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 3)
        }, {
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 5)
        }, {
          first_day: new Date(2013, 3, 6),
          last_day: new Date(2013, 3, 6)
        }
      ]);

      u.verify(new Date(2013, 3, 3), 4);

      assert.ok(u.at(0).get('verified'));
      assert.ok(u.at(1).get('verified'));
      assert.ok(u.at(2).get('verified'));
    });

    test('splits first utilization if it extends before the specified date', function() {
      var u = new Utilizations([
        {
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 5)
        }
      ]);

      u.verify(new Date(2013, 3, 4), 2);

      assert.equal(u.length, 2);
      assert.notOk(u.at(0).get('verified'));
      assert.equalDate(u.at(0).get('first_day'), new Date(2013, 3, 3));
      assert.equalDate(u.at(0).get('last_day'), new Date(2013, 3, 3));
      assert.ok(u.at(1).get('verified'));
      assert.equalDate(u.at(1).get('first_day'), new Date(2013, 3, 4));
      assert.equalDate(u.at(1).get('last_day'), new Date(2013, 3, 5));
    });

    test('splits last utilization if it extends beyond the specified date', function() {
      var u = new Utilizations([
        {
          first_day: new Date(2013, 3, 4),
          last_day: new Date(2013, 3, 4)
        },
        {
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 9)
        }
      ]);

      u.verify(new Date(2013, 3, 4), 2);

      assert.equal(u.length, 3);
      assert.ok(u.at(0).get('verified'));
      assert.equalDate(u.at(0).get('first_day'), new Date(2013, 3, 4));
      assert.equalDate(u.at(0).get('last_day'), new Date(2013, 3, 4));
      assert.ok(u.at(1).get('verified'));
      assert.equalDate(u.at(1).get('first_day'), new Date(2013, 3, 5));
      assert.equalDate(u.at(1).get('last_day'), new Date(2013, 3, 5));
      assert.notOk(u.at(2).get('verified'));
      assert.equalDate(u.at(2).get('first_day'), new Date(2013, 3, 6));
      assert.equalDate(u.at(2).get('last_day'), new Date(2013, 3, 9));
    });

    test('splits utilization on both sides of time period if it extends beyond the entire range', function() {
      var u = new Utilizations([
        {
          first_day: new Date(2013, 3, 1),
          last_day: new Date(2013, 3, 20)
        }
      ]);

      u.verify(new Date(2013, 3, 4), 3);

      assert.equal(u.length, 3);
      assert.notOk(u.at(0).get('verified'));
      assert.equalDate(u.at(0).get('first_day'), new Date(2013, 3, 1));
      assert.equalDate(u.at(0).get('last_day'), new Date(2013, 3, 3));
      assert.ok(u.at(1).get('verified'));
      assert.equalDate(u.at(1).get('first_day'), new Date(2013, 3, 4));
      assert.equalDate(u.at(1).get('last_day'), new Date(2013, 3, 6));
      assert.notOk(u.at(2).get('verified'));
      assert.equalDate(u.at(2).get('first_day'), new Date(2013, 3, 7));
      assert.equalDate(u.at(2).get('last_day'), new Date(2013, 3, 20));
    });

    suite('events', function() {
      var u, events;

      setup(function() {
        u = new Utilizations([{
          first_day: new Date(2013, 3, 1),
          last_day: new Date(2013, 3, 5)
        }]);
        events = [];

        u.on('all', function(eventName) {
          events.push(eventName);
        });
      });
      test('triggers appropriate events by default', function() {
        u.verify(new Date(2013, 3, 3));

        assert.sameMembers(
          events,
          ['add', 'change', 'change:last_day', 'change:verified']
        );
      });
      test('honors `silent` flag when present', function() {
        u.verify(new Date(2013, 3, 3), { silent: true });

        assert.deepEqual(events, []);
      });
      test('honors `silent` flag when present after a `through` parameter', function() {
        u.verify(new Date(2013, 3, 3), 2, { silent: true });

        assert.deepEqual(events, []);
      });
    });
  });

  suite('#fullyUtilized', function() {
    test('single one-day utilization', function() {
      var u = new Utilizations([
        { first_day: new Date(2012, 3, 3), last_day: new Date(2012, 3, 3) }
      ]);

      assert.equal(u.fullyUtilized(new Date(2012, 3, 2), 1), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 3), 1), true);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 4), 1), false);
    });

    test('single multi-day utilization', function() {
      var u = new Utilizations([
        { first_day: new Date(2012, 3, 3), last_day: new Date(2012, 3, 5) }
      ]);

      assert.equal(u.fullyUtilized(new Date(2012, 3, 1), 2), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 2), 2), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 3), 2), true);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 4), 2), true);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 5), 2), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 6), 2), false);
    });

    test('multiple utilizations', function() {
      var u = new Utilizations([
        { first_day: new Date(2012, 3, 3), last_day: new Date(2012, 3, 4) },
        { first_day: new Date(2012, 3, 5), last_day: new Date(2012, 3, 5) },
        { first_day: new Date(2012, 3, 7), last_day: new Date(2012, 3, 8) }
      ]);

      assert.equal(u.fullyUtilized(new Date(2012, 3, 1), 3), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 2), 3), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 3), 3), true);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 4), 3), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 5), 3), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 6), 3), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 7), 3), false);
      assert.equal(u.fullyUtilized(new Date(2012, 3, 8), 3), false);
    });
  });

  suite('#areVerified', function() {
    suite('without constraint (all members)', function() {
      test('empty set', function() {
        var u = new Utilizations();
        assert.equal(u.areVerified(new Date(2023, 1, 3), 1), false);
      });

      test('single unverified', function() {
        var u = new Utilizations([
          {
            first_day: new Date(2023, 1, 3),
            last_day: new Date(2023, 1, 3),
            verified: false
          }
        ]);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 1), false);
      });

      test('single verified', function() {
        var u = new Utilizations([
          {
            first_day: new Date(2023, 1, 3),
            last_day: new Date(2023, 1, 4),
            verified: true
          }
        ]);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 2), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 2), true);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 1), false);
      });

      test('multiple (all unverified)', function() {
        var u = new Utilizations([
          {
            first_day: new Date(2023, 1, 3),
            last_day: new Date(2023, 1, 3),
            verified: false
          },
          {
            first_day: new Date(2023, 1, 4),
            last_day: new Date(2023, 1, 5),
            verified: false
          }
        ]);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 1), false);
      });

      test('multiple (all verified)', function() {
        var u = new Utilizations([
          {
            first_day: new Date(2023, 1, 3),
            last_day: new Date(2023, 1, 3),
            verified: true
          },
          {
            first_day: new Date(2023, 1, 4),
            last_day: new Date(2023, 1, 5),
            verified: true
          },
          {
            first_day: new Date(2023, 1, 7),
            last_day: new Date(2023, 1, 8),
            verified: true
          }
        ]);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 7), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 8), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 9), 1), false);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 2), true);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 2), true);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 7), 2), true);
        assert.equal(u.areVerified(new Date(2023, 1, 8), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 9), 2), false);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 3), true);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 7), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 8), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 9), 3), false);
      });

      test('multiple (mixed)', function() {
        var u = new Utilizations([
          {
            first_day: new Date(2023, 1, 3),
            last_day: new Date(2023, 1, 3),
            verified: true
          },
          {
            first_day: new Date(2023, 1, 4),
            last_day: new Date(2023, 1, 5),
            verified: false
          },
          {
            first_day: new Date(2023, 1, 7),
            last_day: new Date(2023, 1, 8),
            verified: true
          }
        ]);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 1), false);
        assert.equal(u.areVerified(new Date(2023, 1, 7), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 8), 1), true);
        assert.equal(u.areVerified(new Date(2023, 1, 9), 1), false);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 7), 2), true);
        assert.equal(u.areVerified(new Date(2023, 1, 8), 2), false);
        assert.equal(u.areVerified(new Date(2023, 1, 9), 2), false);

        assert.equal(u.areVerified(new Date(2023, 1, 2), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 3), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 4), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 5), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 6), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 7), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 8), 3), false);
        assert.equal(u.areVerified(new Date(2023, 1, 9), 3), false);
      });
    });
  });
});
