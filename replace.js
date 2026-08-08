const fs = require('fs');
const file = 'src/lib/googleSheets.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\.replace\(\/,\/g, ''\)/g, ".replace(/[, \\s]/g, '')");
fs.writeFileSync(file, content);
