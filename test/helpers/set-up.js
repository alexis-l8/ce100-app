const redis = require('redis');
const setupData = require('./setup-data.js');
const dbSetup = {};

dbSetup.initialiseDB = (cb) => {
  const client = redis.createClient();
  client.flushdb((err, res) => {
    client.RPUSH('people', stringified(setupData.initialPeople), (err, res1) => {
      client.RPUSH('organisations', stringified(setupData.initialOrgs), (err, res2) => {
        console.log(`DB initialised response from Redis: ${res1}, ${res2}`);
        client.end();
        cb();
      });
    });
  });
};

const stringified = (data) => data.map(d => JSON.stringify(d));

module.exports = dbSetup;
