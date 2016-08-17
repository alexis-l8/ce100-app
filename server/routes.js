const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply('Hello world');
    }
  },
  {
    method: 'GET',
    path: '/index',
    handler: (request, reply) => {
      reply.view('add-user');
    }
  }
]

module.exports = routes;
