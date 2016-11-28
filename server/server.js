'use strict';

var Hapi = require('hapi');
var path = require('path');
var inert = require('inert');
var handlebars = require('handlebars');
var vision = require('vision');
var hapiError = require('hapi-error');
var auth = require('./auth.js');
var routes = require('./routes.js');
var pg = require('pg');
// pg plugins
var tags = require('tags-system');
var challenges = require('pg-challenges');
var people = require('pg-people');
// pg tables data
var tagsData = require('../data/tags.json');
var categoriesData = require('../data/categories.json');
var peopleData = require('../data/people.json');
var organisationsData = require('../data/organisations.json');
var tagsOrgsData = require('../data/tags_organisations.json');
var challengesData = require('../data/challenges.json');
var tagsChallengesData = require('../data/tags_challenges.json');

function initServer (config, callback) {
  var server = new Hapi.Server();
  var pool = new pg.Pool(config.pg);
  var optionsTags = {
    reset: config.plugins.tags.reset,
    tags: tagsData,
    categories: categoriesData,
    pool: pool
  };
  var optionsPeople = {
    pool: pool,
    reset: config.plugins.people.reset,
    people: peopleData,
    organisations: organisationsData,
    tags_organisations: tagsOrgsData
  };
  var optionsChallenges = {
    pool: pool,
    reset: config.plugins.challenges.reset,
    challenges: challengesData,
    tags_challenges: tagsChallengesData
  };

  // initialise a redis connection
  server.app.redis = require('redis-connection')(); // eslint-disable-line
  server.on('stop', function () {
    console.log(server.app.redis.connected);
    server.app.redis.end();
  });

  server.connection({ port: config.port });

  // register the plugins in order to not break constraints on pg tables
  // tags, people, challenges
  server.register({
    register: tags,
    options: optionsTags
  }, function (errorTags) {
    if (errorTags) {
      console.log('error tags'); // eslint-disable-line

      return callback(errorTags, server, pool);
    }

    return server.register({
      register: people,
      options: optionsPeople
    }, function (errorPeople) {
      if (errorPeople) {
        console.log('error people'); // eslint-disable-line

        return callback(errorPeople, server, pool);
      }

      return server.register({
        register: challenges,
        options: optionsChallenges
      }, function (errorChallenges) {
        if (errorChallenges) {
          console.log('error challenges'); //eslint-disable-line

          return callback(errorChallenges, server, pool);
        }

        return server.register([
          inert,
          vision,
          hapiError,
          auth
        ], function (err) {
          if (err) {
            return callback(err, server, pool);
          }

          server.views({
            engines: { html: handlebars },
            relativeTo: path.resolve(__dirname),
            layout: 'default',
            layoutPath: '../templates/layout',
            path: '../templates/views',
            partialsPath: '../templates/partials',
            helpersPath: '../templates/helpers'
          });

          server.route(routes);

          return server.start(function (errorStart) { // eslint-disable-line
            return callback(errorStart, server, pool);
          });
        });
      });
    });
  });
}

module.exports = initServer;
