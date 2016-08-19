require('env2')('config.env');

const bcrypt = require('bcrypt');
const Boom = require('boom');
const Hashids = require('hashids');
const hash = new Hashids(process.env.HASHID_KEY);

const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.serveActivate = (request, reply) => {
  reply.view(request.params.action);
};

handlers.activateUser = (request, reply) => {
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
          reply('hash failed');
        } else {
          const newDetails = {
            password: hashedPassword,
            last_login: Date.now()
          };
          const updatedUser = Object.assign(newDetails, JSON.parse(user));
          request.redis.LSET('people', updatedUser.id, JSON.stringify(updatedUser), (err, response) => {
            if (err) {
              console.log(err);
              reply('redis-failure');
            } else {
              const cookieConfig = {
                ttl: 7 * 24 * 60 * 60 * 1000,
                isSecure: false,
                path: '/'
              };
              reply('OK').state('CEsession', hashedId, cookieConfig); // view dashboard and set new cookie
            }
          });
        }
      });
    }
  });
// unhash id
// check and update user
// reply view home and set cookie
};

handlers.createNewPrimaryUser = (request, reply) => {
  const payload = request.payload;
  request.redis.LLEN('people', (error, length) => {
    if (error) {
      console.log(error);
      reply('redis-failure');
    } else {
      const additionalInfo = {
        id: length,
        active: true
      };
      const newUser = Object.assign(additionalInfo, payload);
      request.redis.RPUSH('people', JSON.stringify(newUser), (error, people) => {
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
              console.log('org redis', org);
              const orgOld = JSON.parse(org);
              const orgUpdated =
                Object.assign({
                  primary_id: newUser.id,
                  people: orgOld.people ? orgOld.people.push(newUser.id) : [newUser.id]
                }, orgOld);
              request.redis.LSET('organisations', orgId, JSON.stringify(orgUpdated), (error, response) => {
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
            const cookieConfig = {
              ttl: 7 * 24 * 60 * 60 * 1000,
              isSecure: false,
              path: '/'
            };
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
