var bcrypt = require('bcrypt');
var aguid = require('aguid');
var setupData = {};

var salt = 10;

// people
setupData.initialPeople = [
  {
    first_name: 'Alex',
    last_name: 'Wijns',
    email: 'admin@mu.co',
    phone: '07111111111',
    job_title: 'Developer',
    user_type: 'admin',
    organisation_id: -1,
    id: 0,
    active: true,
    password: bcrypt.hashSync('adminadmin', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Marie',
    last_name: 'Kasai',
    email: 'ma@ka.co',
    phone: '07111111111',
    job_title: 'Developer',
    user_type: 'admin',
    organisation_id: -1,
    id: 1,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Sally',
    last_name: 'Robbins',
    email: 'sa@ro.co',
    phone: '07111111111',
    job_title: 'Athlete',
    organisation_id: 0,
    user_type: 'primary',
    id: 2,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Ben',
    last_name: 'Matthews',
    email: 'be@ma.co',
    phone: '07111111111',
    job_title: 'Awesome',
    organisation_id: 1,
    user_type: 'primary',
    id: 3,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Andy',
    last_name: 'Murray',
    email: 'an@mu.co',
    phone: '07111111111',
    job_title: 'Tennis Player',
    organisation_id: 2,
    user_type: 'primary',
    id: 4,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Gale',
    last_name: 'Simon',
    email: 'ga@si.co',
    phone: '07111111111',
    job_title: 'Tennis Player',
    organisation_id: 3,
    user_type: 'primary',
    id: 5,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Maria',
    last_name: 'Sharapova',
    email: 'ma@sh.co',
    phone: '07111111111',
    job_title: 'Tennis Player',
    organisation_id: 4,
    user_type: 'primary',
    id: 6,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Coco',
    last_name: 'Harris',
    email: 'co@co.a',
    phone: '07111111111',
    job_title: 'Managing Director',
    organisation_id: -1,
    user_type: 'primary',
    id: 7,
    active: false,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Frank',
    last_name: 'Goldsmith',
    email: 'mi@nu.ts',
    phone: '07111111111',
    job_title: 'CEO',
    organisation_id: -1,
    user_type: 'primary',
    id: 8,
    active: false,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  },
  {
    first_name: 'Anna',
    last_name: 'Freud',
    email: 'an@fr.co',
    phone: '07111001111',
    job_title: 'CEO',
    organisation_id: -1,
    user_type: 'primary',
    id: 9,
    active: true,
    password: bcrypt.hashSync('Hello1', salt),
    last_login: Date.now(),
    challenges: []
  }
];

// organisations
setupData.initialOrgs = [
  {
    id: 0,
    name: 'Apple',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 2,
    people: [0],
    challenges: []
  },
  {
    id: 1,
    name: 'dwyl',
    active: true,
    mission_statement: 'Do What You Love!',
    primary_id: 3,
    people: [3],
    challenges: []
  },
  {
    id: 2,
    name: 'Charcoal',
    active: true,
    mission_statement: 'Summer!',
    primary_id: 4,
    people: [4],
    challenges: []
  },
  {
    id: 3,
    name: 'EMF',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 5,
    people: [5],
    challenges: []
  },
  {
    id: 4,
    name: 'BP',
    active: true,
    mission_statement: 'Anonymous',
    primary_id: 6,
    people: [6],
    challenges: []
  },
  {
    id: 5,
    name: 'Asda',
    active: false,
    mission_statement: 'Every Little Helps',
    primary_id: -1,
    people: [],
    challenges: []
  },
  {
    id: 6,
    name: 'Coca Cola',
    active: false,
    mission_statement: 'Refresh The Nation',
    primary_id: -1,
    people: [],
    challenges: []
  }
];

setupData.initialSessions = [{
  userId: 0, // admin user
  jti: aguid(),   // random UUID
  iat: Date.now()
},
{
  userId: 0, // admin user
  jti: aguid(),   // random UUID
  iat: Date.now() - 10000
},
{
  userId: 2, // admin user
  jti: aguid(),   // random UUID
  iat: Date.now()
},
{
  userId: 3,
  jti: aguid(),   // random UUID
  iat: Date.now(),
  exp: Date.now() // this session has EXPIRED (auth test)
},
{
  userId: Math.ceil(Math.random() * 10000000), // non-existent user for auth test
  jti: aguid(),   // random UUID
  iat: Date.now()
}
];
module.exports = setupData;
