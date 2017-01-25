 'use strict';

var config = require('../../config.js');
var sendEmail = require('../../email.js');
var Hoek = require('hoek');

module.exports = function (request, reply) {
  var userEmail = request.payload.email;
  request.server.methods.pg.people.getBy('email', userEmail, function (pgErr, pgRes) {
    Hoek.assert(!pgErr, 'database error');
    // if no email address found, let the user know
    if (pgRes.length === 0) {
      return reply.view('request-password-reset',
        { error: { message: 'Email not found' } }).code(400);
    }


    sendEmail('reset', pgRes[0], function (err, res)  {
      Hoek.assert(!err, 'Send email error');
      return reply.view('request-password-reset', { emailSent: true });
    });
  });
}
