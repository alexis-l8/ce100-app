const tape = require('tape');

const server = require('../server/server.js');

const getViews = (endpoint) => {
  tape('testing' + endpoint, t => {
    const options = {
      method: 'GET',
      url: endpoint
    };
    server.inject(options, (reply) => {
      t.equal(reply.statusCode, 200, 'homepage returned with statusCode 200');
      t.end();
    });
  });
};

var views = [
  '/',
  '/people/add',
  '/activate'
];

views.forEach((template, index) => {
  getViews(template);
  if (index === views.length - 1) server.stop(() => {});
});

tape.onFinish(() => {
  process.exit(0);
});
