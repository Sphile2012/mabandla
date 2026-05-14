import https from 'https';

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve(b));
    });
    req.on('error', e => resolve(''));
  });
}

const html = await get('https://mabandla.netlify.app');
const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
if (!match) { console.log('No bundle found'); process.exit(1); }

const js = await get('https://mabandla.netlify.app' + match[1]);
console.log('Bundle size:', js.length);

// Check if dark theme is present
if (js.includes('050818') || js.includes('0a0f2e')) {
  console.log('✅ Dark theme IS in bundle');
} else {
  console.log('❌ Dark theme NOT in bundle - old build is live');
}

// Check login page background
if (js.includes('Welcome Back')) {
  const idx = js.indexOf('Welcome Back');
  console.log('Login context:', js.substring(Math.max(0, idx - 100), idx + 50));
}
