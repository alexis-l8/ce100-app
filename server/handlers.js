const bcrypt = require('bcrypt');
const Boom = require('boom');
const Iron = require('iron');
const jwt = require('jsonwebtoken');
const Hoek = require('hoek');

var handlers = {};

handlers.serveView = (viewName) => (request, reply) => {
  reply.view(viewName);
};

handlers.viewAllOrganisations = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'db error');
    const organisations = {allOrganisations: stringifiedOrgs.map(element => JSON.parse(element))};
    reply.view('organisations/view', organisations);
  });
};

handlers.viewOrganisationDetails = (request, reply) => {
  const userId = request.params.id;
  request.redis.LINDEX('organisations', userId, (error, stringifiedOrg) => {
    Hoek.assert(!error, "uesrId doesn't exist");
    // catch for case where org at specified userId doesn't exist.
    const organisation = JSON.parse(stringifiedOrg);
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var u = JSON.parse(stringifiedPrimaryUser);
      var user = {
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.last_name
      };
      var organisationDetails = Object.assign(user, organisation);
      reply.view('organisations/details', organisationDetails);
    });
  });
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
    const allUsers = {allUsers: stringifiedUsers.map(element => JSON.parse(element))};
    reply.view('people/view', allUsers);
  });
};

handlers.viewUserDetails = (request, reply) => {
  const userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    // catch for case where user at specified userId doesn't exist.
    const user = JSON.parse(stringifiedUser);
    request.redis.LINDEX('organisations', user.organisation_id, (error, stringifiedOrg) => {
      Hoek.assert(!error, 'redis error');
      var u = JSON.parse(stringifiedOrg);
      var userDetails = Object.assign({
        name: u.name,
        mission_statement: u.mission_statement
      }, user);
      reply.view('people/details', userDetails);
    });
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
          reply.redirect(`/people/${length}`);
        });
      });
    });
  });
};

handlers.createNewOrganisation = (request, reply) => {
  const redis = request.redis;
  redis.LLEN('organisations', (error, length) => {
    Hoek.assert(!error, 'redis error');
    const orgUpdated = initialiseEntry(length, { name: request.payload.name, mission_statement: '', people: [] });
    redis.RPUSH('organisations', orgUpdated, (error, numberOfOrgs) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect(`/orgs/${length}`);
    });
  });
};

handlers.login = (request, reply) => {
  const redis = request.redis;
  const email = request.payload.email;
  const password = request.payload.password;
  redis.LRANGE('people', 0, -1, (error, allUsers) => {
    Hoek.assert(!error, 'redis error');
    const user = allUsers.filter(eachUser => {
      return JSON.parse(eachUser).email === email;
    });
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
