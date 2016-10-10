var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var Iron = require('iron');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people/add check auth', t => {
  t.plan(3);
  var primaryCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${primary_token}` }
  };
  var adminCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}`}
  };
  var primaryCookiePost = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(primaryCookie, res => {
    t.equal(res.statusCode, 403, 'primary cannot access /people/add');
    server.inject(adminCookie, res => {
      t.equal(res.statusCode, 200, 'admin can access /people/add');
      server.inject(primaryCookiePost, res => {
        t.equal(res.statusCode, 403, 'primary cannot access /people/add');
        t.end();
      });
    });
  });
});

tape('/people/add fail validation', t => {
  var fail = (payload) => ({
    method: 'POST',
    url: '/people/add',
    payload: payload,
    headers: { cookie: `token=${admin_token}` }
  });

  // failing payloads
  var noFirst = {first_name: ''};
  var noLast = {first_name: 'Jaja', last_name: ''};
  var noPhone = {first_name: 'Jaja', last_name: 'Bink', email: 'ja@ju.co', phone: '', organisation_id: '-1'};
  var shortPhone = {first_name: 'Jaja', last_name: 'Bink', email: 'ja@ju.co', phone: '+442088377', organisation_id: '-1'};

  server.inject(fail(noFirst), res => {
    t.equal(res.statusCode, 401, 'no first name fails validation at /people/add');
    t.ok(res.payload.indexOf('first name is not allowed to be empty') > -1, 'reply to user with following message: "first name is not allowed to be empty"');
    server.inject(fail(noLast), res => {
      t.equal(res.statusCode, 401, 'no last name fails validation at /people/add');
      t.ok(res.payload.indexOf('last name is not allowed to be empty') > -1, 'reply to user with following message: "last name is not allowed to be empty"');
      server.inject(fail(noPhone), res => {
        t.equal(res.statusCode, 401, 'no phone number fails validation at /people/add');
        t.ok(res.payload.indexOf('phone is not allowed to be empty') > -1, 'reply to user with following message: "phone must be a number"');
        server.inject(fail(shortPhone), res => {
          t.equal(res.statusCode, 401, 'Too short phone number fails validation at /people/add');
          t.ok(res.payload.indexOf('phone length must be at least 11 characters long') > -1, 'reply to user with following message: "phone must be at least"');
          t.end();
        });
      });
    });
  });
});


tape('add and activate a new user and updates the linked organisation', t => {
  var addOrg = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  var addPerson = (orgId) => ({
    method: 'POST',
    url: '/people/add',
    payload: payloads.usersAddPayload(orgId),
    headers: { cookie: `token=${admin_token}` }
  });
  var logout = {
    method: 'GET',
    url: '/logout',
    headers: { cookie: `token=${admin_token}` }
  };
  var activateUser = hashed => method => payload => ({
    url: `/people/activate/${hashed}`,
    method: method,
    payload: payload
  });

  var shortPassword = {password: 'aaa', confirm_password: 'aaa'};
  var unmatchingPasswords = {password: 'Hello1', confirm_password: 'Hello2'};
  var goodPasswords = payloads.usersActivatePayload;
  var newOrganisationId;

  server.inject(addOrg, res => {
    t.equal(res.statusCode, 302, 'redirects 1');
    newOrganisationId = res.result.organisation_id;
    server.inject(addPerson(newOrganisationId), res => {
      t.equal(res.statusCode, 302, 'redirects 2');
      var newUrl = res.headers.location;
      t.ok(newUrl === '/people', 'route redirects to /people');
      var userId = res.result.userId;
      Iron.seal(userId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, hashed) => {

        var activateUserView = activateUser(hashed)('GET')();
        var activatePost = activateUser(hashed)('POST');

        server.inject(activateUserView, res => {
          t.ok(res.raw.req.url.indexOf('/activate') > -1, 'activate account view returned if user is not already activated');
          server.inject(activatePost(shortPassword), res => {
            t.equal(res.statusCode, 401, 'fail validation returns 401');
            t.ok(res.payload.indexOf('password length must be at least 6 characters long') > -1, 'A short password replies with message: "password length must be at least 6 characters long"');
            server.inject(activatePost(unmatchingPasswords), res => {
              t.equal(res.statusCode, 401, 'fail validation returns 401');
              t.ok(res.payload.indexOf('confirm password must match password') > -1, 'Unmatching passwords replies with message: "confirm password must match password"');
              server.inject(activatePost(goodPasswords), res => {
                t.equal(res.headers.location, `/orgs/${newOrganisationId}`, 'completing activate user with organisation redirects to their organisation page');
                t.ok(res.headers['set-cookie'], 'cookie has been set');
                server.inject(logout, res => {
                  server.inject(activateUserView, res => {
                    t.equal(res.headers.location, '/login', 'if user tries to click on activation link having already activated, redirect to login');
                    t.end();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

tape('add a new admin not attached to an organisation, activate admin, redirect to all orgs view', t => {
  var addAdmin = {
    method: 'POST',
    url: '/people/add',
    payload: payloads.adminAddPayload,
    headers: { cookie: `token=${admin_token}` }
  };
  var activateUser = hashed => ({
    url: `/people/activate/${hashed}`,
    method: 'POST',
    payload: payloads.usersActivatePayload
  });

  server.inject(addAdmin, res => {
    t.equal(res.statusCode, 302, 'redirects 2');
    t.equal(res.headers.location, '/people', 'route redirects to /people');
    var newAdminId = res.result.userId;
    Iron.seal(newAdminId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, hashed) => {
      server.inject(activateUser(hashed), res => {
        t.equal(res.headers.location, '/browse/orgs', 'completing activate user with organisation redirects to their organisation page');
        t.ok(res.headers['set-cookie'], 'cookie has been set');
        t.end();
      });
    });
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
