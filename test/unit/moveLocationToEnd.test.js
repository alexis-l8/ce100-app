'use strict';

var tape = require('tape');
var locationCategoryToEnd = require('../../server/handlers/helpers.js').locationCategoryToEnd;

var withLocation = [
  { category_name: 'a' },
  { category_name: 'b' },
  { category_name: 'LOCATION' },
  { category_name: 'c' }
];

var expectedWithLocation = [
  { category_name: 'a' },
  { category_name: 'b' },
  { category_name: 'c' },
  { category_name: 'LOCATION' }
];

var withoutLocation = [
  { category_name: 'a' },
  { category_name: 'b' },
  { category_name: 'c' }
];

// cancel url function
tape('move location categorie to end of list helper function', function (t) {
  t.deepEqual(locationCategoryToEnd(withLocation), expectedWithLocation, 'helper function moves category with location to the end of the list');
  t.deepEqual(locationCategoryToEnd(withoutLocation), withoutLocation, 'helper function does not change a list of categories if there is none with name LOCATION');

  t.end();
});
