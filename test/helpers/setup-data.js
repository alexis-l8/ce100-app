const setupData = {};

// people
setupData.initialPeople = [
  {
    first_name: 'Jack',
    last_name: 'Murphy',
    email: 'ja@mu.co',
    user_type: 'admin',
    id: 0,
    active: true,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Marie',
    last_name: 'Kasai',
    email: 'ma@ka.co',
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
  },
  {
    first_name: 'Cocoa',
    last_name: 'Bean',
    email: 'ga@si.co',
    organisation_id: "",
    user_type: 'primary',
    id: 7,
    active: false,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
  },
  {
    first_name: 'Mixed',
    last_name: 'Nuts',
    email: 'ga@si.co',
    organisation_id: "",
    user_type: 'primary',
    id: 8,
    active: false,
    password: process.env.MOCKDATA_HASHED_PASSWORD,
    last_login: Date.now()
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
    people: [0]
  },
  {
    id: 1,
    name: 'dwyl',
    active: true,
    mission_statement: 'Do What You Love!',
    primary_id: 3,
    people: [3]
  },
  {
    id: 2,
    name: 'Charcoal',
    active: true,
    mission_statement: 'Summer!',
    primary_id: 4,
    people: [4]
  },
  {
    id: 3,
    name: 'EMF',
    active: true,
    mission_statement: 'Change the economy',
    primary_id: 5,
    people: [5]
  },
  {
    id: 4,
    name: 'BP',
    active: true,
    mission_statement: 'Anonymous',
    primary_id: 6,
    people: [6]
  },
  {
    id: 5,
    name: 'Asda',
    active: false,
    mission_statement: 'Every Little Helps',
    primary_id: "",
    people: []
  },
  {
    id: 6,
    name: 'Coca Cola',
    active: false,
    mission_statement: 'Santa',
    primary_id: "",
    people: []
  }
];
module.exports = setupData;
