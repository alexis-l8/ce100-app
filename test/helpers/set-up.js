var client = require('redis-connection')('temp');
var people = require('./setup/people.js')['people'];
var orgs = require('./setup/orgs.js')['orgs'];
var challenges = require('./setup/challenges.js')['challenges'];
var sessions = require('./setup/sessions.js')['sessions'];
var dbSetup = {};

dbSetup.initialiseDB = (cb) => {
  client.flushdb((err, res) => {
    client.RPUSH('people', stringified(people), (err, res1) => {
      client.RPUSH('organisations', stringified(orgs), (err, res2) => {
        client.RPUSH('challenges', stringified(challenges), (err, res3) => {
          client.HSET('tags', 'tags', JSON.stringify(require('../../tags/tags.json')), (err, res4) => {
            sessions.forEach((session, i) => {
              client.HSET('sessions', session.jti, JSON.stringify(session), (err, session_res) => {
                if(i === sessions.length - 1) {
                  console.log(`DB initialised response from Redis: ${res1}, ${res2}, ${res3}, ${res4}`);
                  cb();
                }
              });
            });
          });
        });
      });
    });
  });
};

var stringified = (data) => data.map(d => JSON.stringify(d));

module.exports = dbSetup;
