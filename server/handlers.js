const bcrypt = require('bcrypt');
const Boom = require('boom');
require('env2')('config.env');
const Hashids = require('hashids');
const hash = new Hashids(process.env.HASHID_KEY);

const handlers = {};

const cookieConfig = {
  ttl: 7 * 24 * 60 * 60 * 1000,
  isSecure: false,
  path: '/'
};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.serveActivate = (request, reply) => {
  reply.view(request.params.action);
};

handlers.activateUser = (request, reply) => {
  const hashedId = request.params.hashedId; // currently not hashed
  const userId = request.params.hashedId; // hash.decode(request.params.hashedId);
  const redis = request.redis;
  // hash password
  bcrypt.hash(request.payload.password, 10, function (error, hashedPassword) {
    if (error) {
      console.log(error);
      reply('hash failed');
    } else {
      redis.LINDEX('people', userId, (error, user) => {
        if (error) {
          console.log(error);
          reply('redis-failure');
        } else {
          const updatedUser = addPasswordToUser(hashedPassword)(user);
          redis.LSET('people', userId, updatedUser, (err, response) => {
            if (err) {
              console.log(err);
              reply('redis-failure');
            } else {
              reply('OK').state('CEsession', hashedId, cookieConfig); // view dashboard and set new cookie
            }
          });
        }
      });
    }
  });
};

handlers.createNewPrimaryUser = (request, reply) => {
  const redis = request.redis;
  const payload = request.payload;
  redis.LLEN('people', (error, length) => {
    if (error) {
      console.log(error);
      reply('redis-failure');
    } else {
      const userUpdated = initialiseNewUser(length)(payload);
      redis.RPUSH('people', userUpdated, (error, people) => {
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
              const orgUpdated = addPrimaryToOrg(userUpdated)(org);
              redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
                if (error) {
                  console.log('ERROR', error);
                  reply('redis-failure');
                } else {
                  reply('success');
                }
              });
            }
          });
        }
      });
    }
  });
};

handlers.login = (request, reply) => {

};

module.exports = handlers;

const initialiseNewUser = length => payload => {
  const additionalInfo = {
    id: length,
    active: true
  };
  const updatedUser = Object.assign(additionalInfo, payload);
  return JSON.stringify(updatedUser);
};

const addPrimaryToOrg = user => org => {
  const id = JSON.parse(user).id;
  console.log('id should not be jnull', id);
  const orgOld = JSON.parse(org);
  const additionalInfo = {
    primary_id: id,
    people: orgOld.people.push(id)
  };
  const orgUpdated = Object.assign(additionalInfo, orgOld);
  return JSON.stringify(orgUpdated);
};

const addPasswordToUser = hashed => user => {
  const userOld = JSON.parse(user);
  const newDetails = {
    password: hashed,
    last_login: Date.now()
  };
  const updatedUser = Object.assign(newDetails, userOld);
  return JSON.stringify(updatedUser);
};
