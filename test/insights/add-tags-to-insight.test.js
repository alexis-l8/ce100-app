var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');

function addTagsToInsight (method, insightId, tags, user) {
  user = user || 'admin_1';
  return {
    method: method,
    url: '/insights/' + insightId + '/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] },
    payload: { tags: tags }
  };
}

function selectedTag (id) {
  return 'name="tags" value=' + id + ' checked="checked">';
}

// Permissions of add tags GET and POST
tape('Primary user cannot GET or POST add tags to insight', function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToInsight('GET', '1', undefined, 'primary_3'), function (res) {
        t.equal(res.statusCode, 403, 'primary cannot can view add-tags-view');
        server.inject(addTagsToInsight('POST', '1', undefined, 'primary_3'), function (res) {
          t.equal(res.statusCode, 403, 'primary cannot can POST to add tags to insight');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});


tape('admin can view add-tags view', function (t) {
  var existing = ['1', '8', '22']; // tags currently attached to insight 1.

  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToInsight('get', '1', undefined), function (res) {
        t.equal(res.statusCode, 200, 'admin can view add-tags-view');
        t.ok(res.payload.indexOf(selectedTag(existing[0])) > -1, 'insight originally has tag');
        t.ok(res.payload.indexOf(selectedTag(existing[1])) > -1, 'insight originally has tag');
        t.ok(res.payload.indexOf(selectedTag(existing[2])) > -1, 'insight originally has tag');
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

tape('admin can add zero tags to an insight and remove old tags: --> ' + __filename, function (t) {
  var insight = '1';
  var existing = ['1', '8', '22']; // tags currently attached to insight 1.

  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToInsight('POST', insight, undefined), function (res) {
        t.equal(res.statusCode, 302, 'tags are updated and user is redirected');
        t.equal(res.headers.location, '/insights', 'user is successfully redirected to /insights');
        server.inject(addTagsToInsight('GET', insight, undefined), function (res) {
          t.equal(res.payload.indexOf(selectedTag(existing[0])), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf(selectedTag(existing[1])), -1, 'Old tag with was succesfuly removed');
          t.equal(res.payload.indexOf(selectedTag(existing[2])), -1, 'Old tag with was succesfuly removed');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('admin can add zero tags to an insight and remove old tags: --> ' + __filename, function (t) {
  var insight = '1';
  var newTag = '15'; // new tag to add to insight

  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToInsight('POST', insight, newTag), function (res) {
        t.equal(res.statusCode, 302, 'tags are updated and user is redirected');
        t.equal(res.headers.location, '/insights', 'user is successfully redirected to /insights');
        server.inject(addTagsToInsight('GET', insight, undefined), function (res) {
          t.ok(res.payload.indexOf(selectedTag(newTag)) > -1, 'new tag successfully added to insight');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});


tape('admin can add multiple tags to their insight and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    var insight = 3;
    var tagsArray = ['15', '55', '92'];
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToInsight('POST', insight, tagsArray), function (res) {
        t.equal(res.statusCode, 302, 'tags are updated and user is redirected');
        t.equal(res.headers.location, '/insights', 'user is successfully redirected to /insights');
        server.inject(addTagsToInsight('GET', insight, undefined), function (res) {
          t.ok(res.payload.indexOf(selectedTag(tagsArray[0])) > -1, 'new tag successfully added to insight');
          t.ok(res.payload.indexOf(selectedTag(tagsArray[1])) > -1, 'new tag successfully added to insight');
          t.ok(res.payload.indexOf(selectedTag(tagsArray[2])) > -1, 'new tag successfully added to insight');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

tape('admin cannot add more than 10 tags to an insight, and error message is flagged: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    var insight = 1;
    var existing = ['1', '8', '22']; // tags currently attached to insight 1.
    var tagsArray = ['5', '16', '18', '28', '32', '33', '49', '85', '105', '111', '112', '115'];
    var expectedError = 'tags a maximum of 10 tags can be chosen';
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToInsight('POST', insight, tagsArray), function (res) {
        t.equal(res.statusCode, 400, 'no more than 10 tags can be added to an insight');
        // check error message displays correctly
        t.ok(res.payload.indexOf(expectedError) > -1, 'Error message correctly displayed');
        server.inject(addTagsToInsight('GET', insight, undefined), function (res) {
          // check the old tags still exists
          t.ok(res.payload.indexOf(selectedTag(existing[0])) > -1, 'Old tag still exists');
          t.ok(res.payload.indexOf(selectedTag(existing[1])) > -1, 'Old tag still exists');
          t.ok(res.payload.indexOf(selectedTag(existing[2])) > -1, 'Old tag still exists');
          // check none of the new tags have been added
          t.equal(res.payload.indexOf(selectedTag(5)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(16)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(18)), -1, 'Tag was not added');
          t.equal(res.payload.indexOf(selectedTag(28)), -1, 'Tag was not added');
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
