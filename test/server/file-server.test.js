var tape = require('tape');
var setup = require('../helpers/set-up.js');
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

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
