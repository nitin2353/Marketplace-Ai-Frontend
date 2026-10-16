const fs = require('fs');
const path = require('path');
const glob = require('glob');

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    
    // Support absolute Vite paths starting with /src/
    let resolved;
    if (importPath.startsWith('/src/')) {
       resolved = path.resolve(process.cwd(), importPath.substring(1));
    } else if (importPath.startsWith('.')) {
       resolved = path.resolve(path.dirname(file), importPath);
    } else {
       continue;
    }

    const exts = ['', '.js', '.jsx', '.css', '.png', '.jpg', '.svg'];
    let found = false;
    let matchedExact = false;
    let wrongCase = null;
    
    for (let ext of exts) {
      if (fs.existsSync(resolved + ext)) {
        found = true;
        const basename = path.basename(resolved + ext);
        const dirName = path.dirname(resolved + ext);
        try {
            const actualFiles = fs.readdirSync(dirName);
            if (actualFiles.includes(basename)) {
                matchedExact = true;
            } else {
                const actualName = actualFiles.find(f => f.toLowerCase() === basename.toLowerCase());
                if (actualName) wrongCase = actualName;
            }
        } catch (e) {
            // Ignore
        }
        break;
      }
    }
    if (found && !matchedExact && wrongCase) {
      console.log('Case mismatch in ' + file + ': import ' + importPath + ' (Actual: ' + wrongCase + ')');
    }
  }
}

glob.sync('src/**/*.{js,jsx}').forEach(checkFile);
