var tape = require('tape');
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');

var sessions = require('../helpers/add-sessions.js');


function addLogo (user, org_id) {
  return {
    method: 'POST',
    url: '/orgs/' + org_id + '/edit',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=AaB03x',
      'cookie': 'token=' + sessions.tokens(config.jwt_secret)[user]
    },
    payload:
      '--AaB03x\r\n' +
      'content-disposition: form-data; name="name"\r\n' +
      '\r\n' +
      'Apple\r\n' +
      '--AaB03x\r\n' +
      'content-disposition: form-data; name="file_name"\r\n' +
      '\r\n' +
      'foxy.txt\r\n' +
      '--AaB03x\r\n' +
      'content-disposition: form-data; name="mission_statement"\r\n' +
      '\r\n' +
      'Change the economy!\r\n' +
      '--AaB03x\r\n' +
      'content-disposition: form-data; name="logo"; filename="foxy.txt"\r\n' +
      'Content-Type: text/plain\r\n' +
      '\r\n' +
      'foxxxxyy\r\r\n' +
      '--AaB03x--\r\n'
  };
}

// test an admin successfuly adding an organisation
tape('/orgs/{id}/edit (POST) - admin adds a txt file to the edit org form: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addLogo('admin_1', 1), function (res) {
        t.equal(res.statusCode, 302, 'status code is 200 admin can add a logo');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
