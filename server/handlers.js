var bcrypt = require('bcrypt');
var Boom = require('boom');
var Iron = require('iron');
var sendEmail = require('./email.js');
var jwt = require('jsonwebtoken');
var Hoek = require('hoek');
var aguid = require('aguid');
var handlers = {};

handlers.serveView = (viewName) => (request, reply) => reply.view(viewName);

// what does this do and why isn't it tested?
// handlers.serveFile = (request, reply) => reply.file(request.params.path);

handlers.activatePrimaryUser = (request, reply) => {
  var hashedId = request.params.hashedId;
  Iron.unseal(hashedId, process.env.COOKIE_PASSWORD, Iron.defaults, (error, userId) => {
    Hoek.assert(!error, 'Iron error');
    // hash password
    bcrypt.hash(request.payload.password, 13, function (error, hashedPassword) {
      Hoek.assert(!error, 'bcrypt error');
      request.redis.LINDEX('people', userId, (error, user) => {
        Hoek.assert(!error, 'redis error');
        var updatedUser = addPasswordToUser(hashedPassword, user);
        request.redis.LSET('people', userId, updatedUser, (error, response) => {
          Hoek.assert(!error, 'redis error');
          var token = jwt.sign({userId: userId}, process.env.JWT_SECRET);
          reply.redirect('/').state('token', token);
        });
      });
    });
  });
};

handlers.viewAllUsers = (request, reply) => {
  request.redis.LRANGE('people', 0, -1, (error, stringifiedUsers) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
      Hoek.assert(!error, 'redis error');
      var organisations = stringifiedOrgs.map(element => JSON.parse(element));
      var users = stringifiedUsers.map(element => JSON.parse(element));
      // TODO: Pull out to helper function
      users.forEach((user, index) => {
        user.organisation_name = typeof user.organisation_id === 'number'
          ? organisations[user.organisation_id].name
          : false;
        if (index === users.length - 1) {
          var allUsers = {
            allUsers: users,
            alternate: [{
              path: '/people/add',
              name: '+'
            }, {
              path: '/orgs',
              name: 'Orgs'
            }]
          };
          reply.view('people/view', allUsers);
        }
      });
    });
  });
};

// this handler is not currently in use but it is likely to be included soon.
// handlers.viewUserDetails = (request, reply) => {
//   var userId = request.params.id;
//   request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
//     Hoek.assert(!error, error);
//     // catch for case where user at specified userId doesn't exist.
//     var user = JSON.parse(stringifiedUser);
//     if (user.user_type === 'admin') { // uncomment this when you add a Test for it!!
//       reply.view('people/details', user);
//     } else {
//       request.redis.LINDEX('organisations', user.organisation_id, (error, stringifiedOrg) => {
//         Hoek.assert(!error, error);
//         var {name, mission_statement} = JSON.parse(stringifiedOrg);
//         var userDetails = Object.assign({name, mission_statement}, user);
//         reply.view('people/details', userDetails);
//       });
//     }
//   });
// };

handlers.editUserView = (request, reply) => {
  var userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
      Hoek.assert(!error, 'redis error');
      // TODO: refactor into reusable helper functions.
      var allOrgs = orgsDropdown(stringifiedOrgs);
      var userObj = JSON.parse(stringifiedUser);
      var user = {
        user: userObj,
        organisation: allOrgs.allOrganisations[userObj.organisation_id]
      };
      var filteredOrgs = { allOrganisations: allOrgs.allOrganisations.filter(org => org.value !== userObj.organisation_id) };
      var userTypes = userTypeRadios();
      var userTypesWithDefault = setDefaultUserTypes(userTypes, userObj);
      var options = Object.assign({}, filteredOrgs, userTypesWithDefault, user);
      reply.view('people/edit', options);
    });
  });
};

