const { exec } = require('child_process');
const fs = require('fs');
exec('npm run build', { encoding: 'utf8', maxBuffer: 10 ** 7 }, (err, stdout, stderr) => {
    fs.writeFileSync('build_err.log', stdout + '\n\nSTDERR:\n\n' + stderr);
});
