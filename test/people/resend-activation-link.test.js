'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sinon = require('sinon');
var sendEmail = require('sendemail');

tape('/people/22/resend-activation-link', function (t) {
  var route = {
    method: 'GET',
    url: '/people/22/resend-activation-link',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] },
  };

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var emailSender = sinon.stub(sendEmail, 'email', function (str, user, cb) {
        cb(null);
      });
      server.inject(route, function (res) {
        emailSender.restore();
        t.equal(res.statusCode, 302, 'redirection status code')
        t.equal(res.headers.location, '/people', 'redirect to people page')
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
