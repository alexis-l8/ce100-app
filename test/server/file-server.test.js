'use strict';

var Hoek = require('hoek');
var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');


tape('serve file function - get css file: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (err, server, pool) {
      t.ok(!err, 'Error initialising server: ' + err);
      server.inject({ url: '/public/css/main.css' }, function (res) {
        t.equal(res.statusCode, 200, 'resource handler returns 200');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
