require('env2')('config.env');

const mockData = {};

// (1) via add-user.html form
// Form data, sent in payload, by Admin to create new primary user
mockData.usersAddPayload = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary',
  submit: 'Submit'
};

// (2) via /people/add
// Data, as saved in the DB, in `people` list, after admin adds a user in (1)
mockData.newUserAdded = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary',
  id: 0,
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
  name: 'apple'
};

// (5) via /orgs/add
// Data, as saved in the DB, in `organisations` list, after admin adds org in (4)
mockData.orgsAddDB = {
  name: 'apple',
  active: true,
  mission_statement: '',
  id: 0,
  people: []
};

// (6) via /people/activate/{primaryUserId}
// Data, as saved in DB, in `people` list after account activated in (2)
mockData.usersActivateDB = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary',
  id: 0,
  active: true,
  password: process.env.MOCKDATA_HASHED_PASSWORD,
  last_login: Date.now()
};

// (7) via /people/add
// Data, as saved in the DB, in `organisations` list, after admin adds a linked primary in (1)
mockData.orgPostUser = {
  id: 0,
  name: 'apple',
  active: true,
  mission_statement: 'Change the economy',
  primary_id: 0,
  people: [0]
};

// (8) via /login
// Correct login data for a primary user
mockData.loginPrimaryUserCorrect = {
  email: 'ja@mu.co',
  password: 'Hello1'
};

// (9) via /login
// Incorrect login data for a primary user
mockData.loginPrimaryUserIncorrect = {
  email: 'ja@mu.co',
  password: 'IncorrectPassword'
};

// (10) via /orgs/
// Multiple (fully-completed) organisation account details
mockData.completeOrgEntries = {
  a: {
    id: 1,
    name: 'dwyl',
    active: true,
    mission_statement: 'Do What You Love!',
    primary_id: 2,
    people: [3]
  },
  b: {
    id: 2,
    name: 'charcoal',
    active: false,
    mission_statement: 'Summer!',
    primary_id: 3,
    people: [4]
  },
  c: {
    id: 3,
    name: 'emf',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 4,
    people: [5]
  },
  d: {
    id: 4,
    name: 'anon_org123',
    active: false,
    mission_statement: 'Anonymous',
    primary_id: 5,
    people: [6]
  },
  e: {
    id: 0,
    name: 'apple',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 0,
    people: [0]
  }
};

module.exports = mockData;
