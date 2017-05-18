'use strict';

// insights
// require('./insights/toggle-active.test.js');
require('./insights/browse.test.js');
require('./insights/add-insight.test.js');
require('./insights/add-tags-to-insight.test.js');
require('./insights/edit-insight.test.js');
require('./insights/browse.test.js');
require('./insights/add-insight.test.js');
require('./insights/admin-adds-resource.test.js');

// challenges
require('./challenges/add-chal.test.js');
require('./challenges/edit-chal.test.js');
require('./challenges/browse.test.js');
require('./challenges/details-view.test.js');
require('./challenges/toggle-active.test.js');

// orgs
require('./organisations/toggle-active.test.js');
require('./organisations/add-org-view.test.js');
require('./organisations/add-org.test.js');
require('./organisations/browse-orgs.test.js');
require('./organisations/org-details-view.test.js');
require('./organisations/edit-org-view.test.js');
require('./organisations/edit-org.test.js');
require('./organisations/add-logo.test.js');
require('./organisations/archived-challenges.test.js');

// people
require('./people/browse.test.js');
require('./people/login.test.js');
require('./people/activate-account-view.test.js');
require('./people/activate-account.test.js');
require('./people/add-user-view.test.js');
require('./people/add-user.test.js');
require('./people/edit-settings.test.js');
require('./people/add-user.test.js');
require('./people/request-password-reset.test.js');
require('./people/password-reset.test.js');

// tags
require('./browse/select-tags.test.js');

// server
require('./server/auth.test.js');
require('./server/permissions.test.js');
require('./server/file-server.test.js');

// generic
require('./browse/landing.test.js');

// unit
require('./unit/getCancelUrl.test.js');
require('./unit/getView.test.js');
require('./unit/moveLocationToEnd.test.js');
