const fs = require('fs');
const tape = require('tape');

const server = require('../server/server.js');

tape('server sets up', (test) => {
  const options = {
    method: 'GET',
    url: '/'
  };
  server.inject(options, (reply) => {
    test.equal(reply.statusCode, 200, 'server.js exports a basic server');
    server.stop(test.end());
  });
});

const testingEndpoints = () => {
  const endpoints = fs.readdirSync('templates/views');
  const failedEndpoints = [];
  endpoints.forEach(filename => {
    const options = {
      method: 'GET',
      url: '/' + filename
    };
    tape('testing endpoints', (test) => {
      server.inject(options, (reply) => {
        test.equal(reply.statusCode, 200, 'testing the endpoint: ' + filename);
        server.stop(test.end());
      });
    });
  })
}
