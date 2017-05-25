'use strict';
var Nightmare = require('nightmare');
var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];

tape('user sees a modal when clicking edit tags in add challanges page ' + __filename, function (t) {
  var nightmare = Nightmare({waitTimeout: 10000});
  init(config, function (error, server, pool) {
    nightmare
        .goto(server.info.uri)
        .type('.form__input--login[type="email"]', 'sa@ro.co')
        .type('.form__input--login[type="password"]', 'Hello1')
        .click('.button--login')
        .wait(1000)
        .click('body > nav.navbar-top.navbar-top--desktop:nth-child(2) > div.navbar-top__links:nth-child(2) > div.navbar-top__item.navbar-top__item--desktop:nth-child(2) > a.navbar__top__link.navbar-top__link--desktop:nth-child(1) > span.navbar__top__link.navbar-top__link--desktop:nth-child(2)')
        .wait(1000)
        .click('#edit-tags')
        .evaluate(function () {
          return document.querySelector('.modal').style
        })
        .end()
        .then(function(modalStyle) {
          t.equal(modalStyle.display, 'block', 'modal is showing as the display style is set to block');
          t.end();
          pool.end();
          server.stop();
        })
  })
});

tape('user does not see the modal when it is closed by the user ' + __filename, function (t) {
  var nightmare = Nightmare({waitTimeout: 10000});
  init(config, function (error, server, pool) {
    nightmare
        .goto(server.info.uri)
        .type('.form__input--login[type="email"]', 'sa@ro.co')
        .type('.form__input--login[type="password"]', 'Hello1')
        .click('.button--login')
        .wait(1000)
        .click('body > nav.navbar-top.navbar-top--desktop:nth-child(2) > div.navbar-top__links:nth-child(2) > div.navbar-top__item.navbar-top__item--desktop:nth-child(2) > a.navbar__top__link.navbar-top__link--desktop:nth-child(1) > span.navbar__top__link.navbar-top__link--desktop:nth-child(2)')
        .wait(1000)
        .click('#edit-tags')
        .wait(1000)
        .click('body > div.container:nth-child(3) > div.modal:nth-child(3) > div.modal__content:nth-child(1) > div.card.card--header.card--header--modal:nth-child(1) > a.icon.icon--cancel.icon--cancel--modal:nth-child(2)')
        .evaluate(function () {
          return document.querySelector('.modal').style
        })
        .end()
        .then(function(modalStyle) {
          t.equal(modalStyle.display, 'none', 'modal is not showing as the display style is set to none');
          t.end();
          pool.end();
          server.stop();
        })
  })
});

tape('user adds a challenge. inc. title, description and tags' + __filename, function (t) {
  var nightmare = Nightmare({waitTimeout: 10000});
  init(config, function (error, server, pool) {
    nightmare
        .goto(server.info.uri)
        .type('.form__input--login[type="email"]', 'sa@ro.co')
        .type('.form__input--login[type="password"]', 'Hello1')
        .click('.button--login')
        .wait(1000)
        .click('body > nav.navbar-top.navbar-top--desktop:nth-child(2) > div.navbar-top__links:nth-child(2) > div.navbar-top__item.navbar-top__item--desktop:nth-child(2) > a.navbar__top__link.navbar-top__link--desktop:nth-child(1) > span.navbar__top__link.navbar-top__link--desktop:nth-child(2)')
        .wait(1000)
        .type('input#title', 'testing')
        .type('textarea#description', 'this is the description')
        .click('button#edit-tags > span.button--edit__text:nth-child(2)')
        .click('div#tag-list > div.form__section.form__section--tags:nth-child(1) > label.tag__title.tag__title--modal:nth-child(1)')
        .click('input#cat_9')
        .click('div#tag-list > div.form__section.form__section--tags:nth-child(1) > div.form__subsection.form__subsection--modal:nth-child(3) > label.tag__label:nth-child(2)')
        .click('input#tag_87')
        .click('div#tag-list > div.form__section.form__section--tags:nth-child(1) > div.form__subsection.form__subsection--modal:nth-child(3) > label.tag__label:nth-child(4)')
        .click('input#tag_89')
        .click('div#tag-list > div.form__section.form__section--tags:nth-child(1) > div.form__subsection.form__subsection--modal:nth-child(3) > label.tag__label:nth-child(6)')
        .click('input#tag_91')
        .click('button#select-tags')
        .click('body > div.container:nth-child(3) > form.form.form--desktop:nth-child(2) > button.button:nth-child(3)')
        .wait(1000)
        .evaluate(function () {
          return window.location.pathname
        })
        .end()
        .then(function(urlPathname) {
          console.log(typeof urlPathname);
          t.equal(urlPathname, '/challenges/11', 'challenge has been added correctly.');
          t.end();
          pool.end();
          server.stop();
        })
  })
});
