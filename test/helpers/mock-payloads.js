
let mockPayloads = {};

mockPayloads.usersAddPayload = {
  first_name: 'Anna',
  last_name: 'Ivanovic',
  email: 'ce100.emf@gmail.com',
  organisation_id: 5,
  user_type: 'primary'
};

mockPayloads.usersActivatePayload = {
  password: 'Hello1',
  confirmPassword: 'Hello1'
};

mockPayloads.orgsAddPayload = {
  name: 'acer'
};

mockPayloads.orgsAddDB = {
  name: 'acer',
  active: true,
  mission_statement: '',
  id: 5,
  people: []
};

mockPayloads.loginAdminCorrect = {
  email: 'ja@mu.co',
  password: 'Hello1'
};

mockPayloads.loginAdminIncorrect = {
  email: 'ja@mu.co',
  password: 'Hello2'
};

mockPayloads.loginBadEmail = {
  email: 'jaaaaaa@mu.co',
  password: 'Hello1'
};

module.exports = mockPayloads;
