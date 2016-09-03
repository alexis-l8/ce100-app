require('env2')('config.env');
const fs = require('fs');
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

const testingEndpoints = () => {
  const endpoints = fs.readdirSync('templates/views');
  endpoints.forEach(filename => {
    const options = {
      method: 'GET',
      url: '/' + filename
    };
    tape('testing endpoint:' + filename, (t) => {
      server.inject(options, (reply) => {
        t.equal(reply.statusCode, 200, 'testing the endpoint: ' + filename);
        t.end();
      });
    });
  });
};

// testingEndpoints();

tape.onFinish(() => {
  process.exit(0);
});
