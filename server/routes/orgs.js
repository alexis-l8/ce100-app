'use strict';

var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var browseOrgs = require('../handlers/orgs/browse-orgs.js');
var orgDetailsView = require('../handlers/orgs/details-view.js');
var edit = require('../handlers/orgs/edit-org.js');
var editView = require('../handlers/orgs/edit-org-view.js');
var editSchema = require('../models/admin-edit-org.js');
var toggleActive = require('../handlers/orgs/toggle-active.js');
var add = require('../handlers/orgs/add.js');
var addSchema = require('../models/admin-add-org.js');
var addView = require('../handlers/serve-view.js')('organisations/add');
var archivedChallengesView = require('../handlers/orgs/archived-challenges-view.js');

module.exports = [
  {
    method: 'GET',
    path: '/orgs',
    handler: browseOrgs
  },
  {
    method: 'GET',
    path: '/orgs/tags',
    handler: browseAddTagsView('orgs')
  },
  {
    method: 'GET',
    path: '/orgs/add',
    handler: addView,
    config: { auth: { scope: ['admin', 'content-owner'] } }
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: add,
    config: {
      auth: { scope: ['admin', 'content-owner'] },
      validate: addSchema
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}',
    handler: orgDetailsView
  },
  {
    method: 'GET',
    path: '/orgs/{id}/edit',
    handler: editView,
    config: { auth: { scope: ['admin', 'primary', 'content-owner'] } }
  },
  {
    method: 'POST',
    path: '/orgs/{id}/edit',
    handler: edit,
    config: {
      validate: editSchema,
      auth: { scope: ['admin', 'primary', 'content-owner'] }
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/toggle-active',
    handler: toggleActive,
    config: { auth: { scope: ['admin', 'content-owner'] } }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/archived-challenges',
    handler: archivedChallengesView,
    config: { auth: { scope: 'primary' } }
  }
];
