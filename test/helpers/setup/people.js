var bcrypt = require('bcrypt');

module.exports = {
  people: [
    {
      first_name: 'Alex',
      last_name: 'Wijns',
      email: 'ce100.emf@gmail.com',
      phone: '07111111111',
      job_title: 'Developer',
      user_type: 'admin',
      organisation_id: -1,
      id: 0,
      active: true,
      password: bcrypt.hashSync('Hello1', 10),
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
      password: bcrypt.hashSync('Hello1', 10),
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
      password: bcrypt.hashSync('Hello1', 10),
      last_login: Date.now(),
      challenges: [0, 1, 2]
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
      password: bcrypt.hashSync('Hello1', 10),
      last_login: Date.now(),
      challenges: [3, 4]
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
      password: bcrypt.hashSync('Hello1', 10),
      last_login: Date.now(),
      challenges: [5]
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
      password: bcrypt.hashSync('Hello1', 10),
      last_login: Date.now(),
      challenges: [6]
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
      password: bcrypt.hashSync('Hello1', 10),
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
      password: bcrypt.hashSync('Hello1', 10),
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
      password: bcrypt.hashSync('Hello1', 10),
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
      password: bcrypt.hashSync('Hello1', 10),
      last_login: Date.now(),
      challenges: []
    },
    {
      first_name: 'Ben',
      last_name: 'Morphous',
      email: 'ben@fra.co',
      phone: '07111111112',
      job_title: 'CEO',
      organisation_id: 7,
      user_type: 'primary',
      id: 10,
      active: true,
      password: bcrypt.hashSync('Hello1', 10),
      last_login: Date.now(),
      challenges: []
    }
  ]
};
