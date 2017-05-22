'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var sendEmail = require('../../email.js');

module.exports = function (request, reply) {

  var userId = request.params.id && parseInt(request.params.id);

  request.server.methods.pg.people.getBy('id', userId, function (pgErr, people) {
    Hoek.assert(!pgErr, 'database error');
    var user = people[0];
    sendEmail('welcome', user, function (emailErr) {
      Hoek.assert(!emailErr, 'send email error');

      return reply.redirect('/people');
    });
  });
};
