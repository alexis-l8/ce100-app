require('env2')('config.env');

const bcrypt = require('bcrypt');
const Boom = require('boom');
const Hashids = require('hashids');
const hash = new Hashids(process.env.HASHID_KEY);

var handlers = {};

const cookieConfig = {
  ttl: 7 * 24 * 60 * 60 * 1000,
  isSecure: false,
  path: '/'
};

// sorry for bad name, maybe we can replace this with serveFile?
// gives us more control over route names i think.
handlers.serveSpecificFile = (viewName) => (request, reply) => {
  reply.view(viewName);
};

// not sure if this is used for anything else at the moment?
handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.activatePrimaryUser = (request, reply) => {
  const hashedId = request.params.hashedId; // currently not hashed
  const userId = request.params.hashedId; // hash.decode(request.params.hashedId);
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
              reply('OK').state('CEsession', hashedId, cookieConfig); // view dashboard and set new cookie
            }
          });
        }
      });
    }
  });
};

handlers.createNewPrimaryUser = (request, reply) => {
  const payload = request.payload;
  delete payload.submit;
  request.redis.LLEN('people', (error, length) => {
    if (error) {
      console.log(error);
      reply('redis-failure');
    } else {
      const userUpdated = initialiseNewUser(length, payload);
      request.redis.RPUSH('people', userUpdated, (error, people) => {
        if (error) {
          console.log('ERROR', error);
          reply('redis-failure');
        } else {
          const orgId = payload.organisation_id;
          request.redis.LINDEX('organisations', orgId, (error, org) => {
            if (error) {
              console.log('ERROR', error);
              reply('redis-failure');
            } else {
              const orgUpdated = addPrimaryToOrg(userUpdated, org);
              request.redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
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
  const email = request.payload.email;
  const password = request.payload.password;
  request.redis.LRANGE('people', 0, -1, (error, allUsers) => {
    if (error) {
      console.log('ERROR', error);
      reply('redis-failure');
    } else {
      const user = allUsers.filter((eachUser, index) => {
        return JSON.parse(eachUser).email === email;
      });
      const userDetails = JSON.parse(user);
      if (userDetails) {
        bcrypt.compare(password, userDetails.password, function (err, isValid) {
          if (!err && isValid) {
            // TODO: update last login
            reply('OK').state('CEsession', hash.encode(userDetails.id), cookieConfig); // view dashboard
          } else {
            reply(Boom.notFound('Sorry, that email or password is invalid, please try again.'));
          }
        });
      } else {
        reply(Boom.notFound('Sorry, that email has not been registered.'));
      }
    }
  });
};

module.exports = handlers;

function initialiseNewUser (length, payload) {
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
