const mocks = {};
// Payload from Admin create new primary user
// via /users/add
mocks.addUserPayload = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary'
};

// Stored in `people` DB after admin adds a user
// via /users/add
mocks.newUserAdded = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary',
  id: 0,
  active: true
};

// Stored in `organisations` after admin adds a linked primary
// via /users/add
mocks.orgPostUser = {
  id: 0,
  name: 'apple',
  active: true,
  mission_statement: 'Change the economy',
  primary_id: 0,
  people: [0]
};

// Payload from admin create new org
// via /orgs/add
mocks.addOrgPayload = {
  name: 'apple',
  mission_statement: 'Change the economy'
};

// Stored in `organisations` after admin adds and org
// via /orgs/add
mocks.orgPreUser = {
  id: 0,
  name: 'apple',
  active: true,
  mission_statement: 'Change the economy',
  people: []
};

module.exports = mocks;
