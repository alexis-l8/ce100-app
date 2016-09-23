var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var orgs = require('../helpers/setup/orgs.js')['orgs'];
var people = require('../helpers/setup/people.js')['people'];

var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('primary user cannot GET or POST to edit user for different user', t => {
  var getOptions = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${primary_token}` }
  };
  var postOptions = {
    method: 'POST',
    url: '/people/3/edit',
    payload: payloads.primaryEdit,
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(getOptions, res => {
    t.equal(res.statusCode, 401, 'primary user cannot GET edit user view if wrong user');
    server.inject(postOptions, res => {
      t.equal(res.statusCode, 401, 'primary user cannot POST edit user if wrong user');
      t.end();
    });
  });
});

// test a primary user editing their settings
tape('primary user can view their own edit profile view', t => {
  var user = people[2];
  var getOptions = {
    method: 'GET',
    url: `/people/${user.id}/edit`,
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(getOptions, res => {
    t.equal(res.payload.indexOf('rchive User'), -1, 'primary user cannot archive themselves');
    t.equal(res.payload.indexOf('User Type'), -1, 'primary user cannot edit their user type');
    t.ok(res.payload.indexOf('First Name') > -1, 'primary user can view/edit their first name');
    t.ok(res.payload.indexOf('Phone Number') > -1, 'primary user can view/edit their phone number');
    t.ok(res.payload.indexOf('Email') > -1, 'primary user can view/edit their email');
    t.end();
  });
});

tape('primary user can edit their profile', t => {
  var user = people[2];

  var postOptions = {
    method: `POST`,
    url: `/people/${user.id}/edit`,
    payload: payloads.primaryEdit,
    headers: { cookie: `token=${primary_token}` }
  };

  var getPrimaryEditView = {
    method: `GET`,
    url: `/people/${user.id}/edit`,
    headers: { cookie: `token=${primary_token}` }
  };

  server.inject(postOptions, res => {
    t.equal(res.statusCode, 302, 'user is redirected');
    t.equal(res.headers.location, `/orgs/${user.organisation_id}`);
    server.inject(getPrimaryEditView, res => {
      t.ok(res.payload.indexOf(payloads.primaryEdit.phone) > -1, 'Users phone number has been updated');
      t.end();
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
