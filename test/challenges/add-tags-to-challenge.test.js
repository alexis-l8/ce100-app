var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');

function addTagsToChal (chalId, tags) {
  return {
    method: 'POST',
    url: '/challenges/' + chalId + '/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['primary_3'] },
    payload: { tags: tags }
  };
}

function getChalDetails (id) {
  return {
    method: 'GET',
    url: '/challenges/' + id + '/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['primary_3'] }
  };
}

function selectedTag (id) {
  return 'name="tags" value=' + id + ' checked="checked">';
}

tape('primary user cannot add tags to a different organisations challenge: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToChal(4, '1'), function (res) {
        t.equal(res.statusCode, 401, 'a primary cannot add tags to an org which is not theirs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

tape('primary user can add zero tags to their challenge and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToChal(2, undefined), function (res) {
        t.equal(res.statusCode, 302, 'a primary is redirected');
        server.inject(getChalDetails(2), function (res) {
          // check that this tag is removed:     "challenges_id": 2, "tags_id": 2,   "name": "Corporate",
          t.equal(res.payload.indexOf(selectedTag(2)), -1, 'Old tag with was succesfuly removed');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('primary user can add a single tag to their challenge and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      var cid = 3;
      var newTag = '5';

      server.inject(addTagsToChal(cid, newTag), function (res) {
        t.equal(res.statusCode, 302, 'a primary can add a single tag to their own challenge');
        server.inject(getChalDetails(cid), function (res) {
          // check the new tag was added
          t.ok(res.payload.indexOf(selectedTag(newTag)) > -1, 'Tag with id 5 was succesfuly added');
          // check the following old tags were removed
          // "challenges_id": 49, "tags_id": 49,   "name": "Waste To Energy",
          // "challenges_id": 105, "tags_id": 105,   "name": "Buildings Design",
          // "challenges_id": 85, "tags_id": 85,   "name": "Fertiliser",
          t.equal(res.payload.indexOf(selectedTag(49)), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf(selectedTag(105)), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf(selectedTag(85)), -1, 'Old tag with was succesfuly removed');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('primary user can add multiple tags to their challenge and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    var cid = 3;
    var tagsArray = ['5', '16', '49', '105', '85'];
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToChal(cid, tagsArray), function (res) {
        t.equal(res.statusCode, 302, 'a primary can add multiple tags to their own challenge');
        server.inject(getChalDetails(cid), function (res) {
          // check the new tag was added
          t.ok(res.payload.indexOf(selectedTag(5)) > -1, 'Tag with id 5 was succesfuly added');
          t.ok(res.payload.indexOf(selectedTag(16)) > -1, 'Tag with id 16 was succesfuly added');
          t.ok(res.payload.indexOf(selectedTag(49)) > -1, 'Tag with id 49 was succesfuly added');
          t.ok(res.payload.indexOf(selectedTag(105)) > -1, 'Tag with id 105 was succesfuly added');
          t.ok(res.payload.indexOf(selectedTag(85)) > -1, 'Tag with id 85 was succesfuly added');
          // check the old tags were removed
          t.equal(res.payload.indexOf(selectedTag(2)), -1, 'Old tag with was succesfuly removed');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('primary user cannot add more than 10 tags to their challenge, and error message is flagged: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    var cid = 2;
    var tagsArray = ['5', '16', '18', '22', '32', '33', '49', '85', '105', '111', '112', '115'];
    var fewerTags = ['3', '8', '68'];
    var expectedError = 'tags a maximum of 10 tags can be chosen';
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToChal(cid, tagsArray), function (res) {
        t.equal(res.statusCode, 401, 'a primary cannot add more than 10 tags to their own challenge');
        // check error message displays correctly
        t.ok(res.payload.indexOf(expectedError) > -1, 'Error message correctly displayed');
        // check the old tag still exists
        t.ok(res.payload.indexOf(selectedTag(2)) > -1, 'Old tag still existed');
        server.inject(getChalDetails(cid), function (res) {
          // check that no tags from `tagsArray` have been selected
          t.equal(res.payload.indexOf(selectedTag(5)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(16)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(18)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(22)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(32)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(33)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(49)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(85)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(105)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(111)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(112)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(115)), -1, 'Tag was not added');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});
