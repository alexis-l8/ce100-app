'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sinon = require('sinon');
var sendEmail = require('sendemail');
var people = require('ce100-mock-data').people;


var multipartKey = function(key) {
  return 'content-disposition: form-data; name="' + key +'"\r\n';
}

var multipartValue = function (value) {
  return   '\r\n' + value + '\r\n';
}

var multipartPayload = function(payload) {
  var result = '';
  var boundaryStart = '--AaB03x\r\n';
  var boundaryEnd = '--AaB03x--\r\n';
  // start payload
  result += boundaryStart;

  // add keys & values
  var payloadkeys = Object.keys(payload);
  payloadkeys.forEach(function(k, i) {
    result += multipartKey(k);
    result += multipartValue(payload[k]);
    if (i + 1 < payloadkeys.length) {
      result += boundaryStart
    }
  });
  // end
  result += boundaryEnd;
  return result;
}

var addUser = function (payload) {
  var multipart = multipartPayload(payload);
  return {
    method: 'POST',
    url: '/people/add',
    headers: {
      cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'],
      'content-type': 'multipart/form-data; boundary=AaB03x'
    },
    payload: multipart
  };
};



// failing payloads
var noFirst = {first_name: ''};
var noLast = {first_name: 'Jaja', last_name: ''};
var shortPhone = {first_name: 'Jaja', last_name: 'Bink', email: 'ja@ju.co', user_type: 'primary', phone: '+442088377', job_title: 'CEO', org_id: -1};

tape('orgs/add failing validation test', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(addUser(noFirst), function (res) {
        t.equal(res.statusCode, 401, 'no first name fails validation at /people/add');
        t.ok(res.payload.indexOf('first name is not allowed to be empty') > -1, 'reply to user with following message: "first name is not allowed to be empty"');
        server.inject(addUser(noLast), function (res) {
          t.equal(res.statusCode, 401, 'no last name fails validation at /people/add');
          t.ok(res.payload.indexOf('last name is not allowed to be empty') > -1, 'reply to user with following message: "last name is not allowed to be empty"');
            t.end();
            server.stop();
            pool.end();
          });
      });
    });
  });
});

// create new admin user - success: correct object
tape('orgs/add add new admin - success', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {

      var userObj = {
        first_name: 'Jaja',
        last_name: 'Bink',
        email: 'jaja@gmail.com',
        phone: '+44208837733',
        user_type: 'admin',
        job_title: 'CEO',
        org_id: -1
      };

      // sinon will call the function we pass as the 3rd argument instead of sendemail.email function.
      // it will callback with no error.
      var emailSender = sinon.stub(sendEmail, 'email', function (str, user, cb) {
        cb(null); // We only check that there is no error in the handler
      });
      server.inject(addUser(userObj), function (res) {
        var expected = { org_id: null, id: people.length + 1, org_name: null };

        emailSender.restore(); // restore the send emails normal functionality
        t.deepEqual(res.result, expected, 'successful email returns with new user details');
        t.equal(res.statusCode, 302, 'admin is redirected after successful new user');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// create new admin user - fail: incorrect org_id
tape('orgs/add add new admin - fail: org_id', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {

      var userObj = {
        first_name: 'Dirk',
        last_name: 'Gently',
        email: 'di@gen.ly',
        phone: '+44208837733',
        user_type: 'admin',
        job_title: 'Holistic Detective',
        org_id: 6
      };

      server.inject(addUser(userObj), function (res) {
        t.ok(res.payload.indexOf('Admins cannot be attached to an organisation') > -1, 'admin cannot be attached to an organisation');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// create new primary user - success: correct payload obj
tape('orgs/add add primary - success', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {

      var userObj = {
        first_name: 'Jay',
        last_name: 'Binksy',
        email: 'jaja@gmail.com',
        phone: '+44208837733',
        user_type: 'primary',
        job_title: 'CEO',
        org_id: 6
      };

      var emailSender = sinon.stub(sendEmail, 'email', function (str, user, cb) {
        cb(null);
      });
      server.inject(addUser(userObj), function (res) {
        var expected = { org_id: 6, id: people.length + 1, org_name: 'Asda' };

        emailSender.restore();
        t.deepEqual(res.result, expected, 'successful email returns with new user details');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// create new primary user - fails: no org attached
tape('orgs/add add primary with no organisation', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {

      var userObj = {
        first_name: 'Jaja',
        last_name: 'Bink',
        email: 'jaja@gmail.com',
        phone: '+44208837733',
        user_type: 'primary',
        job_title: 'CEO',
        org_id: -1
      };

      server.inject(addUser(userObj), function (res) {
        t.ok(res.payload.indexOf('org id must be larger than or equal to 1') > -1,
          'snack bar appears with correct message: primary user must be linked to an org'
        );
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// create new secondary user with correct fields
tape('orgs/add add new secondary user', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {

      var userObj = {
        first_name: 'Luke',
        last_name: 'Cage',
        email: 'lu@ca.ge',
        phone: '+44208837733',
        user_type: 'secondary',
        job_title: 'Manager',
        org_id: 6
      };

      var emailSender = sinon.stub(sendEmail, 'email', function (str, user, cb) {
        cb(null);
      });
      server.inject(addUser(userObj), function (res) {
        var expected = { org_id: 6, id: people.length + 1, org_name: 'Asda' };

        emailSender.restore();
        t.deepEqual(res.result, expected, 'successful email returns with new user details');
        t.equal(res.statusCode, 302, 'admin is redirected after successful new user');

        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// create new secondary user with incorrect org_id field
tape('orgs/add add secondary user - fail: no org_id', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      var incorrectUserObj = {
        first_name: 'Kylo',
        last_name: 'Ren',
        email: 'ky@lor.en',
        phone: '+447444432198',
        user_type: 'secondary',
        job_title: 'CEO',
        org_id: -1
      };

      server.inject(addUser(incorrectUserObj), function (res) {
        t.ok(res.result.indexOf('org id must be larger than or equal to 1') > -1, 'primary user cannot be added without being attached to an org');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
