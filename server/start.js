var Hoek = require('hoek');
var server = require('./server.js');

// set up db
require('../test/helpers/set-up.js').initialiseDB(() => {});

server.start(err => {
  Hoek.assert(!err, err);
  console.log(`Server running at port: ${server.info.uri}`);
});
