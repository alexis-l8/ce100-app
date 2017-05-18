'use strict';

var jwt = require('jsonwebtoken');
var aguid = require('aguid');
var bcrypt = require('bcrypt');
var Hoek = require('hoek');

module.exports = function (request, reply) {
  var email = request.payload.email;
  var password = request.payload.password;

  request.server.methods.pg.people.getBy('email', email, function (error, pgResponse) {
    var person;

    // handle error
    if (error) {
      process.stdout.write('Redis error setting session on login');

      return reply.view('login', { error: { message: 'Sorry, something went wrong. Please try again.', values: request.payload } }).code(500);
    }

    person = pgResponse[0];
    // no results - > email wrong
    if (!person) {
      return reply.view('login', { error: rejectLogin(request.payload) }).code(401);
    }
    // account activated -> redirect
    if (!person.account_activated) {
      return reply.view('login', { error: { message: 'Please check your emails, you need to activate your account before logging in.', values: request.payload } });
    }
    // password check
    bcrypt.compare(password, person.password, function (bcryptErr, isValid) {
      if (bcryptErr) {
        return reply.view('login', { error: { message: 'Sorry, something went wrong. Please try again.', values: request.payload } }).code(500);
      }
      if (!isValid) {
        return reply.view('login', { error: rejectLogin(request.payload) }).code(401);
      }
      var session = {
        userId: person.id, // duh
        jti: aguid(),   // random UUID
        iat: Date.now() // session creation time (start)
      };
      request.server.app.redis.HSET('sessions', session.jti, JSON.stringify(session), function (redisErr, res) {
        if (redisErr) {
          process.stdout.write('Redis error setting session on login');
          return reply.view('login', {error: { message: 'Sorry, something went wrong. Please try again.', values: request.payload } }).code(500);
        }
        var token = jwt.sign(session, process.env.JWT_SECRET);
        var orgId = person.org_id

        if (person.user_type === 'admin') {
          return reply.redirect('/').state('token', token);
        }
        request.server.methods.pg.organisations.getDetails(orgId, function (pgError, orgData) {
          Hoek.assert(!pgError, 'db error');
          var missionStatement = orgData.org.mission_statement;

          if(person.user_type === "primary" && !missionStatement) {
            return reply.redirect('/orgs/' + orgId + '/edit').state('token', token);
          } else {
            return reply.redirect('/').state('token', token);
          }
        });
      });
    });
  });
};

function rejectLogin (values) {
  return {
    message: 'Sorry, that email or password is incorrect. Please try again.',
    values: values
  };
}
