'use strict';

var Hoek = require('hoek');
var pg = require('pg');
var query = require('pg-helpers').query;
var challenges = require('./mockdata/challenges.json');
var tagsChallenges = require('./mockdata/tags_challenges.json');
var configLocal = require('../../server/config.test.js');
var configProd = require('../../server/config.js');

// remove once challenges plugin has been registered
var fs = require('fs');
var path = require('path');
var file = path.resolve(__dirname, './initialise_tables.sql');
var fixtures = fs.readFileSync(file, 'utf8').toString();

var challengeFields = [
  'id',
  'title',
  'description',
  'date',
  'org_id',
  'creator_id',
  'active'
];

var tagsChallengeFields = [
  'challenge_id',
  'tag_id'
];

function removeDuplicates (filter) {
  var all = challenges.map(function (chal) {
    return '\'' + chal[filter] + '\'';
  });

  var filtered = all.filter(function (element, index) {
    return all.indexOf(element) === index;
  });

  return filtered.map(function (element) {
    return parseInt(element.replace(/'/g, ''), 10);
  });
}

function importOrgs () {
  return removeDuplicates('org_id').map(function (orgId) {
    return 'INSERT INTO organisations (id) VALUES (' + orgId + '); ';
  })
    .join('');
}

function importPeople () {
  return removeDuplicates('creator_id').map(function (creatorId) {
    return 'INSERT INTO people (id) VALUES (' + creatorId + '); ';
  })
    .join('');
}

function importChallenges () {
  return challenges.map(function (challenge) {
    var values = challengeFields.map(function (field) {
      return '\'' + challenge[field] + '\'';
    }).join(', ');

    return 'INSERT INTO challenges '
      + '(id, title, description, date, org_id, creator_id, active) '
      + 'VALUES (' + values + '); ';
  }).join('');
}

function importTagChallenges () {
  return tagsChallenges.map(function (tagsChallenge) {
    var values = tagsChallengeFields.map(function (field) {
      return '\'' + tagsChallenge[field] + '\'';
    }).join(', ');

    return 'INSERT INTO tags_challenges (challenge_id, tag_id) '
      + 'VALUES (' + values + '); ';
  }).join('');
}

function importMockData (environment, cb) {
  var config = environment === 'local' ? configLocal : configProd;
  var pool = new pg.Pool(config.pg);

  query(fixtures, pool, function (initErr) {
    Hoek.assert(!initErr, initErr);
    query(importOrgs(), pool, function (orgErr) {
      Hoek.assert(!orgErr, orgErr);
      query(importPeople(), pool, function (peopleErr) {
        Hoek.assert(!peopleErr, peopleErr);
        query(importChallenges(), pool, function (chalErr) {
          Hoek.assert(!chalErr, chalErr);
          query(importTagChallenges(), pool, function (tagChalErr) {
            console.log('>>>>>>>>>>> ALL GOOD >>>>>>>>>>>');
            Hoek.assert(!tagChalErr, tagChalErr);
            cb(true);
          });
        });
      });
    });
  });
}

importMockData(process.argv[2], function (response) {
  return response;
});
