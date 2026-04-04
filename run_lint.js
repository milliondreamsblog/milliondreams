const { execSync } = require('child_process');
const fs = require('fs');
try {
    const result = execSync('npx eslint . --format json', { encoding: 'utf8', maxBuffer: 10 ** 7 });
    fs.writeFileSync('lint.json', result);
} catch (e) {
    fs.writeFileSync('lint.json', e.stdout);
}
