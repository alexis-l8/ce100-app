module.exports = (request, reply) => {
  var exampleTag = [
    {
      name: 'example',
      id: -1
    }
  ];
  reply.view('challenges/add', { tags: exampleTag });
};
