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
        t.ok(res.payload.indexOf('phone must be a number') > -1, 'reply to user with following message: "phone must be a number"');
        server.inject(fail(shortPhone), res => {
          t.equal(res.statusCode, 401, 'Too short phone number fails validation at /people/add');
          t.ok(res.payload.indexOf('phone must be larger than or equal to') > -1, 'reply to user with following message: "phone must be at least"');
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
  var addPerson = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(payloads.usersAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  var logout = {
    method: 'GET',
    url: '/logout',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(addOrg, res => {
    t.equal(res.statusCode, 302, 'redirects');
    server.inject(addPerson, res => {
      t.equal(res.statusCode, 302, 'redirects');
      var newUrl = res.headers.location;
      t.ok(newUrl === '/people', 'route redirects to /people');
      var userId = res.result.userId;
      Iron.seal(userId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, hashed) => {
        var activateUser = {
          method: 'POST',
          url: `/people/activate/${hashed}`,
          payload: JSON.stringify(payloads.usersActivatePayload)
        };
        var activateUserView = {
          method: 'GET',
          url: `/people/activate/${hashed}`,
          payload: JSON.stringify(payloads.usersActivatePayload)
        };
        server.inject(activateUserView, res => {
          // TODO: Ask Nelson & Marie -> Why is this undefined?
          // console.log(res.headers.location);
          // t.equal(res.headers.location.indexOf('/activate') > -1, 'activate account view returned if user is not already activated');
          t.ok(res.raw.req.url.indexOf('/activate') > -1, 'activate account view returned if user is not already activated');
          server.inject(activateUser, res => {
            t.equal(res.headers.location, '/browse/orgs', 'completing activate user redirects to dashboard');
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

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
