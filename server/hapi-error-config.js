'use strict';

module.exports = {
  statusCodes: {
    401: { redirect: '/login' },
    403: { message: 'Sorry you do not have the permissions to access this page'},
    500: { message: 'Sorry something went wrong' }
  }
};
