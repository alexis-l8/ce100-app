'use strict'

module.exports = {
  reporters: {
    myConsoleReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{ log: '*', error: '*', response: '*', request: '*' }]
    }, {
      module: 'good-console'
    }, 'stdout']
  }
};
