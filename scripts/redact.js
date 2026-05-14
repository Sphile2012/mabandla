const fs = require('fs');
const path = require('path');

const PATTERN = /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const REPLACEMENT = 'REDACTED_JWT_SECRET';

function walk(dir) {
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && entry !== '.git' && entry !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile()) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (PATTERN.test(content)) {
              PATTERN.lastIndex = 0;
              const cleaned = content.replace(PATTERN, REPLACEMENT);
              fs.writeFileSync(fullPath, cleaned, 'utf8');
            }
          } catch (e) { /* binary file, skip */ }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

walk('.');
