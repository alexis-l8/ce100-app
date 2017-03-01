module.exports = function(profile) {
  return [
    {
      title: profile.first_name + ', innovation begins with collaboration.',
      description: 'Get connected to the people making the circular economy happen.'
    },
    {
      primaryOnly: true,
      title: 'Tell us about you',
      description:
        'Share your circular economy vision, expertise and challenges.',
      link: {
        text: 'Update profile',
        url: '/orgs/' + profile.org_id + '/edit'
      }
    },
    {
      title: 'Get to know the network',
      description:
        'Find out what other member’s are working on and get in touch.',
      link: {
        text: 'See organisations',
        url: '/orgs'
      }
    },
    {
      primaryOnly: true,
      title: 'Share a challenge',
      description:
        'And find the people who can help you solve it.',
      link: {
        text: 'Add challenge',
        url: '/challenges/add'
      }
    },
    {
      lastCard: true,
      title: 'Find the latest insights',
      description:
        'Get access to circular economy content on the topics you’re interested in.',
      link: {
        text: 'Explore insights',
        url: '/insights'
      }
    }
  ];
};
