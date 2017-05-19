'use strict';

var tape = require('tape');
var isUserAccountActivated = require('../../templates/helpers/isUserAccountActivated.js');

// first array builds dummy request, second string is expected outcome, third is test comment
var tests = [
  [[true, true, "active"], true, 'user has an active account'],
  [[false, null, "inactive"], true, 'user account is inactive'],
  [[true, false, "pending"], true, 'user account is pending']
];

// cancel url function
tape('check what the account status is for a user', function (t) {
  tests.forEach(function (test) {
    var actual = isUserAccountActivated(test[0][0], test[0][1], test[0][2])
    var expected = test[1];
    t.equal(actual, expected, test[1])
  });
  t.end();
});
