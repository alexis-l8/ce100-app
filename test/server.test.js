const fs = require('fs');
const tape = require('tape');

const server = require('../server/server.js');

tape('server sets up', (t) => {
  const options = {
    method: 'GET',
    url: '/'
  };
  server.inject(options, (reply) => {
    t.equal(reply.statusCode, 200, 'server.js exports a basic server');
    t.end();
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
    tape('testing endpoints', (t) => {
      server.inject(options, (reply) => {
        t.equal(reply.statusCode, 200, 'testing the endpoint: ' + filename);
        t.end();
      });
    });
  })
}

// testingEndpoints();
