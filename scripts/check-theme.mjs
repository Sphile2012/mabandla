import https from 'https';
function get(url) {
  return new Promise(r => {
    const req = https.get(url, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>r(b)); });
    req.on('error', e => r(''));
  });
}
const html = await get('https://mabandla.netlify.app');
const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
const js = await get('https://mabandla.netlify.app' + match[1]);
// Check for dark theme indicators
console.log('Has dark bg (#080d1a):', js.includes('080d1a'));
console.log('Has dark gradient (050818):', js.includes('050818'));
console.log('Has white bg (from-slate-50):', js.includes('from-slate-50'));
console.log('Has white card (bg-white):', js.includes('"bg-white"'));
// Find login page background
const loginIdx = js.indexOf('Welcome Back');
if (loginIdx >= 0) {
  console.log('\nLogin page context:', js.substring(Math.max(0,loginIdx-200), loginIdx+100));
}
