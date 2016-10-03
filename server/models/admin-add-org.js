var Joi = require('joi');

module.exports = {
  payload: {
    name: Joi.string().min(1).required()
  },
  failAction: failAction('organisations/add')
};

function failAction (view) {
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
