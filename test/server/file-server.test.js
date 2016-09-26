var tape = require('tape');
var server = require('../../server/server.js');

tape('get css file', t => {
  var options = {
    method: 'GET',
    url: '/public/css/main.css'
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 200, 'request a endpoint requiring auth get 401');
    t.end();
  });
});

tape.onFinish(() => {
  server.stop(() => {});
});
