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
var good = require('good');
// pg plugins
var tags = require('tags-system');
var challenges = require('pg-challenges');
var people = require('pg-people');
var insights = require('pg-insights');

// pg tables data
var mockData = require('ce100-mock-data');

// plugin options
var optionError = require('./hapi-error-config.js');
var goodOptions = require('./good-console-options.js');

function initServer (config, callback) {
  var server = new Hapi.Server();
  var pool = new pg.Pool(config.pg);
  var optionsTags = {
    reset: config.plugins.tags.reset,
    tags: mockData.tags,
    categories: mockData.categories,
    pool: pool
  };
  var optionsPeople = {
    pool: pool,
    reset: config.plugins.people.reset,
    people: mockData.people,
    organisations: mockData.organisations,
    tags_organisations: mockData.tags_organisations
  };
  var optionsChallenges = {
    pool: pool,
    reset: config.plugins.challenges.reset,
    challenges: mockData.challenges,
    tags_challenges: mockData.tags_challenges
  };
  var optionsInsights = {
    pool: pool,
    reset: config.plugins.insights.reset,
    insights: mockData.insights,
    tags_insights: mockData.tags_insights
  };

  // initialise a redis connection
  server.app.redis = require('redis-connection')(); // eslint-disable-line
  server.on('stop', function () {
    server.app.redis.end(true);
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

        return server.register({
          register: insights,
          options: optionsInsights
        }, function (errorInsights) {
          if (errorInsights) {
            console.log('error insights'); //eslint-disable-line

            return callback(errorInsights, server, pool);
          }

          return server.register([
            inert,
            vision,
            { register: hapiError, options: optionError },
            auth,
            { register: good, options: goodOptions }
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
  });
}

module.exports = initServer;
