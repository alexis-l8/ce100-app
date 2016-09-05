const fs = require('fs');
const tape = require('tape');

const server = require('../server/server.js');

tape('testing homepage is returned', (t) => {
  const options = {
    method: 'GET',
    url: '/'
  };
  server.inject(options, (reply) => {
    t.equal(reply.statusCode, 200, 'homepage returned with statusCode 200');
    t.end();
  });
});

tape.onFinish(() => {
  process.exit(0);
});
