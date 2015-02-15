'use strict';

var Model = require(
  '../../../../../src/client/modules/models/abstract/json-api-model'
);
var Person = Model.extend({
  modelType: 'person',
  props: {
    first: 'string',
    last: 'string'
  }
});

suite('JsonApiModel', function() {
  suite('#isDirty', function() {
    var SyncPerson = Person.extend({
      sync: function(operation, model, options) {
        if (options.success) {
          setTimeout(options.success, 0);
        }
      }
    });
    var person;

    setup(function() {
      person = new SyncPerson();
    });

    test('initially clean', function() {
      assert.equal(person.isDirty(), false);
    });

    test('dirtied by setting attribute', function() {
      person.set('first', 'mark');

      assert.equal(person.isDirty(), true);
    });

    test('dirtied by setting attribute "silently"', function() {
      person.set('first', 'mark', { silent: true });

      assert.equal(person.isDirty(), true);
    });

    /**
     * This test represents an edge case not supported by the current
     * implementation of the `isDirty` method. Addressing it may require
     * overriding `AmpersandModel#set` to address (an inherently brittle
     * approach because multiple Ampersand Model methods can modify state, and
     * their is not guaruntee that they will use the `set` method internally).
     * TODO: Address the underlying problem and enable this test.
     */
    test.skip('dirtied by setting attribute "silently" twice', function() {
      person.set('first', 'mark', { silent: true });
      person.set('first', 'mark', { silent: true });

      assert.equal(person.isDirty(), true);
    });

    test('still dirty after re-setting attribute to same value', function() {
      person.set('first', 'mark');
      person.set('first', 'mark');

      assert.equal(person.isDirty(), true);
    });

    test('clean after saving', function() {
      person.set('first', 'matt');

      return person.save().then(function() {
          assert.equal(person.isDirty(), false);
        });
    });
  });

  suite('#serialize', function() {
    test('"flat" models', function() {
      var person = new Person({
        first: 'mark'
      });

      assert.deepEqual(person.serialize(), { person: { first: 'mark' } });
    });
    test('nested models', function() {
      var Parent = Model.extend({
        modelType: 'parent',
        props: {
          age: 'number',
        },
        children: {
          foo: Person
        }
      });

      var parent = new Parent({ age: 23, foo: { first: 'matt' } });

      assert.deepEqual(parent.serialize(), {
        links: {
          person: { first: 'matt' },
        },
        parent: {
          age: 23
        }
      });
    });
  });
});
