'use strict';

var test = require('tape');
var initServer = require('../../server/server.js');
var authPlugin = require('../../server/auth.js');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '') + ' > ';
var config = require('../../server/config.js');
// var client = require('redis-connection')('temp');

test(file + 'Attempt to register a wrong plugin', function (t) {
  var original = authPlugin.register;

  authPlugin.register = function (server, options, next) {
    authPlugin.register = original;

    return next(new Error('register error plugin failed'));
  };

  authPlugin.register.attributes = { name: 'Fake plugin' };

  initServer(config, function (error, server, pool) {
    t.equal(error.message, 'register error plugin failed', 'Handle registration of a failed plugin');
    server.stop();
    pool.end();
    t.end();
  });
});

test.onFinish(() => {
  require('redis-connection').killall();
});
