const bcrypt = require('bcrypt');
const Boom = require('boom');
const Iron = require('iron');

var handlers = {};

handlers.serveView = viewName => (request, reply) => {
  reply.view(viewName);
};

handlers.serveFile = (request, reply) => {
  reply.file(request.params.path);
};


handlers.activatePrimaryUser = (request, reply) => {
  const hashedId = request.params.hashedId;
  Iron.unseal(hashedId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, userId) => {
    if (err) {
      console.log(err);
      return reply('hash failed');
    }
    // hash password
    bcrypt.hash(request.payload.password, 10, function (error, hashedPassword) {
      if (error) {
        console.log(error);
        reply('hash failed');
      } else {
        request.redis.LINDEX('people', userId, (error, user) => {
          if (error) {
            console.log(error);
            reply('redis-failure');
          } else {
            const updatedUser = addPasswordToUser(hashedPassword, user);
            request.redis.LSET('people', userId, updatedUser, (err, response) => {
              if (err) {
                console.log(err);
                reply('redis-failure');
              } else {
                request.cookieAuth.set({userId: userId});
                reply.redirect('/');
              }
            });
          }
        });
      }
    });
  });
};

handlers.viewAllUsers = (request, reply) => {
  request.redis.LRANGE('people', 0, -1, (error, stringifiedUsers) => {
    if (error) console.log(error);
    const allUsers = {allUsers: stringifiedUsers.map(element => JSON.parse(element))};
    reply.view('people/view', allUsers);
  });
};

handlers.viewUserDetails = (request, reply) => {
  const userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    if (error) console.log(error);
    // catch for case where user at specified userId doesn't exist.
    const user = JSON.parse(stringifiedUser);
    if (user.user_type === 'admin') {
      reply.view('people/details', user);
    } else {
      request.redis.LINDEX('organisations', user.organisation_id, (error, stringifiedOrg) => {
        if (error) console.log(error);
        const {name, mission_statement} = JSON.parse(stringifiedOrg);
        const userDetails = Object.assign({name, mission_statement}, user);
        reply.view('people/details', userDetails);
      });
    }
  });
};

handlers.createNewPrimaryUserForm = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    if (error) {
      console.log(error);
      reply(Boom.badImplementation('redis-failure'));
    } else {
      const userTypes = ['admin', 'primary'];
      const allOrganisations = {
        allOrganisations: stringifiedOrgs.map(org => {
          const details = JSON.parse(org);
          return {value: details.id, display: details.name};
        }),
        userTypes: userTypes.map(user => {
          return {name: 'user_type', value: user, display: user};
        })
      };
      reply.view('people/add', allOrganisations);
    }
  });
};

handlers.createNewPrimaryUser = (request, reply) => {
  const payload = request.payload;
  console.log(payload);
  const redis = request.redis;
  redis.LLEN('people', (error, length) => {
    if (error) {
      console.log(error);
      reply('redis-failure');
    } else {
      const userUpdated = initialiseEntry(length, payload);
      redis.RPUSH('people', userUpdated, (error, numberOfUsers) => {
        if (error) {
          console.log('ERROR', error);
          reply('redis-failure');
        } else {
          const orgId = payload.organisation_id;
          redis.LINDEX('organisations', orgId, (error, org) => {
            if (error) {
              console.log('ERROR', error);
              reply('redis-failure');
            } else {
              const orgUpdated = addPrimaryToOrg(userUpdated, org);
              redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
                if (error) {
                  console.log('ERROR', error);
                  reply('redis-failure');
                } else {
                  reply.redirect(`/people/${length}`);
                }
              });
            }
          });
        }
      });
    }
  });
};

handlers.createNewOrganisation = (request, reply) => {
  const redis = request.redis;
  redis.LLEN('organisations', (error, length) => {
    if (error) {
      console.log(error);
      reply(Boom.badImplementation('redis-failure'));
    } else {
      const orgUpdated = initialiseEntry(length, { name: request.payload.name, mission_statement: '', people: [] });
      redis.RPUSH('organisations', orgUpdated, (error, numberOfOrgs) => {
        if (error) {
          reply(Boom.badImplementation('redis-failure'));
        } else {
          reply.redirect(`/orgs/${length}`);
        }
      });
    }
  });
};

handlers.viewAllOrganisations = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    if (error) console.log(error);
    const organisations = {allOrganisations: stringifiedOrgs.map(element => JSON.parse(element))};
    reply.view('organisations/view', organisations);
  });
};

handlers.viewOrganisationDetails = (request, reply) => {
  const userId = request.params.id;
  request.redis.LINDEX('organisations', userId, (error, stringifiedOrg) => {
    if (error) console.log(error);
    // catch for case where org at specified userId doesn't exist.
    const organisation = JSON.parse(stringifiedOrg);
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      if (error) console.log(error);
      const {first_name, last_name, email} = JSON.parse(stringifiedPrimaryUser);
      const organisationDetails = Object.assign({first_name, last_name, email}, organisation);
      reply.view('organisations/details', organisationDetails);
    });
  });
};

handlers.editOrganisationDetails = (request, reply) => {
  const orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    if (error) {
      console.log(error);
      return reply(error);
    }
    const organisation = JSON.parse(stringifiedOrg);
    reply.view('organisations/edit', organisation);
  });
};

handlers.login = (request, reply) => {
  const redis = request.redis;
  const email = request.payload.email;
  const password = request.payload.password;
  redis.LRANGE('people', 0, -1, (error, allUsers) => {
    if (error) {
      console.log('ERROR', error);
      reply('redis-failure');
    } else {
      const user = allUsers.filter(eachUser => {
        return JSON.parse(eachUser).email === email;
      });
      if (user.length > 0) {
        const userDetails = JSON.parse(user[0]);
        bcrypt.compare(password, userDetails.password, function (err, isValid) {
          if (!err && isValid) {
            userDetails.last_login = Date.now();
            redis.LSET('people', userDetails.id, JSON.stringify(userDetails), (error, response) => {
              if (error) {
                console.log('ERROR', error);
                reply(Boom.badImplementation('redis-failure'));
              } else {
                request.cookieAuth.set({userId: userDetails.id});
                reply.redirect('/');
              }
            });
          } else {
            reply(Boom.unauthorized('Sorry, that email or password is invalid, please try again.'));
          }
        });
      } else {
        reply(Boom.unauthorized('Sorry, that email has not been registered.'));
      }
    }
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
