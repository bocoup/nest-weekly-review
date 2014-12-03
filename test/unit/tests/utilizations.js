'use strict';
var Utilizations = require('../../../src/client/modules/utilizations');

suite('Utilizations collection', function() {
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
