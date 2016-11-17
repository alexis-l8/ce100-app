'use strict';

var Hoek = require('hoek');
var initServer = require('./server.js');
var config = require('./config.js');

initServer(config, function (error, server) {
  Hoek.assert(!error, error);
  return server.start(function (error) {
    Hoek.assert(!error, error);
    process.stdout.write('server listening on port ' + server.info.uri + '\n');
  });
});
