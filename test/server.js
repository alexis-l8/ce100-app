const tape = require('tape');

const server = require('../server/server.js');

tape('testing homepage is returned', (t) => {
  const options = {
    method: 'GET',
    url: '/'
  };
  server.inject(options, (reply) => {
    t.equal(reply.statusCode, 302, 'redirected to log in page because no cookie');
    t.end();
  });
});

tape.onFinish(() => {
  process.exit(0);
});
