const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'web', 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Bump text-[Xpx] by 2px
    content = content.replace(/text-\[(\d+)px\]/g, (match, p1) => {
        const val = parseInt(p1, 10);
        return `text-[${val + 2}px]`;
    });
    // Bump standard text sizes
    content = content.replace(/\btext-xs\b/g, 'text-sm');
    content = content.replace(/\btext-sm\b/g, 'text-base');
    content = content.replace(/\btext-base\b/g, 'text-lg');
    content = content.replace(/\btext-lg\b/g, 'text-xl');
    content = content.replace(/\btext-xl\b/g, 'text-2xl');
    content = content.replace(/\btext-2xl\b/g, 'text-3xl');

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Bumped fonts successfully.');
