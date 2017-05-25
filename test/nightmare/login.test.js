'use strict';
var Nightmare = require('nightmare');
var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

tape('test nightmare --> ' + __filename, function (t) {
  var nightmare = Nightmare({waitTimeout: 10000});
  init(config, function (error, server, pool) {
    nightmare
        .goto(server.info.uri)
        .type('.form__input--login[type="email"]', 'sa@ro.co')
        .type('.form__input--login[type="password"]', 'Hello1')
        .click('.button--login')
        .wait(1000)
        .evaluate(function () {
          return document.querySelector('.landing__title').innerHTML
        })
        .end()
        .then(function(titleLandingPage) {
          t.equal(titleLandingPage, 'Sally, innovation begins with collaboration.', 'Sally is on her landing page');
          t.end();
          server.stop();
          pool.end();
        })
  })
});
