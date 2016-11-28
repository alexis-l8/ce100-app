'use strict';

var aguid = require('aguid');
var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var sessions = {};


sessions.data = [
  {
    userId: 1, // admin user
    jti: aguid(),   // random UUID
    iat: Date.now()
  },
  {
    userId: 1, // admin user
    jti: aguid(),   // random UUID
    iat: Date.now() - 10000
  },
  {
    userId: 3, // primary user
    jti: aguid(),   // random UUID
    iat: Date.now()
  }
];

sessions.tokens = function (secret) {
  return {
    admin: jwt.sign(sessions.data[0], secret),
    primary: jwt.sign(sessions.data[2], secret)
  };
};

sessions.addAll = function (cb) {
  var client = require('redis').createClient(); //eslint-disable-line
  var finished = 0;

  client.flushdb(function (err) {
    Hoek.assert(!err, 'error flushing db');
    sessions.data.forEach(function (session) {
      client.HSET('sessions', session.jti, JSON.stringify(session), function (err, session_res) { // eslint-disable-line
        Hoek.assert(!err, 'error adding to sessions');
        finished += 1;
        if (finished === sessions.data.length - 1) {
          client.end(true);

          return cb();
        }
      });
    });
  });
};

module.exports = sessions;
