require('env2')('config.env');

const mockData = {};

// (1) via add-user.html form
// Form data, sent in payload, by Admin to create new primary user
mockData.usersAddPayload = {
  first_name: 'Anna',
  last_name: 'Ivanovic',
  email: 'an@iv.co',
  organisation_id: 5,
  user_type: 'primary'
};

// (2) via /people/add
// Data, as saved in the DB, in `people` list, after admin adds a user in (1)
mockData.newUserAdded = {
  first_name: 'Anna',
  last_name: 'Ivanovic',
  email: 'an@iv.co',
  organisation_id: 5,
  user_type: 'primary',
  id: 7,
  active: true
};

// (3) via /people/activate/{primaryUserId}
// Form data (password), sent in payload, by Primary User, after admin adds a user in (1)
mockData.usersActivatePayload = {
  password: 'Hello1',
  confirmPassword: 'Hello1'
};

// (4) via /orgs/add
// Form Data, sent in payload, by admin to create new org
mockData.orgsAddPayload = {
  name: 'acer'
};

// (5) via /orgs/add
// Data, as saved in the DB, in `organisations` list, after admin adds org in (4)
mockData.orgsAddDB = {
  name: 'acer',
  active: true,
  mission_statement: '',
  id: 5,
  people: []
};

// (6) via /people/activate/{primaryUserId}
// Data, as saved in DB, in `people` list after account activated in (2)
mockData.usersActivateDB = {
  first_name: 'Anna',
  last_name: 'Ivanovic',
  email: 'an@iv.co',
  organisation_id: 5,
  user_type: 'primary',
  id: 7,
  active: true,
  password: process.env.MOCKDATA_HASHED_PASSWORD,
  last_login: Date.now()
};

// (7) via /people/add
// Data, as saved in the DB, in `organisations` list, after admin adds a linked primary in (1)
mockData.orgPostUser = {
  name: 'acer',
  id: 5,
  active: true,
  mission_statement: '',
  primary_id: 7,
  people: [7]
};

mockData.loginAdminCorrect = {
  email: 'ja@mu.co',
  password: 'Hello1'
};

mockData.loginAdminIncorrect = {
  email: 'ja@mu.co',
  password: 'Hello2'
};

// (10) via /orgs/
// Multiple (fully-completed) organisation account details
mockData.completeOrgEntries = {
  a: {
    id: 0,
    name: 'apple',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 2,
    people: [0]
  },
  b: {
    id: 1,
    name: 'dwyl',
    active: true,
    mission_statement: 'Do What You Love!',
    primary_id: 3,
    people: [3]
  },
  c: {
    id: 2,
    name: 'charcoal',
    active: false,
    mission_statement: 'Summer!',
    primary_id: 4,
    people: [4]
  },
  d: {
    id: 3,
    name: 'emf',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 5,
    people: [5]
  },
  e: {
    id: 4,
    name: 'anon_org123',
    active: false,
    mission_statement: 'Anonymous',
    primary_id: 6,
    people: [6]
  }
};

// people
mockData.initialPeople = [
  {
    first_name: 'jack',
    last_name: 'murphy',
    email: 'ja@mu.co',
    user_type: 'admin',
    id: 0,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Marie',
    last_name: 'Farie',
    email: 'ma@fa.co',
    user_type: 'admin',
    id: 1,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Sally',
    last_name: 'Robbins',
    email: 'sa@ro.co',
    organisation_id: 0,
    user_type: 'primary',
    id: 2,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Ben',
    last_name: 'Matthews',
    email: 'be@ma.co',
    organisation_id: 1,
    user_type: 'primary',
    id: 3,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Andy',
    last_name: 'Murray',
    email: 'an@mu.co',
    organisation_id: 2,
    user_type: 'primary',
    id: 4,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Gale',
    last_name: 'Simon',
    email: 'ga@si.co',
    organisation_id: 3,
    user_type: 'primary',
    id: 5,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Maria',
    last_name: 'Sharap',
    email: 'ma@sh.co',
    organisation_id: 4,
    user_type: 'primary',
    id: 6,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  }];

mockData.allOrgsView = {
  payload: '<h1>All Organisations</h1>\n<div>\n      <div>\n        <a href="/orgs/0">\n          <h2>apple</h2>\n        </a>\n      </div>\n      <div>\n        <a href="/orgs/1">\n          <h2>dwyl</h2>\n        </a>\n      </div>\n      <div>\n        <a href="/orgs/2">\n          <h2>charcoal</h2>\n        </a>\n      </div>\n      <div>\n        <a href="/orgs/3">\n          <h2>emf</h2>\n        </a>\n      </div>\n      <div>\n        <a href="/orgs/4">\n          <h2>anon_org123</h2>\n        </a>\n      </div>\n</div>\n'
};

mockData.orgSpecificView = {
  payload: '<div>\n  <h2>Organisation Details</h2>\n  <div>\n    <span>Organisation Name:</span>\n    <span>apple</span>\n  </div>\n  <div>\n    <span>Mission Statement:</span>\n    <span>Change the economy</span>\n  </div>\n  <div>\n    <div>\n      <span>Primary User:</span>\n      <span>jack murphy</span>\n    </div>\n    <div>\n      <span>Primary User Email:</span>\n      <span>ja@mu.co</span>\n    </div>\n  </div>\n  <div>\n    <span>Active:</span>\n    <span>true</span>\n  </div>\n</div>\n'
};

module.exports = mockData;
