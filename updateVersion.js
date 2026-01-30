const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const version = packageJson.version;
const content = `export const version = '${version}';\n`;
const outputPath = path.join(__dirname, 'src', 'version.js');

try {
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Updated src/version.js to v${version}`);
} catch (error) {
    console.error('❌ Error updating version.js:', error);
    process.exit(1);
}
