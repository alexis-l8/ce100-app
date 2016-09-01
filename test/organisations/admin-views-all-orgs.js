const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const helpers = require('../helpers.js');
const mockData = require('../mock-data.js');

// TODO: Route should be authed

tape('set up db', t => {
  const mockOrganisationIds = Object.keys(mockData.completeOrgEntries);
  mockOrganisationIds.forEach((element, index) => {
    client.RPUSH('organisations', JSON.stringify(mockData.completeOrgEntries[element]),
      (error, response) => {
        if (error) console.log('ERROR', element, '-', error);
        if (index === mockOrganisationIds.length - 1) t.end();
      }
    );
  });
});

tape.onFinish(() => {
  // client.FLUSHDB();
  process.exit(0);
});
