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

function selectedTag (id) {
  return '<a href="/challenges?tags=' + id + '">';
}

var getOrgDetails = {
  url: '/orgs/1',
  headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['primary_3'] }
};

tape('primary user cannot add tags to a different org: --> ' + __filename, function (t) { // eslint-disable-line
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToOrg('primary_3', 2, '1'), function (res) {
        t.equal(
          res.statusCode,
          302,
          'a primary cannot add tags to an org which is not theirs'
        );

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

tape('primary user can add zero tags to their org and remove old tags: --> ' + __filename, function (t) { // eslint-disable-line
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToOrg('primary_3', 1, undefined), function (res) {
        t.equal(res.statusCode, 302, 'a primary is redirected');

        server.inject(getOrgDetails, function (res) {
          // tag_id = 27, tag_name = Global Partner
          // tag_id = 1, tag_name = UK
          t.equal(res.payload.indexOf(selectedTag(1)), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf(selectedTag(27)), -1, 'Old tag with was succesfuly removed');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('primary user can add a single tag to their org and remove old tags: --> ' + __filename, function (t) { // eslint-disable-line
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToOrg('primary_3', 1, '5'), function (res) {
        t.equal(res.statusCode, 302, 'a primary can add tags to their own org');

        server.inject(getOrgDetails, function (res) {
          t.ok(res.payload.indexOf(selectedTag(5)) > -1, 'Tag with id 5 was succesfuly added');
          t.equal(res.payload.indexOf(selectedTag(27)), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf(selectedTag(1)), -1, 'Old tag with was succesfuly removed');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('primary user can add multiple tags to their org and remove old tags: --> ' + __filename, function (t) { // eslint-disable-line
  sessions.addAll(function () {
    var orgId = 1;
    var tagsArray = ['5', '16', '49', '105', '85'];
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToOrg('primary_3', orgId, tagsArray), function (res) {
        t.equal(
          res.statusCode,
          302,
          'a primary can add multiple tags to their own org and is redirected'
        );
        t.equal(
          res.headers.location,
          '/orgs/' + orgId,
          'primary user is redirected correctly'
        );
        server.inject(getOrgDetails, function (res) {
          // check the new tag was added
          tagsArray.forEach(function (tag, index) {
            t.ok(res.payload.indexOf(selectedTag(tag)) > -1, 'Tag was succesfuly added');
            if (index === tagsArray.length - 1) {
              // check the old tags were removed
              t.equal(res.payload.indexOf(selectedTag(1)), -1, 'Old tag with was succesfuly removed');
              t.equal(res.payload.indexOf(selectedTag(27)), -1, 'Old tag with was succesfuly removed');
              t.end();
              pool.end();
              server.stop();
            }
          });
        });
      });
    });
  });
});

tape('primary user cannot add more than 10 tags to their org, and error message is flagged: --> ' + __filename, function (t) { // eslint-disable-line
  sessions.addAll(function () {
    var orgId = 1;
    var tagsArray = ['5', '16', '18', '22', '32', '33', '49', '85', '105', '111', '112', '115'];
    var expectedError = 'tags a maximum of 10 tags can be chosen';

    initServer(config, function (error, server, pool) {
      server.inject(addTagsToOrg('primary_3', orgId, tagsArray), function (res) {
        t.equal(res.statusCode, 401, 'a primary cannot add more than 10 tags to their own org');
        // check error message displays correctly
        t.ok(res.payload.indexOf(expectedError) > -1, 'Error message correctly displayed');
        // check the old tags are still displaying
        server.inject(getOrgDetails, function (res) {
          // check that no tags from `tagsArray` have been selected
          tagsArray.forEach(function (tag, index) {
            t.equal(res.payload.indexOf(selectedTag(tag)), -1, 'Tag specified was not added');
            if (index === tagsArray.length - 1) {
              t.ok(res.payload.indexOf(selectedTag(1)) > -1, 'Old tag still correctly displayed');
              t.ok(res.payload.indexOf(selectedTag(27)) > -1, 'Old tag still correctly displayed');
              t.end();
              pool.end();
              server.stop();
            }
          });
        });
      });
    });
  });
});
