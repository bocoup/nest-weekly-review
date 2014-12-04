'use strict';
var sinon = require('sinon');

var Utilizations = require('../../../src/client/modules/utilizations');

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
      sync = Utilizations.prototype.model.prototype.sync = sinon.stub();
    });

    teardown(function() {
      delete Utilizations.prototype.model.prototype.sync;
    });

    test('updates changed models', function() {
      var u = new Utilizations([{ id: 34 }]);

      u.save();

      assert.sameMembers(syncReport().update, [34]);
    });
    test('creates new models', function() {
      var u = new Utilizations();

      u.add({});
      u.save();

      assert.equal(syncReport().create.length, 1);
    });
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
      u.save();

      assert.sameMembers(syncReport().delete, [55, 56, 57, 58, 59, 60]);
    });
    test('updates models that have been removed then re-inserted', function() {
      var u = new Utilizations([{ id: 23 }]);
      var model = u.get(23);
      var report;

      u.remove(model);
      u.add(model);
      u.save();

      report = syncReport();
      assert.sameMembers(report.update, [23]);
      assert.notOk(report.delete);
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
  });

  suite('#setAtDate', function() {
    test('two-sided split', function() {
      var u = new Utilizations([
        {
          utilization_type_id: 23,
          first_day: new Date(2013, 3, 3),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 5
      });

      models = u.toJSON();

      assert.equal(models.length, 3);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 3)
        }, {
          utilization_type_id: 5,
          first_day: +new Date(2013, 3, 4),
          last_day: +new Date(2013, 3, 4)
        }, {
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 5),
          last_day: +new Date(2013, 3, 5)
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON();

      assert.equal(models.length, 1);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 5)
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON();

      assert.equal(models.length, 2);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 4)
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 5),
          last_day: +new Date(2013, 3, 5)
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 25
      });

      models = u.toJSON();

      assert.equal(models.length, 2);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 3)
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 4),
          last_day: +new Date(2013, 3, 5)
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 24
      });

      models = u.toJSON();

      assert.equal(models.length, 3);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 3)
        }, {
          utilization_type_id: 24,
          first_day: +new Date(2013, 3, 4),
          last_day: +new Date(2013, 3, 4),
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 5),
          last_day: +new Date(2013, 3, 5)
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 24
      });

      models = u.toJSON();

      assert.equal(models.length, 3);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 3)
        }, {
          utilization_type_id: 24,
          first_day: +new Date(2013, 3, 4),
          last_day: +new Date(2013, 3, 4),
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 5),
          last_day: +new Date(2013, 3, 5)
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 23
      });

      models = u.toJSON();

      assert.equal(models.length, 2);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 4)
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 5),
          last_day: +new Date(2013, 3, 5),
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
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 25
      });

      models = u.toJSON();

      assert.equal(models.length, 2);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 3)
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 4),
          last_day: +new Date(2013, 3, 5),
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
          last_day: new Date(2013, 3, 4)
        },
        {
          utilization_type_id: 25,
          first_day: new Date(2013, 3, 5),
          last_day: new Date(2013, 3, 5)
        }
      ]);
      var models;

      u.setAtDate(new Date(2013, 3, 4), {
        utilization_type_id: 21
      });

      models = u.toJSON();

      assert.equal(models.length, 3);
      assert.deepEqual(
        models,
        [{
          utilization_type_id: 23,
          first_day: +new Date(2013, 3, 3),
          last_day: +new Date(2013, 3, 3)
        }, {
          utilization_type_id: 21,
          first_day: +new Date(2013, 3, 4),
          last_day: +new Date(2013, 3, 4),
        }, {
          utilization_type_id: 25,
          first_day: +new Date(2013, 3, 5),
          last_day: +new Date(2013, 3, 5),
        }]
      );
    });
  });
});
