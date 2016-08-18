const tape = require('tape');
const server = require('../server/server.js');

tape('end server', t => {
  server.stop(function(){});
  t.end();
});
