var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);

// TODO: move payloads into payloads

var editUserNoChangePassword = {
  first_name: 'Sally',
  last_name: 'Robbins',
  job_title: 'Athlete',
  email: 'sa@ro.co',
  phone: '02088884444',
  old_password: '',
  new_password: '',
  confirm_new_password: ''
};

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// test a primary user editing their settings

tape('primary user cannot GET or POST to edit user for different user', t => {
  var getOptions = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${primary_token}` }
  };
  var postOptions = {
    method: 'POST',
    url: '/people/3/edit',
    payload: editUserNoChangePassword,
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

tape('primary user can view their own edit profile view', t => {
  var user = setupData.initialPeople[2];
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
    t.ok(res.payload.indexOf('Old Password') > -1, 'primary user can change their password');
    t.ok(res.payload.indexOf('New Password') > -1, 'primary user can change their password');
    t.ok(res.payload.indexOf('Confirm New Password'), -1, 'primary user can change their password');
    t.end();
  });
});

tape('primary user can edit their profile without changing their password', t => {
  var user = setupData.initialPeople[2];

  var postOptions = {
    method: `POST`,
    url: `/people/${user.id}/edit`,
    payload: editUserNoChangePassword,
    headers: { cookie: `token=${primary_token}` }
  };

  var getPrimaryEditView = {
    method: `GET`,
    url: `/people/${user.id}/edit`,
    headers: { cookie: `token=${primary_token}` }
  };

  server.inject(postOptions, res => {
    t.equal(res.statusCode, 302, 'user is redirected');
    t.equal(res.headers.location, `/people/${user.id}/edit`);
    server.inject(getPrimaryEditView, res => {
      t.ok(res.payload.indexOf(editUserNoChangePassword.phone) > -1, 'Users phone number has been updated');
      t.end();
    });
  });
});

// TODO: uncomment test once functionality is written
// edit user change password
tape('primary user can change their password', t => {
  var user = setupData.initialPeople[2];

  var changePassword = {
    first_name: 'Sally',
    last_name: 'Robbins',
    job_title: 'Athlete',
    email: 'sa@ro.co',
    phone: '07111111111',
    old_password: 'Hello1',
    new_password: 'BeboBe2',
    confirm_new_password: 'BeboBe2'
  };

  var editPassword = {
    method: `POST`,
    url: `/people/${user.id}/edit`,
    payload: changePassword,
    headers: { cookie: `token=${primary_token}` }
  };

  var loginNewCredentials = {
    method: `POST`,
    url: `/people/${user.id}/edit`,
    payload: { email: 'sa@ro.co', password: 'BeboBe2' }
  };

  server.inject(editPassword, res1 => {
    server.inject(loginNewCredentials, res2 => {
      // console.log(res2.headers);
      // check message to user ???
      // t.ok(res2.headers['set-cookie'], 'user has changed password');
      t.end();
    });
  });
});

// edit user change password
// tape('primary user can change their password', t => {
//   var user = setupData.initialPeople[2];
//
//   var base = {
//     first_name: 'Sally',
//     last_name: 'Robbins',
//     job_title: 'Athlete',
//     email: 'sa@ro.co',
//     phone: '07111111111',
//   };
//   var incorrectOldPassword = {
//     old_password: 'Hello2',
//     new_password: 'BeboBe2',
//     confirm_new_password: 'BeboBe2'
//   };
//   var unmatchingNewPasswords = {
//     old_password: 'Hello1',
//     new_password: 'BeboBe2',
//     confirm_new_password: 'BeboBe1'
//   };
//   var shortNewPasswords = {
//     old_password: 'Hello1',
//     new_password: 'Bebo',
//     confirm_new_password: 'Bebo'
//   };
//   var editPassword = () => ({
//     method: `POST`,
//     url: `/people/${user.id}/edit`,
//     payload: changePasswordIncorrect,
//     headers: { cookie: `token=${primary_token}` }
//   });
//
//   var loginNewCredentials = {
//     method: `POST`,
//     url: `/people/${user.id}/edit`,
//     payload: { email: 'sa@ro.co', password: 'BeboBe2' }
//   };
//
//   server.inject(editPassword, res1 => {
//     server.inject(loginNewCredentials, res2 => {
//       // console.log(res2.headers);
//       // t.ok(res2.headers['set-cookie'], 'user has changed password');
//       t.end();
//     });
//   });
// });

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