handlers.editUserSubmit = (request, reply) => {
  var userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    var user = JSON.parse(stringifiedUser);
    var updatedUser = Object.assign({}, user, request.payload);
    // update user
    request.redis.LSET('people', userId, JSON.stringify(updatedUser), (error, response) => {
      Hoek.assert(!error, 'redis error');
      // check if organisation has changed => update organisation as well
      // if (request.payload.organisation_id === user.organisation_id) {
      //   return reply.redirect(`/orgs/${user.organisation_id}`);
      // }
      // TODO: UDATE OLD ORGANISATION DETAILS AND NEW ORGANISATION DETAILS IF THERE ARE ANY
      // ALSO NEED TO CHECK FOR ANY USERS THAT WERE ATTACHED TO THAT OLD ORGANISATION AND UPDATE THEM.
      // THERE IS ISSUE OPEN REGARDING WHAT ACTION SHOULD BE TAKEN
      return reply.redirect(`orgs/${user.organisation_id}`); // FOR DEMO PURPOSES DO NOT UPDATE ORGANISATION
    });
  });
};

handlers.createNewPrimaryUserForm = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'redis error');
    var options = Object.assign({}, orgsDropdown(stringifiedOrgs), userTypeRadios());
    reply.view('people/add', options);
  });
};

handlers.createNewPrimaryUser = (request, reply) => {
  var payload = request.payload;
  var redis = request.redis;
  redis.LLEN('people', (error, length) => {
    Hoek.assert(!error, 'redis error');
    var userUpdated = initialiseEntry(length, payload);
    redis.RPUSH('people', userUpdated, (error, numberOfUsers) => {
      Hoek.assert(!error, 'redis error');
      var orgId = payload.organisation_id;
      redis.LINDEX('organisations', orgId, (error, org) => {
        Hoek.assert(!error, 'redis error');
        var orgUpdated = addPrimaryToOrg(userUpdated, org);
        redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
          Hoek.assert(!error, 'redis error');
          Iron.seal(length, process.env.COOKIE_PASSWORD, Iron.defaults, (error, hashed) => {
            Hoek.assert(!error, 'Iron error');
            var newUser = Object.assign({}, payload, {
              organisation_name: JSON.parse(org).name,
              hashedId: hashed
            });
            sendEmail.newUser(newUser, (error, response) => {
              Hoek.assert(!error, 'Send Email error');
              reply({ userId: length }).redirect('/people');
            });
          });
        });
      });
    });
  });
};

handlers.createNewOrganisation = (request, reply) => {
  var redis = request.redis;
  redis.LLEN('organisations', (error, length) => {
    Hoek.assert(!error, 'redis error');
    var initialOrgInfo = { name: request.payload.name, mission_statement: '', people: [] };
    var orgUpdated = initialiseEntry(length, initialOrgInfo);
    redis.RPUSH('organisations', orgUpdated, (error, numberOfOrgs) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect('/orgs');
    });
  });
};

handlers.viewOrganisationDetails = (request, reply) => {
  var userId = request.params.id;
  request.redis.LINDEX('organisations', userId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    // TODO: catch for case where org at specified userId doesn't exist.
    var organisation = JSON.parse(stringifiedOrg);
    if (!organisation.primary_id) {
      return reply.view('organisations/details', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
      var organisationDetails = Object.assign({first_name, last_name, email, phone, job}, organisation);
      reply.view('organisations/details', organisationDetails);
    });
  });
};

handlers.viewAllOrganisations = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'redis error');
    var organisations = {
      allOrganisations: stringifiedOrgs.map(element => JSON.parse(element)),
      alternate: [{
        path: '/orgs/add',
        name: '+'
      }, {
        path: '/people',
        name: 'People'
      }]
    };
    reply.view('organisations/view', organisations);
  });
};

// please add a TEST for this handler then uncomment it
handlers.editOrganisationDetails = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    if (!organisation.primary_id) {
      return reply.view('organisations/edit', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, id} = JSON.parse(stringifiedPrimaryUser);
      var organisationDetails = Object.assign({}, organisation, {
        primary_user_name: `${first_name} ${last_name}`,
        primary_user_id: id
      });
      reply.view('organisations/edit', organisationDetails);
    });
  });
};

