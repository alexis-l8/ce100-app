// var Hoek = require('hoek');
// var getItem = require('./helpers.js').getItem;
//
// module.exports = (request, reply) => {
//   var userId = request.params.id;
//   request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
//     Hoek.assert(!error, error);
//     // catch for case where user at specified userId doesn't exist.
//     var user = JSON.parse(stringifiedUser);
//     if (user.user_type === 'admin') { // uncomment this when you add a Test for it!!
//       reply.view('people/details', user);
//     } else {
//       request.redis.LINDEX('organisations', user.organisation_id, (error, stringifiedOrg) => {
//         Hoek.assert(!error, error);
//         var {name, mission_statement} = JSON.parse(stringifiedOrg);
//         var userDetails = Object.assign({name, mission_statement}, user);
//         reply.view('people/details', userDetails);
//       });
//     }
//   });
// };
