'use strict';

var tape = require('tape');
var getView = require('../../server/handlers/helpers.js').getView;

// check that navbar displays - highlighted and unhighlighted - as expected

// first element = request.path (i.e. url of current page), second string is expected outcome, third is test comment
var tests = [
  ['/orgs', { 'explore': true }, 'navbar option from browse orgs view'],
  ['/challenges', { 'explore': true }, 'navbar option from browse challenges view'],
  ['/insights', { 'explore': true }, 'navbar option from browse insights view'],
  ['/challenges/add', { 'add-chal': true }, 'navbar option from add-challenge view'],
  ['/challenges/1/tags', { 'add-chal': true }, 'navbar option from add tags to new challenge view'],
  ['/orgs/1', { 'profile': true }, 'navbar option from org details view'],
  ['/landing', {}, 'navbar option from landing page view']
];

// getView function
tape('getView function returns correct view', function (t) {
  tests.forEach(function (test) {
    var actual = getView(test[0]);
    var expected = test[1];

    t.deepEqual(actual, expected, test[2]);
  });
  t.end();
});
