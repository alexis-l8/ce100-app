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
  },
  {
    userId: 12, // secondary user
    jti: aguid(),   // random UUID
    iat: Date.now()
  }
];

sessions.tokens = function (secret) {
  return {
    admin_1: jwt.sign(sessions.data[0], secret),
    primary_3: jwt.sign(sessions.data[2], secret),
    secondary_12: jwt.sign(sessions.data[3], secret)
  };
};

sessions.addAll = function (cb) {
  var client = require('redis').createClient(); //eslint-disable-line

  flushSessions(client, function () { // eslint-disable-line
    addSessions(client, function () { // eslint-disable-line
      client.end(true);
      cb();
    });
  });
};

module.exports = sessions;

function flushSessions (client, cb) {
  var keys;
  var deleted = 0;

  client.hgetall('sessions', function (er, ss) {
    if (!ss) {
      return cb();
    }
    keys = Object.keys(ss);
    keys.forEach(function (s) {
      client.hdel('sessions', s, function (err) { //eslint-disable-line
        Hoek.assert(!err, 'error removing session: ' + s);
        deleted += 1;
        if (keys.length === deleted) {
          return cb();
        }
      });
    });
  });
}

function addSessions (client, cb) {
  var added = 0;
  sessions.data.forEach(function (session) {
    client.HSET('sessions', session.jti, JSON.stringify(session), function (err, session_res) { // eslint-disable-line
      Hoek.assert(!err, 'error adding session: ' + session);
      added += 1;
      if (added === sessions.data.length) {
        return cb();
      }
    });
  });
}
