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


// NOTE. AT THE MOMENT THERE IS NO WAY TO TELL WHICH TAGS ARE ADDED TO A CHALLENGE SO I CANNOT PROPERLY TEST THIS FEATURE
// I HAVE WRITTEN SOME TESTS THAT ASSUME WE WILL DISPLAY THE TAGS ON THE EDIT CHALLENGE VIEW, BUT WE CAN USE INSTEAD THE VIEW
// CHALLENGE VIEW WHEN IT IS WRITTEN

function getChalDetails (id) {
  return {
    url: '/challenges/' + id + '/edit',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['primary_3'] }
  };
}

// NOTE THERE IS NO PERMISSIONS CHECKING ON THIS POST ENDPOINT YET.
// THIS TEST SHOULD PASS, BUT IT WILL FAIL IF UNCOMMMENTED NOW
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

        // uncomment when the edit challenge view is done.
        // server.inject(getChalDetails(2), function (res) {

        // check that this tag is removed:     "challenges_id": 2, "tags_id": 2,   "name": "Corporate",
          // t.equal(res.payload.indexOf('Corporate'), -1, 'Old tag with was succesfuly removed');


          t.end();
          pool.end();
          server.stop();
        // });
      });
    });
  });
});



tape('primary user can add a single tag to their challenge and remove old tags: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(addTagsToChal(3, '5'), function (res) {
        t.equal(res.statusCode, 302, 'a primary can add a single tag to their own challenge');

        // uncomment when we have edit challenge view
        // server.inject(getChalDetails, function (res) {
        //   // check the new tag was added
        //   t.ok(res.payload.indexOf('Emerging Innovator') > -1, 'Tag with id 5 was succesfuly added');
        //
        //   // check the old tags were removed
        //   t.equal(res.payload.indexOf('Waste to energy'), -1, 'Old tag with was succesfuly removed');
        //   t.equal(res.payload.indexOf('Buildings design'), -1, 'Old tag with was succesfuly removed');
        //   t.equal(res.payload.indexOf('Fertiliser'), -1, 'Old tag with was succesfuly removed');

          t.end();
          pool.end();
          server.stop();
        // });
      });
    });
  });
});
