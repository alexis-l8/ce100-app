var tape = require('tape');
var payloads = require('../helpers/mock-payloads.js');
var client = require('redis').createClient();
var initServer = require('../../server/server.js');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '') + ' > ';
var config = require('../../server/config.js');


tape('/login admin successful', t => {
  initServer(config, function (error, server, pool) {
    var options = {
      method: 'POST',
      url: '/login',
      payload: JSON.stringify(payloads.loginAdmin)
    };
    server.inject(options, res => {
      t.equal(res.statusCode, 302, 'log in credentials are correct and user gets redirected to homepage');
      t.ok(res.headers['set-cookie'], 'cookie has been set');
      t.end();
      client.end();
      server.stop();
      pool.end();
    });
  });
});


tape(file + 'login test', t => {
  initServer(config, function (error, server, pool) {
    var options = {
      method: 'GET',
      url: '/login'
    };
    server.inject(options, res => {
      t.equal(res.statusCode, 200, 'route exists and replies 200');
      t.end();

      server.stop();
      pool.end();
    });
  });
});


tape(file + '/login with an unrecognised email address', t => {
  initServer(config, function (error, server, pool) {
    var options = {
      method: 'POST',
      url: '/login',
      payload: JSON.stringify(payloads.loginBadEmail)
    };
    server.inject(options, res => {
      t.equal(res.statusCode, 401, 'unrecognised email replies with unauthorized 401');
      t.ok(res.payload.indexOf('that email or password is incorrect') > -1, 'we let the user know why their login failed with message: "sorry that email or password is incorrect"');
      t.end();

      server.stop();
      pool.end();
    });
  });
});

tape('/login fail validation', t => {
  initServer(config, function (error, server, pool) {

    var failValidation = (email, password) => ({
      method: 'POST',
      url: '/login',
      payload: {email, password}
    });
    server.inject(failValidation('', 'Hello1'), res => {
      t.equal(res.statusCode, 401, 'no email given, replies with unauthorized 401');
      t.ok(res.payload.indexOf('email is not allowed to be empty') > -1, 'we let the user know why their login failed with message: "email is not allowed to be empty"');

      server.inject(failValidation('sa@ro.co', 'Hello'), res => {
        t.equal(res.statusCode, 401, 'password too short, replies with unauthorized 401');
        t.ok(res.payload.indexOf('password length must be at least 6 characters long') > -1, 'we let the user know why their login failed with message: "password length must be at least 6 characters long"');
        t.end();

        server.stop();
        pool.end();
      });
    });
  });
});


tape('/login post logs a user in with incorrect credentials', t => {
  initServer(config, function (error, server, pool) {
    var options = {
      method: 'POST',
      url: '/login',
      payload: JSON.stringify(payloads.loginAdminIncorrect)
    };
    server.inject(options, res => {
      t.equal(res.statusCode, 401, 'log in credentials are incorrect');
      t.end();

      server.stop();
      pool.end();
    });
  });
});


//
// tape('teardown', t => {
//   client.FLUSHDB();
//   t.end();
// });
//
// tape.onFinish(() => {
//
//   server.stop(() => {});
// });
