import styles from './About.module.css';

const CODE_CONTAINER = `import { createContainer } from 'almostnode';

const container = createContainer({
  cwd: '/app',
  onConsole: (method, args) =>
    console.log(\`[AlmostNode] [\${method}]\`, ...args),
});

// Write data files to VFS (mirrors project /data folder)
container.vfs.writeFileSync(
  '/data/products.json',
  JSON.stringify(productsData)
);

// Write the API server script
container.vfs.writeFileSync('/app/server.js', \`
  const fs = require('fs');

  function handle(route) {
    const [method, path] = route.split(' ');
    if (path.startsWith('/api/products')) {
      const products = JSON.parse(
        fs.readFileSync('/data/products.json', 'utf8')
      );
      return { status: 200, body: { success: true, data: products } };
    }
    return { status: 404, body: { success: false } };
  }

  module.exports = { handle };
\`);

// Call the API – runs entirely in the browser!
const result = container.execute(\`
  const server = require('/app/server.js');
  module.exports = server.handle('GET /api/products');
\`);

console.log(result.exports.body.data); // products array`;

const ARCHITECTURE = [
  { icon: '📁', title: 'Data folder', desc: 'JSON files (products.json, users.json) live in the project root /data folder and are imported by Vite as static JSON.' },
  { icon: '⚡', title: 'AlmostNode container', desc: 'createContainer() spins up a full Node.js environment in the browser with fs, path, require, and 40+ other shimmed modules.' },
  { icon: '💾', title: 'Virtual Filesystem (VFS)', desc: 'Data files are written to an in-memory VFS at /data/. The API handler script is written to /app/server.js — all in the browser.' },
  { icon: '🔀', title: 'Node.js API handler', desc: 'server.js uses require(\'fs\') to read from VFS, parses routes, and returns JSON responses — exactly like a real Express handler.' },
  { icon: '⚛️', title: 'React + Vite frontend', desc: 'React components call apiRequest() which invokes container.execute() and renders the result. No HTTP requests leave the browser.' },
];

export default function About() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroAccent}>Node.js API</span> running in your browser
        </h1>
        <p className={styles.heroSub}>
          This app uses <a href="https://almostnode.dev" target="_blank" rel="noreferrer" className={styles.link}>AlmostNode</a> to
          execute real Node.js API code — with <code>fs</code>, <code>path</code>, and <code>require()</code> —
          entirely client-side, without any server.
        </p>
      </div>

      <div className={styles.arcWrap}>
        <h2 className={styles.arcTitle}>How it works</h2>
        <div className={styles.arcGrid}>
          {ARCHITECTURE.map((item) => (
            <div key={item.title} className={styles.arcCard}>
              <span className={styles.arcIcon}>{item.icon}</span>
              <div>
                <h3 className={styles.arcCardTitle}>{item.title}</h3>
                <p className={styles.arcCardDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.codeWrap}>
        <h2 className={styles.codeTitle}>Container setup</h2>
        <pre className={styles.codeBlock}><code>{CODE_CONTAINER}</code></pre>
      </div>

      <div className={styles.comparisonWrap}>
        <h2 className={styles.compTitle}>AlmostNode vs. Traditional API</h2>
        <div className={styles.compGrid}>
          <div className={styles.compCol}>
            <h3 className={styles.compColTitle}>🌐 Traditional API</h3>
            <ul className={styles.compList}>
              <li>Requires a running Node.js server</li>
              <li>Data fetched over HTTP</li>
              <li>Needs deployment infrastructure</li>
              <li>Network latency on every request</li>
              <li>Server must stay alive</li>
            </ul>
          </div>
          <div className={`${styles.compCol} ${styles.compColHighlight}`}>
            <h3 className={styles.compColTitle}>⚡ AlmostNode (this app)</h3>
            <ul className={styles.compList}>
              <li>Runs entirely in the browser</li>
              <li>Data read from virtual filesystem</li>
              <li>Zero deployment needed</li>
              <li>Sub-millisecond response time</li>
              <li>Works offline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
