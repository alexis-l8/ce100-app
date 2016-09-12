const bcrypt = require('bcrypt');
const Boom = require('boom');
const Iron = require('iron');
const sendEmail = require('./email.js');
const jwt = require('jsonwebtoken');
const Hoek = require('hoek');

var handlers = {};

handlers.serveView = (viewName) => (request, reply) => {
  reply.view(viewName);
};

handlers.serveFile = (request, reply) => {
  reply.file(request.params.path);
};

handlers.activatePrimaryUser = (request, reply) => {
  const hashedId = request.params.hashedId;
  Iron.unseal(hashedId, process.env.COOKIE_PASSWORD, Iron.defaults, (error, userId) => {
    Hoek.assert(!error, 'Iron error');
    // hash password
    bcrypt.hash(request.payload.password, 13, function (error, hashedPassword) {
      Hoek.assert(!error, 'bcrypt error');
      request.redis.LINDEX('people', userId, (error, user) => {
        Hoek.assert(!error, 'redis error');
        const updatedUser = addPasswordToUser(hashedPassword, user);
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
//   const userId = request.params.id;
//   request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
//     if (error) console.log(error);
//     // catch for case where user at specified userId doesn't exist.
//     const user = JSON.parse(stringifiedUser);
//     if (user.user_type === 'admin') {
//       reply.view('people/details', user);
//     } else {
//       request.redis.LINDEX('organisations', user.organisation_id, (error, stringifiedOrg) => {
//         if (error) console.log(error);
//         const {name, mission_statement} = JSON.parse(stringifiedOrg);
//         const userDetails = Object.assign({name, mission_statement}, user);
//         reply.view('people/details', userDetails);
//       });
//     }
//   });
// };


handlers.editUserView = (request, reply) => {
  const userId = request.params.id;
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
  const userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    var user = JSON.parse(stringifiedUser);
    var updatedUser = Object.assign({}, user, request.payload);
    // update user
    request.redis.LSET('people', userId, JSON.stringify(updatedUser), (error, response) => {
      Hoek.assert(!error, 'redis error');
      // check if organisation has changed => update organisation as well
      if (request.payload.organisation_id === user.organisation_id) {
        return reply.redirect(`/orgs/${user.organisation_id}`);
      }
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
  const payload = request.payload;
  const redis = request.redis;
  redis.LLEN('people', (error, length) => {
    Hoek.assert(!error, 'redis error');
    const userUpdated = initialiseEntry(length, payload);
    redis.RPUSH('people', userUpdated, (error, numberOfUsers) => {
      Hoek.assert(!error, 'redis error');
      const orgId = payload.organisation_id;
      redis.LINDEX('organisations', orgId, (error, org) => {
        Hoek.assert(!error, 'redis error');
        const orgUpdated = addPrimaryToOrg(userUpdated, org);
        redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
          Hoek.assert(!error, 'redis error');
          Iron.seal(length, process.env.COOKIE_PASSWORD, Iron.defaults, (error, hashed) => {
            Hoek.assert(!error, 'Iron error');
            const newUser = Object.assign({}, payload, {
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
  const redis = request.redis;
  redis.LLEN('organisations', (error, length) => {
    Hoek.assert(!error, 'redis error');
    var initialOrgInfo = { name: request.payload.name, mission_statement: '', people: [] };
    const orgUpdated = initialiseEntry(length, initialOrgInfo);
    redis.RPUSH('organisations', orgUpdated, (error, numberOfOrgs) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect('/orgs');
    });
  });
};

handlers.viewAllOrganisations = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'redis error');
    const organisations = {
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

handlers.viewOrganisationDetails = (request, reply) => {
  const userId = request.params.id;
  request.redis.LINDEX('organisations', userId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    // TODO: catch for case where org at specified userId doesn't exist.
    const organisation = JSON.parse(stringifiedOrg);
    if (!organisation.primary_id) {
      return reply.view('organisations/details', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      const {first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
      const organisationDetails = Object.assign({first_name, last_name, email, phone, job}, organisation);
      reply.view('organisations/details', organisationDetails);
    });
  });
};

handlers.editOrganisationDetails = (request, reply) => {
  const orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    const organisation = JSON.parse(stringifiedOrg);
    if (!organisation.primary_id) {
      return reply.view('organisations/edit', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      const {first_name, last_name, id} = JSON.parse(stringifiedPrimaryUser);
      const organisationDetails = Object.assign({}, organisation, {
        primary_user_name: `${first_name} ${last_name}`,
        primary_user_id: id
      });
      reply.view('organisations/edit', organisationDetails);
    });
  });
};

handlers.submitEditOrg = (request, reply) => {
  const orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedOrg, 'Organisation does not exist');
    // if (!stringifiedOrg) return reply(Boom.notFound('Organisation does not exist'));
    const oldOrg = JSON.parse(stringifiedOrg);
    const orgUpdated = Object.assign({}, oldOrg, request.payload);
    request.redis.LSET('organisations', orgId, JSON.stringify(orgUpdated), (error, response) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect(`/orgs/${orgId}`);
    });
  });
};

handlers.toggleArchiveOrg = (request, reply) => {
  const orgId = request.params.id;
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
  const redis = request.redis;
  const email = request.payload.email;
  const password = request.payload.password;
  redis.LRANGE('people', 0, -1, (error, allUsers) => {
    Hoek.assert(!error, 'redis error');
    const user = allUsers.filter(eachUser => JSON.parse(eachUser).email === email);
    if (user.length === 0) {
      return reply(Boom.unauthorized('Sorry, that email has not been registered.'));
    }
    const userDetails = JSON.parse(user[0]);
    bcrypt.compare(password, userDetails.password, function (error, isValid) {
      Hoek.assert(!error, 'bcrypt failure');
      if (!isValid) {
        return reply(Boom.unauthorized('Sorry, that password is invalid, please try again.'));
      }
      userDetails.last_login = Date.now();
      redis.LSET('people', userDetails.id, JSON.stringify(userDetails), (error, response) => {
        Hoek.assert(!error, 'redis error');
        var token = jwt.sign({userId: userDetails.id}, process.env.JWT_SECRET);
        reply.redirect('/orgs').state('token', token);
      });
    });
  });
};

module.exports = handlers;

function orgsDropdown (stringifiedOrgs) {
  var orgsArray = stringifiedOrgs.map(org => {
    const details = JSON.parse(org);
    return {value: details.id, display: details.name};
  });
  return { allOrganisations: orgsArray };
}

function userTypeRadios () {
  const userTypes = ['admin', 'primary'];
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
  const additionalInfo = {
    id: length,
    active: true
  };
  const updatedUser = Object.assign(additionalInfo, payload);
  return JSON.stringify(updatedUser);
}

function addPrimaryToOrg (user, org) {
  const id = JSON.parse(user).id;
  const orgOld = JSON.parse(org);
  const additionalInfo = {
    primary_id: id,
    people: orgOld.people.push(id)
  };
  const orgUpdated = Object.assign(additionalInfo, orgOld);
  return JSON.stringify(orgUpdated);
}

function addPasswordToUser (hashed, user) {
  const userOld = JSON.parse(user);
  const newDetails = {
    password: hashed,
    last_login: Date.now()
  };
  const updatedUser = Object.assign(newDetails, userOld);
  return JSON.stringify(updatedUser);
}
