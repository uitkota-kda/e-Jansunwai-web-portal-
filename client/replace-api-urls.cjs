const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:3000/api')) {
        // Calculate relative path to config.js
        const dir = path.dirname(file);
        let relativeToConfig = path.relative(dir, './src/config').replace(/\\/g, '/');
        if (!relativeToConfig.startsWith('.')) {
            relativeToConfig = './' + relativeToConfig;
        }

        let importStatement = `import { API_BASE_URL } from '${relativeToConfig}';\n`;

        if (!content.includes('API_BASE_URL')) {
            content = importStatement + content;
        }

        // Replace string concatenations and literals
        content = content.replace(/['"`]http:\/\/localhost:3000\/api([^'"`]*)['"`]/g, '`${API_BASE_URL}$1`');

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
