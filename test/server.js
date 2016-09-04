// const fs = require('fs');
const tape = require('tape');

const server = require('../server/server.js');

tape('basic test to get Travis working!', t => {
  const value = 1 + 1;
  t.equal(value, 2, '1 + 1 = 2 !');
  t.end();
});

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
//
// const testingEndpoints = () => {
//   const endpoints = fs.readdirSync('templates/views');
//   endpoints.forEach(filename => {
//     const options = {
//       method: 'GET',
//       url: '/' + filename
//     };
//     tape('testing endpoint:' + filename, (t) => {
//       server.inject(options, (reply) => {
//         t.equal(reply.statusCode, 200, 'testing the endpoint: ' + filename);
//         t.end();
//       });
//     });
//   });
// };
//
// testingEndpoints();
//
tape.onFinish(() => {
  server.stop(() => {});
});
