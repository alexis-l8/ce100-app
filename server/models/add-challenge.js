var Joi = require('joi');

module.exports = {
  payload: {
    title: Joi.string().min(1).required(),
    description: Joi.string().min(1).required()
  },
  failAction: failAction('challenges/add')
};

function failAction (view) {
  console.log('in failaction function');
  return function (request, reply, source, error) {
    reply.view(view, {error: errorOptions(error)}).code(401);
  };
}

function errorOptions (err) {
  return {
    values: err.data._object,
    message: err.data.details[0].message.split('"').join('').split('_').join('').split('-').join(''),
    [err.data.details[0].path]: 'form__input-error'
  };
}
