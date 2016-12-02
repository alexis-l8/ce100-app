/* eslint-disable */

var tape = require('tape');
var jwt = require('jsonwebtoken');
var aguid = require('aguid');


var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

tape('hit an authed route without a cookie get 401', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var options = {
        method: 'GET',
        url: '/people/add'
      };
      server.inject(options, function (res) {
        t.equal(res.statusCode, 401, 'request an endpoint requiring auth get 401');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});

tape('A valid JWT with invalid jti fails Auth', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {

      var validTokenNoSession = jwt.sign({ jti: aguid() }, config.jwt_secret);
      var options = {
        method: 'GET',
        url: '/people/add',
        headers: { cookie: 'token=' + validTokenNoSession }
      };
      server.inject(options, function (res) {
        t.equal(res.statusCode, 401, 'invalid user fails auth');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});

tape('A valid user with EXPIRED SESSION', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var sessionExp = {
        userId: 4,
        jti: aguid(),   // random UUID
        iat: Date.now(),
        exp: Date.now() // this session has EXPIRED (auth test)
      }
      var expired = jwt.sign(sessionExp, config.jwt_secret);

      var options = {
        method: 'GET',
        url: '/people/add',
        headers: { cookie: 'token=' + expired }
      };
      server.inject(options, function (res) {
        t.equal(res.statusCode, 401, 'Expired Session fails auth');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});


tape('A valid JWT.jti (session) without a valid user fails auth', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var sessionNoUser = {
        userId: Math.ceil(Math.random() * 10000000), // non-existent user for auth test
        jti: aguid(),   // random UUID
        iat: Date.now()
      };
      var nouser = jwt.sign(sessionNoUser, config.jwt_secret);

      var options = {
        method: 'GET',
        url: '/people/add',
        headers: { cookie: 'token=' + nouser }
      };
      server.inject(options, function (res) {
        t.equal(res.statusCode, 401, 'invalid user fails auth');
        t.end();


        server.stop();
        pool.end();
      });
    });
  });
});

tape('A valid JWT without a user in the database fails Auth', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var notReal = {
        userId: Math.ceil(Math.random() * 10000000000),
        jti: aguid(),
        iat: Date.now()
      };
      var validTokenButNotRealUser = jwt.sign(notReal, config.jwt_secret);
      var options = {
        method: 'GET',
        url: '/people/add',
        headers: { cookie: 'token=' + validTokenButNotRealUser }
      };

      server.inject(options, function (res) {
        t.equal(res.statusCode, 401, 'invalid user fails auth');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});

tape('A primary user is forbidden access to an admin view', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var primaryToken = sessions.tokens(config.jwt_secret).primary_3;
      var options = {
        method: 'GET',
        url: '/people/add',
        headers: { cookie: 'token=' + primaryToken }
      };

      server.inject(options, function (res) {
        t.equal(res.statusCode, 403, 'incorrect permission request is forbidden');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});

tape('hit an authed route with a valid cookie containing valid users information', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var adminToken = sessions.tokens(config.jwt_secret).admin_1;
      var options = {
        method: 'GET',
        url: '/orgs/add',
        headers: { cookie: 'token=' + adminToken }
      };

      server.inject(options, function (res) {
        t.equal(res.statusCode, 200, 'route allowed');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});
