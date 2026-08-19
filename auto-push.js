const { execSync } = require('child_process');

try {
  console.log('Running git auto-push...');
  execSync('git add .', { stdio: 'inherit' });
  
  // Check if there are any changes to commit to avoid erroring out
  const status = execSync('git status --porcelain').toString();
  if (status.trim() === '') {
    console.log('No changes to commit. Auto-push completed.');
    process.exit(0);
  }

  execSync('git commit -m "auto: hybrid ONVIF/RTSP system update"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Successfully pushed to main.');
} catch (error) {
  console.error('Failed to auto-push:', error.message);
  process.exit(1);
}
