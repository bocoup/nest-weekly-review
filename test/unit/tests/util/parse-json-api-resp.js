'use strict';
var make = require('../../../../src/client/modules/util/parse-json-api-resp');

suite('parseJsonApiResponse', function() {
  test('mike', function() {
    var Model = require('ampersand-model');
    var Collection = require('ampersand-rest-collection');
    var M = Model.extend({
      parse: function(data) {
        console.log('M#parse');
        return data;
      }
    });
    var C = Collection.extend({
      model: M,
      parse: function(data) {
        console.log('C#parse', data);
        return data;
      }
    });

    var c = new C();

    c.set([{}, {}], { parse: true });
  });
  test('simple document', function() {
    var parse = make('gooo');
    var response = {
      gooo: [ { id: 333 } ]
    };

    assert.equal(parse(response), response.gooo);
  });

  suite('links', function() {
    test('one-to-one', function() {
      var parse = make('crampus');
      var response = {
        linked: {
          swaddle: [ { id: 3, londy: 2 }, { id: 4, londy: 1 } ]
        },
        crampus: [
          { id: 44, links: { swaddle: 4 } },
          { id: 45, links: { swaddle: 3 } },
          { id: 46, links: { swaddle: null } }
        ]
      };

      var parsed = parse(response);

      assert.deepEqual(
        parsed[0],
        { id: 44, swaddle: { id: 4, londy: 1 } }
      );

      assert.deepEqual(
        parsed[1],
        { id: 45, swaddle: { id: 3, londy: 2 } }
      );

      assert.deepEqual(
        parsed[2],
        { id: 46, swaddle: null }
      );
    });

    test('one-to-one (with `type` field)', function() {
      var parse = make('crampus');
      var response = {
        linked: {
          swaddle: [ { id: 3, londy: 2 }, { id: 4, londy: 1 } ]
        },
        crampus: [
          { id: 44, links: { swinkle: { type: 'swaddle', id: 4 } } },
          { id: 45, links: { swinkle: { type: 'swaddle', id: 3 } } },
          { id: 46, links: { swinkle: null } }
        ]
      };

      var parsed = parse(response);

      assert.deepEqual(
        parsed[0],
        { id: 44, swinkle: { id: 4, londy: 1 } }
      );

      assert.deepEqual(
        parsed[1],
        { id: 45, swinkle: { id: 3, londy: 2 } }
      );

      assert.deepEqual(
        parsed[2],
        { id: 46, swinkle: null }
      );
    });

    test('one-to-many', function() {
      var parse = make('foboy');
      var response = {
        linked: {
          ned: [
            { id: 23, vappy: 4 }, { id: 45, vappy: 8 }, { id: 99, vappy: 12 }
          ]
        },
        foboy: [
          {
            id: 33,
            links: { ned: [23, 45] }
          },
          {
            id: 66,
            links: { ned: [99] }
          },
          {
            id: 99,
            links: { ned: [] }
          }
        ]
      };

      var parsed = parse(response);

      assert.deepEqual(
        parsed[0],
        {
          id: 33,
          ned: [ { id: 23, vappy: 4 }, { id: 45, vappy: 8 } ]
        }
      );

      assert.deepEqual(
        parsed[1],
        { id: 66, ned: [ { id: 99, vappy: 12 } ] }
      );

      assert.deepEqual(
        parsed[2],
        { id: 99, ned: [] }
      );
    });
  });
});
