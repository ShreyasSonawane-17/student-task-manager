const fs = require('fs');

const requiredFiles = [
    'package.json',
    'app.js',
    'public/index.html',
    'public/style.css',
    'public/script.js'
];

console.log('Starting application build validation...');

let buildFailed = false;

for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`Build Failed: ${file} not found`);
        buildFailed = true;
    }
}

if (buildFailed) {
    process.exit(1);
}

console.log('Application files validated successfully.');
console.log('Build completed successfully.');
