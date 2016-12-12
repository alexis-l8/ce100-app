var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');


function addTagsToOrg (user, orgId, tags) {
  return {
    method: 'POST',
    url: '/orgs/' + orgId + '/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] },
    payload: { tags: tags }
  };
}

var getOrgDetails = {
  url: '/orgs/1',
  headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['primary_3'] }
};


tape('primary user cannot add tags to a different org: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToOrg('primary_3', 2, '1'), function (res) {
        t.equal(res.statusCode, 401, 'a primary cannot add tags to an org which is not theirs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});



tape('primary user can add zero tags to their org and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToOrg('primary_3', 1, undefined), function (res) {
        t.equal(res.statusCode, 302, 'a primary is redirected');

        server.inject(getOrgDetails, function (res) {

          t.equal(res.payload.indexOf('UK'), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf('Global Partner'), -1, 'Old tag with was succesfuly removed');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});



tape('primary user can add a single tag to their org and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToOrg('primary_3', 1, '5'), function (res) {
        t.equal(res.statusCode, 302, 'a primary can add tags to their own org');

        server.inject(getOrgDetails, function (res) {

          t.ok(res.payload.indexOf('Emerging Innovator') > -1, 'Tag with id 5 was succesfuly added');
          t.equal(res.payload.indexOf('UK'), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf('Global Partner'), -1, 'Old tag with was succesfuly removed');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});
