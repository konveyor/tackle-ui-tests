const { addListener } = require('cypress/lib/events');

const passedTests = [];

addListener('test:after:run', (test) => {
  if (test.state === 'passed') {
    passedTests.push(test);
  }
});

addListener('run:end', () => {
  console.log('Spec                                              Tests  Passing  Failing  Pending  Skipped');

  passedTests.forEach((test) => {
    console.log(`✔  ${test.spec.relative.padEnd(50)} ${test.duration}ms        -        -        -        -        -`);
  });

  process.exit(0);
});
