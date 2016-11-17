var tape = require('tape');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var client = require('redis').createClient();

var payloads = require('../helpers/mock-payloads.js');
var allTags = JSON.parse(fs.readFileSync(path.join(__dirname, '../../tags/tags.json'), 'utf8'));
var setup = require('../helpers/set-up.js');
var initialChallenges = require('../helpers/setup/challenges.js')['challenges'];

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

function loadView (cardId, method){
  return {
    admin: {
      method: method,
      url: `/challenges/${cardId}/edit`,
      headers: { cookie: `token=${admin_token}` }
    },
    primary: {
      method: method,
      url: `/challenges/${cardId}/edit`,
      headers: { cookie: `token=${primary_token}` }
    }
  }
};

tape('tests who can access edit-challenge-view', t => {
  var id_auth = 2;
  var id_unAuth = 5;
  var auth = loadView(id_auth, 'GET');
  var unauth = loadView(id_unAuth, 'GET');
  server.inject(auth.admin, reply => {
    t.equal(reply.statusCode, 200, 'admin can access edit-challenge-view');
    server.inject(auth.primary, reply => {
      t.equal(reply.statusCode, 200, 'primary user can access edit-challenge-view');
      server.inject(unauth.admin, reply => {
        t.equal(reply.statusCode, 200, 'admin can access edit-challenge-view');
        server.inject(unauth.primary, reply => {
          t.equal(reply.statusCode, 401, 'primary user can access edit-challenge-view');
          t.end();
        });
      });
    });
  });
});

// The loggedIn_user has id = 2; she is attached to org_id = 0; org_id has challenges with ids = 0, 1, 2.
tape('update challenge card: title, description and tags', t => {
  var challengeCardId = 2;
  var challengeTags = initialChallenges[challengeCardId].tags;
  var updatedChallenge = payloads.updateChallengeCardTitleAndDescription;

  var loadEditView = {
    method: 'GET',
    url: `/challenges/${challengeCardId}/edit`,
    headers: { cookie: `token=${primary_token}` }
  };
  var updateTitleAndDescription = {
    method: 'POST',
    url: `/challenges/${challengeCardId}/edit`,
    payload: updatedChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  var removeTitleAndDescription = {
    method: 'POST',
    url: `/challenges/${challengeCardId}/edit`,
    payload: { title: '', description: '' },
    headers: { cookie: `token=${primary_token}` }
  };
  var viewExistingTags = {
    method: 'GET',
    url: `/challenges/${challengeCardId}/tags`,
    headers: { cookie: `token=${primary_token}` }
  };
  var updateTags = {
    method: 'POST',
    url: `/challenges/${challengeCardId}/tags`,
    headers: { cookie: `token=${primary_token}` }
  };
  var viewUpdates = {
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(loadEditView, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.result.indexOf(initialChallenges[challengeCardId].title) > -1, 'title has been pre-filled correctly');
    t.ok(reply.result.indexOf(initialChallenges[challengeCardId].description) > -1, 'description has been pre-filled correctly');
    challengeTags.forEach(tag => {
      var tagName = allTags[tag[0]].tags[tag[1]].name;
      t.ok(reply.result.indexOf(tagName) > -1, 'existing tags are correctly displayed');
    });
    server.inject(updateTitleAndDescription, reply => {
      t.equal(reply.statusCode, 302, 'challenge card title and description updated - page redirecting');
      // t.ok(reply.headers.location.indexOf(`/challenges/${challengeCardId}/tags`) > -1, 'redirected to tags selection page correctly');
      updateTags.payload = payloads.noTagsAdded;
      server.inject(viewExistingTags, reply => {
        t.equal(reply.statusCode, 200, 'tag-selection view displayed');
        t.ok(reply.payload.match(/checked="checked"/g).length > challengeTags.length, 'existing tags are displayed with their checkboxes checked');
        server.inject(updateTags, reply => {
          t.equal(reply.statusCode, 302, 'challenge card tags updated - page redirecting');
          var url = reply.headers.location;
          // orgID below is currently 0 --> TODO: if challengeCardId changes, this will also need to change.
          t.ok(url.indexOf('/orgs/0') > -1, 'redirects to org details view');
          viewUpdates.url = url;
          server.inject(loadEditView, reply => {
            t.ok(reply.result.indexOf(payloads.updateChallengeCardTitleAndDescription.title) > -1, 'title has been pre-filled correctly');
            t.ok(reply.result.indexOf(payloads.updateChallengeCardTitleAndDescription.description) > -1, 'description has been pre-filled correctly');
            t.ok(reply.result.indexOf('<h3>Add tags on the next screen</h3>') > -1, 'tags successfully removed');
            server.inject(viewUpdates, reply => {
              t.equal(reply.statusCode, 200, 'org details view displays');
              updateTags.payload = payloads.addTags;
              server.inject(removeTitleAndDescription, reply => { // for when there are _no_ tags
                t.equal(reply.statusCode, 401, ' validator kicks in - invalid update');
                t.ok(reply.payload.indexOf('title is not allowed to be empty') > -1, 'No title, respond with message: "title is not allowed to be empty"');
                server.inject(updateTags, reply => {
                  t.equal(reply.statusCode, 302, 'challenge card tags updated - page redirecting');
                  var url = reply.headers.location;
                  t.ok(url.indexOf('/orgs/0') > -1, 'redirects to org details view');
                  server.inject(viewUpdates, reply => {
                    t.equal(reply.statusCode, 200, 'org details view displays');
                    t.ok(reply.result.indexOf('Global Partner') > -1, 'challenge displays with Global Partner tag');
                    t.ok(reply.result.indexOf('USA') > -1, 'challenge displays with USA tag');
                    server.inject(removeTitleAndDescription, reply => { // for when there _are_ tags, makes sure it can throw error
                      t.equal(reply.statusCode, 401, ' validator kicks in - invalid update');
                      t.ok(reply.payload.indexOf('title is not allowed to be empty') > -1, 'No title, respond with message: "title is not allowed to be empty"');
                      t.end();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

tape('tests who can submit updates to edit-challenge', t => {
  var id_auth = 2;
  var id_unAuth = 5;
  var updatedChallenge = payloads.updateChallengeCardTitleAndDescription;
  var auth = loadView(id_auth, 'POST');
  var unauth = loadView(id_unAuth, 'POST');
  auth.admin.payload = updatedChallenge;
  auth.primary.payload = updatedChallenge;
  unauth.admin.payload = updatedChallenge;
  unauth.primary.payload = updatedChallenge;
  server.inject(auth.admin, reply => {
    t.equal(reply.statusCode, 302, 'admin can edit challenge');
    server.inject(auth.primary, reply => {
      t.equal(reply.statusCode, 302, 'primary user can edit challenge');
      server.inject(unauth.admin, reply => {
        t.equal(reply.statusCode, 302, 'admin can edit challenge');
        server.inject(unauth.primary, reply => {
          t.equal(reply.statusCode, 401, 'primary user cannot edit challenge to which it is not attached');
          t.end();
        });
      });
    });
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
