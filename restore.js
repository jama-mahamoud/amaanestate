const { execSync } = require('child_process');
try {
  console.log('GIT LOG:');
  console.log(execSync('git log --oneline -n 5').toString());
} catch(e) {
  console.log('Error running git:', e.message);
}
