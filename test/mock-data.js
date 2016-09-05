var mockData = {};

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
  name: 'apple',
  mission_statement: 'Change the economy'
};

// (5) via /orgs/add
// Data, as saved in the DB, in `organisations` list, after admin adds org in (4)
mockData.orgsAddDB = {
  name: 'apple',
  mission_statement: 'Change the economy',
  active: true,
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
  password: 'some hashed password',
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

module.exports = mockData;
