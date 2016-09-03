const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../mock-data.js');

// TODO: Route should be authed

tape('set up db', t => {
  const mockOrganisationIds = Object.keys(mockData.completeOrgEntries);
  mockOrganisationIds.forEach((element, index) => {
    client.RPUSH('organisations', JSON.stringify(mockData.completeOrgEntries[element]),
      (error, response) => {
        if (error) console.log('ERROR', element, '-', error);
        t.ok(response, 'adding organisation entires: response from redis is ' + response);
        if (index === mockOrganisationIds.length - 1) {
          client.RPUSH('people', JSON.stringify(mockData.usersActivateDB), (error, response) => {
            if (error) console.log('ERROR', error);
            t.ok(response, 'adding a primary user: response from redis is ' + response);
            t.end();
          });
        }
      }
    );
  });
});

tape('/orgs load general view', t => {
  const options = {
    method: 'GET',
    url: '/orgs'
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('/orgs/0 load specific organisation page', t => {
  const options = {
    method: 'GET',
    url: '/orgs/0'
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
