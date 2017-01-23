'use strict';

var tape = require('tape');
var jwt = require('jsonwebtoken');

var init = require('../../server/server.js');
var config = require('../../server/config.js');


// We can create reset password links that are already expired by setting the `iat` of the jwt
// to more than the `expiresIn` options
var resetPassword = function (method, minutesAgo, payload) {
  var userId = { id: 3, iat: Math.floor(Date.now() / 1000) - 60 * minutesAgo };
  return {
    method: method,
    url: '/people/password-reset/' + jwt.sign(userId, config.jwt_secret, { expiresIn: 60 * 5 }),
    payload: payload
  };
};
var goodPasswords = { password: 'Hello2', confirm_password: 'Hello2' };
var badPasswords = { password: 'Hello1', confirm_password: 'Hello2' };

tape('/people/password-reset/{hashedId} (GET & POST) - expired password activation link: --> ' + __filename, function (t) {
  var expectedMessage = 'Your reset password link has expired. Please enter your email address again and follow the link within 5 minutes';

  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(resetPassword('GET', 10), function (res) {
      t.equal(res.statusCode, 400, 'expired link returns 400 error');
      t.ok(res.payload.indexOf(expectedMessage) > -1, 'User is notified that their link has expired');

      // similar test for the POST route
      server.inject(resetPassword('POST', 10, goodPasswords), function (res) {
        t.equal(res.statusCode, 400, 'expired link returns 400 error');
        t.ok(res.payload.indexOf(expectedMessage) > -1, 'User is notified that their link has expired on POST route');

        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});


tape('/people/password-reset/{hashedId} (GET) - unexpired password activation link: --> ' + __filename, function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(resetPassword('GET', 1), function (res) {
      t.equal(res.statusCode, 200, 'unexpired link returns 200 error');
      t.ok(res.payload.indexOf('Reset password') > -1, 'User is served the correct view when their link has not expired');

      t.end();
      server.stop();
      pool.end();
    });
  });
});



tape('/people/password-reset/{hashedId} (POST) - unexpired password link fail validation: --> ' + __filename, function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(resetPassword('POST', 1, badPasswords), function (res) {
      t.equal(res.statusCode, 400, 'fail validation returns 400 error');
      t.ok(res.payload.indexOf('Reset password') > -1, 'correct view served when user fails validation');
      t.ok(res.payload.indexOf('confirm password must match password') > -1, 'Correct message displayed to the user');
      t.end();
      server.stop();
      pool.end();
    });
  });
});


tape('/people/password-reset/{hashedId} (POST) - password reset success: --> ' + __filename, function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');

    // Change users password from Hello1 to Hello2
    server.inject(resetPassword('POST', 1, goodPasswords), function (res) {
      t.equal(res.statusCode, 302, 'reset password success should redirect user');
      t.equal(res.headers.location, '/orgs', 'user is now logged in and redirected');
      t.ok(res.headers['set-cookie'], 'cookie has been set');

      function login (password) {
        return {
          url: '/login',
          method: 'POST',
          payload: { email: 'sa@ro.co', password: password }
        };
      }

      // attempt login with old password
      server.inject(login('Hello1'), function (res) {
        var badPasswordMessage = 'Sorry, that email or password is incorrect. Please try again.';

        t.equal(res.statusCode, 401, 'users old password no longer works');
        t.ok(res.payload.indexOf(badPasswordMessage) > -1, 'the users old password does not work');

        // now log in with new password
        server.inject(login(goodPasswords.password), function (res) {
          t.equal(res.statusCode, 302, 'user is logged in and redirected and password has been changed');
          t.equal(res.headers.location, '/orgs', 'user is now logged in and redirected');
          t.ok(res.headers['set-cookie'], 'cookie has been set');

          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});
