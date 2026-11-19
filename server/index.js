/**
 * Local development server. The Express app itself lives in ./app.js and is
 * shared with the Netlify function so both environments behave identically.
 * Start with: node server/index.js
 */
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\nPrince Math Academy API running at http://localhost:${PORT}`);
});
