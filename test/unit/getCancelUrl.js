'use strict';

var tape = require('tape');
var getCancelUrl = require('../../server/handlers/helpers.js').getCancelUrl;

// function builds a dummy request with all the keys that `getCancelUrl` uses
function dummyRequest (referrer, current, org_id) {
  return {
    path: current, // '/challenges/2',
    auth: { credentials: { organisation_id: org_id } }, // null,
    info: { referrer: 'http://localhost:3000' + referrer } // '/challenges'
  }
};

// first array builds dummy request, second string is expected outcome, third is test comment
var tests = [
  [['/orgs/1', '/challenges/3'],  '/orgs/1', 'cancel url from viewing an org profile'],
  [['/orgs', '/challenges/5'], '/orgs', 'cancel url from browse view'],
  [['/orgs?tags=3', '/challenges/3'], '/orgs?tags=3', 'cancel url from browse with tags'],
  [['/challenges/3', '/challenges/3', null], '/orgs', 'admin default cancel view is /orgs'],
  [['/challenges/3', '/challenges/3', 5], '/orgs/5', 'primary default cancel view is their orgs profile']
];

// cancel url function
tape('cancel url function gets the correct url', function (t) {
  tests.forEach(function (test) {
    var actual = getCancelUrl(dummyRequest.apply(null, test[0]))
    var expected = test[1];

    t.equal(actual, expected, test[2])
  });
  t.end();
});
