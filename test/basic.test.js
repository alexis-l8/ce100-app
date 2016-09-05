const tape = require('tape');

tape('basic test to get Travis working!', t => {
  const value = 1 + 1;
  t.equal(value, 2, '1  1 = 2 !');
  t.end();
});
