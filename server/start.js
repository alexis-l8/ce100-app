'use strict';

var Hoek = require('hoek');
var initServer = require('./server.js');
var config = { port: 3000 };

require('env2')('.env');
// set up db
require('../test/helpers/set-up.js').initialiseDB();

initServer(config, function (error, server) {
  Hoek.assert(!error, error);
  process.stdout.write('server listening on port ' + server.info.uri + '\n');
});

