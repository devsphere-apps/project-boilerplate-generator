const fs = require('fs');
const semver = require('semver');

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const currentVersion = packageJson.version;
const newVersion = semver.inc(currentVersion, 'patch');

packageJson.version = newVersion;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

console.log(`Version updated from ${currentVersion} to ${newVersion}`);

