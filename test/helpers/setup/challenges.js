module.exports = {
  challenges: [
    {
      id: 0,
      date: Date.now(),
      org_id: 0,
      creator_id: 2,
      title: 'Challenge Number 1',
      description: 'What can I...?',
      active: true,
      tags: []
    },
    {
      id: 1,
      date: Date.now(),
      org_id: 0,
      creator_id: 2,
      title: 'Challenge Number 2',
      description: 'How can I...?',
      active: false,
      tags: [[0, 1]]
    },
    {
      id: 2,
      date: Date.now(),
      org_id: 0,
      creator_id: 2,
      title: 'Challenge Number 3',
      description: 'Where can I...?',
      active: false,
      tags: [[3, 1], [10, 3], [8, 2]]
    },
    {
      id: 3,
      date: Date.now(),
      org_id: 1,
      creator_id: 3,
      title: 'Challenge Number 4',
      description: 'Who should I...?',
      active: false,
      tags: [[1, 1], [1, 3], [5, 1], [6, 2]]
    },
    {
      id: 4,
      date: Date.now(),
      org_id: 1,
      creator_id: 3,
      title: 'Challenge Number 5',
      description: 'How have...?',
      active: false,
      tags: []
    },
    {
      id: 5,
      date: Date.now(),
      org_id: 2,
      creator_id: 4,
      title: 'Challenge Number 6',
      description: 'Is there a way to...?',
      active: false,
      tags: []
    },
    {
      id: 6,
      date: Date.now(),
      org_id: 3,
      creator_id: 5,
      title: 'Challenge Number 7',
      description: 'Is it possible to...?',
      active: false,
      tags: [[6, 2]]
    }
  ]
};
