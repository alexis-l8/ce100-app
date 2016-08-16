const tape = require('tape');
const server = require('../server/server.js');

tape('server sets up', (t) => {
  const options = {
    method: 'GET',
    url: '/'
  };
  server.inject(options, (reply) => {
    t.equal(reply.statusCode, 200, 'server.js exports a basic server');
    server.stop(t.end());
  });
});
