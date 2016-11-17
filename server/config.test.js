require('env2')('.env');
var url = require('url');

var params = url.parse(process.env.DATABASE_URL_TEST);
var auth = params.auth.split(':');

module.exports = {
  port: process.env.PORT || 3000,
  pg: {
    user: auth[0],
    password: auth[1],
    database: params.pathname.split('/')[1],
    host: params.hostname,
    port: params.port,
    max: 10,
    idleTimeoutMillis: 1
  }
};
