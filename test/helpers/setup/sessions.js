var aguid = require('aguid');

module.exports = {
  sessions: [
    {
      userId: 0, // admin user
      jti: aguid(),   // random UUID
      iat: Date.now()
    },
    {
      userId: 0, // admin user
      jti: aguid(),   // random UUID
      iat: Date.now() - 10000
    },
    {
      userId: 2, // admin user
      jti: aguid(),   // random UUID
      iat: Date.now()
    },
    {
      userId: 3,
      jti: aguid(),   // random UUID
      iat: Date.now(),
      exp: Date.now() // this session has EXPIRED (auth test)
    },
    {
      userId: Math.ceil(Math.random() * 10000000), // non-existent user for auth test
      jti: aguid(),   // random UUID
      iat: Date.now()
    }
  ]
};
