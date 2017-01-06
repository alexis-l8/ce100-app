'use strict'

module.exports = {
  // ops: {
  //   interval: 5 * 60 * 1000 // reporting interval (5 minutes)
  // },
  reporters: {
    myConsoleReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{ log: '*', error: '*', response: '*', request: '*' /* , ops: '*' */ }]
    }, {
      module: 'good-console'
    }, 'stdout']
  }
};
