require('env2')('.env');
var url = require('url');

module.exports = function (dbUrl) {
  var params = url.parse(dbUrl);
  var auth = params.auth.split(':');
  return {
    port: process.env.PORT || 3000,
    pg: {
      user: auth[0],
      password: auth[1],
      database: params.pathname.split('/')[1],
      host: params.hostname,
      port: params.port,
      max: 10,
      idleTimeoutMillis: 30000
    }
  };
};
