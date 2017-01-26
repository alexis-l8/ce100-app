module.exports = function(profile) {
  return [
    { title: 'Welcome ' + profile.first_name },
    {
      primaryOnly: true,
      title: 'Tell us about you',
      description:
      'What are the circular economy visions and '
      + 'areas of knowledge of your organisation?',
      link: {
        text: 'Fill in your profile',
        url: '/orgs/' + profile.org_id + '/edit'
      }
    },
    {
      title: 'Get to know the network',
      description:
      'Who are the members, their areas of experience and their challenges?',
      link: {
        text: 'Explore now',
        url: '/orgs'
      }
    },
    {
      primaryOnly: true,
      title: 'Share a challenge',
      description:
        'And find out who has the relevant experience to learn from, '
        + 'to help you solve it.',
      link: {
        text: 'Share a challenge now',
        url: '/challenges/add'
      }
    },
    {
      title: 'Find the latest insights',
      description:
      'Explore circular economy insights related to your topic of interest.',
      link: {
        text: 'Find insights',
        url: '/insights'
      }
    }
  ];
};
