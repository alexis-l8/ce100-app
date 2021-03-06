'use strict';

var Hoek = require('hoek');
var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');
var people = require('ce100-mock-data').people;
var sinon = require('sinon');

var endpoints = [
  // people
  {
    url: '/people',
    expectedStatusCode: 200
  },
  {
    url: '/people/add',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/people/add',
    expectedStatusCode: 403
  },
  {
    url: '/people/12/edit',
    expectedStatusCode: 200
  },
  {
    url: '/people/12/toggle-active',
    expectedStatusCode: 403
  },


  // orgs
  {
    url: '/orgs',
    expectedStatusCode: 200
  },
  {
    url: '/orgs/tags',
    expectedStatusCode: 200
  },
  {
    url: '/orgs/add',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/orgs/add',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/orgs/add',
    payload: {},
    expectedStatusCode: 403
  },
  {
    url: '/orgs/1',
    expectedStatusCode: 200
  },
  {
    url: '/orgs/1/edit',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/orgs/1/edit',
    payload: {},
    expectedStatusCode: 403
  },
  {
    url: '/orgs/1/toggle-active',
    expectedStatusCode: 403
  },
  {
    url: '/orgs/1/archived-challenges',
    expectedStatusCode: 403
  },

  // challenges
  {
    url: '/challenges',
    expectedStatusCode: 200
  },
  {
    url: '/challenges/tags',
    expectedStatusCode: 200
  },
  {
    url: '/challenges/3',
    expectedStatusCode: 200
  },
  {
    url: '/challenges/add',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/challenges/add',
    payload: { name: 'H', description: 'h' },
    expectedStatusCode: 403
  },
  {
    url: '/challenges/3/edit',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/challenges/3/edit',
    payload: { name: 'H', description: 'h' },
    expectedStatusCode: 403
  },
  {
    url: '/challenges/3/toggle-active',
    expectedStatusCode: 403
  },

  // insights:
  {
    url: '/insights/1/toggle-active',
    expectedStatusCode: 403
  },
  {
    url: '/insights/1/edit',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/insights/1/edit',
    expectedStatusCode: 403
  },
  {
    url: '/insights',
    expectedStatusCode: 200
  },
  {
    url: '/insights/tags',
    expectedStatusCode: 200
  },
  {
    url: '/insights/add',
    expectedStatusCode: 403
  },
  {
    method: 'POST',
    url: '/insights/add',
    expectedStatusCode: 403
  },
  {
    method: 'GET',
    url: '/resources',
    expectedStatusCode: 200
  },

  // generic
  {
    method: 'GET',
    url: '/',
    expectedStatusCode: 200
  }
];

function getOptions (endpoint) {
  return {
    method: endpoint.method || 'GET',
    url: endpoint.url,
    payload: endpoint.payload,
    headers: {
      cookie: 'token=' + sessions.tokens(config.jwt_secret).secondary_12
    }
  };
}

endpoints.forEach(function (endpoint) {
  tape(endpoint.url + ' (' + (endpoint.method || 'GET ') + ') secondary permissions tests', function (t) {
    sessions.addAll(function () {
      initServer(config, function (err, server, pool) {
        Hoek.assert(!err, 'Error initialising server');
        server.inject(getOptions(endpoint), function (res) {
          t.equal(
            res.statusCode,
            endpoint.expectedStatusCode,
            endpoint.url + ' (' + (endpoint.method || 'GET') + ') status code is as expected (' + endpoint.expectedStatusCode  + ')'
          );

          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});
