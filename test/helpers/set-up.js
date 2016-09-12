var redis = require('redis');
var setupData = require('./setup-data.js');
var dbSetup = {};

dbSetup.initialiseDB = (cb) => {
  var client = redis.createClient();
  client.flushdb((err, res) => {
    client.RPUSH('people', stringified(setupData.initialPeople), (err, res1) => {
      client.RPUSH('organisations', stringified(setupData.initialOrgs), (err, res2) => {
        setupData.initialSessions.forEach((session, i) => {
          client.HSET('sessions', session.jti, JSON.stringify(session), (err, res3) => {
            if(i === setupData.initialSessions.length - 1) {
              console.log(`DB initialised response from Redis: ${res1}, ${res2}`);
              client.end();
              cb();
            }
          });
        });
      });
    });
  });
};

var stringified = (data) => data.map(d => JSON.stringify(d));

module.exports = dbSetup;