// please add a TEST for this handler then uncomment it
handlers.submitEditOrg = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedOrg, 'Organisation does not exist');
    var oldOrg = JSON.parse(stringifiedOrg);
    var orgUpdated = Object.assign({}, oldOrg, request.payload);
    request.redis.LSET('organisations', orgId, JSON.stringify(orgUpdated), (error, response) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect(`/orgs/${orgId}`);
    });
  });
};

// please add a TEST for this handler then uncomment it
handlers.toggleArchiveOrg = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedOrg, 'Organisation does not exist');
    request.redis.LSET('organisations', orgId, deactivate(stringifiedOrg), (error, response) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect('/orgs');
    });
  });
};

handlers.login = (request, reply) => {
  var redis = request.redis;
  var email = request.payload.email;
  var password = request.payload.password;
  redis.LRANGE('people', 0, -1, (error, allUsers) => {
    Hoek.assert(!error, 'redis error');
    var user = allUsers.filter(eachUser => JSON.parse(eachUser).email === email);
    if (user.length === 0) {
      return reply(Boom.unauthorized('Sorry, that email has not been registered.'));
    }
    var userDetails = JSON.parse(user[0]);
    bcrypt.compare(password, userDetails.password, function (error, isValid) {
      Hoek.assert(!error, 'bcrypt failure');
      if (!isValid) {
        return reply(Boom.unauthorized('Sorry, that password is invalid, please try again.'));
      }
      userDetails.last_login = Date.now();
      redis.LSET('people', userDetails.id, JSON.stringify(userDetails), (error, response) => {
        Hoek.assert(!error, 'redis error');
        var session = {
          userId: userDetails.id, // duh
          jti: aguid(),   // random UUID
          iat: Date.now() // session creation time (start)
        };
        redis.HSET('sessions', session.jti, JSON.stringify(session), (error, res) => {
          var token = jwt.sign(session, process.env.JWT_SECRET);
          reply.redirect('/orgs').state('token', token);
        });
      });
    });
  });
};

module.exports = handlers;

// please add a TEST for these methods then uncomment them
function orgsDropdown (stringifiedOrgs) {
  var orgsArray = stringifiedOrgs.map(org => {
    var details = JSON.parse(org);
    return {value: details.id, display: details.name};
  });
  return { allOrganisations: orgsArray };
}

function userTypeRadios () {
  var userTypes = ['admin', 'primary'];
  var userTypeArr = userTypes.map(user => {
    return {name: 'user_type', value: user, display: user};
  });
  return { userTypes: userTypeArr };
}

function setDefaultUserTypes (types, user) {
  var checked = { isChecked: 'checked' };
  var selectedTypes = types.userTypes.map(t => t.value === user.user_type
    ? Object.assign({}, t, checked) : t);
  return { userTypes: selectedTypes };
}

function deactivate (stringifiedData) {
  var data = JSON.parse(stringifiedData);
  var updated = Object.assign({}, data, { active: !data.active });
  return JSON.stringify(updated);
}

function initialiseEntry (length, payload) {
  var additionalInfo = {
    id: length,
    active: true
  };
  var updatedUser = Object.assign(additionalInfo, payload);
  return JSON.stringify(updatedUser);
}

function addPrimaryToOrg (user, org) {
  var id = JSON.parse(user).id;
  var orgOld = JSON.parse(org);
  var additionalInfo = {
    primary_id: id,
    people: orgOld.people.push(id)
  };
  var orgUpdated = Object.assign(additionalInfo, orgOld);
  return JSON.stringify(orgUpdated);
}

function addPasswordToUser (hashed, user) {
  var userOld = JSON.parse(user);
  var newDetails = {
    password: hashed,
    last_login: Date.now()
  };
  var updatedUser = Object.assign(newDetails, userOld);
  return JSON.stringify(updatedUser);
}
