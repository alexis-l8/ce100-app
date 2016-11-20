'use strict';

require('env2')('.env');
var Hoek = require('hoek');
var client = require('redis').createClient();
var initServer = require('../server/server.js');

var people = require('../test/helpers/setup/people.js')['people'];
var orgs = require('../test/helpers/setup/orgs.js')['orgs'];
var challenges = require('../test/helpers/setup/challenges.js')['challenges'];
var sessions = require('../test/helpers/setup/sessions.js')['sessions'];

var stringified = (data) => data.map(d => JSON.stringify(d));

function populateDB (dbUrl, cb) {
  var config = dbUrl === 'local'
    ? require('./config.js')(process.env.DATABASE_URL)
    : require('./config.js')(dbUrl);
  initServer(config, function (serverErr, server) {
    Hoek.assert(!serverErr, serverErr);
    client.flushdb(function (resetErr, res) {
      Hoek.assert(!resetErr, resetErr);
      client.rpush('people', stringified(people), function (err1, res1) {
        Hoek.assert(!err1, err1);
        client.rpush('organisations', stringified(orgs), function (err2, res2) {
          Hoek.assert(!err2, err2);
          client.rpush('challenges', stringified(challenges), function (err3, res3) {
            Hoek.assert(!err3, err3);
            client.hset('tags', 'tags', JSON.stringify(require('../tags/ORIGINAL.json')), (err4, res4) => {
              Hoek.assert(!err4, err4);
              sessions.forEach((session, i) => {
                client.hset('sessions', session.jti, JSON.stringify(session), (err5, sessionRes) => {
                  Hoek.assert(!err5, err5);
                  if (i === sessions.length - 1) {
                    console.log(`DB initialised response from Redis: ${res1}, ${res2}, ${res3}, ${res4}`);
                    return cb('Hi');
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

populateDB(process.argv[2], function(response) {
  console.log(response);
});
