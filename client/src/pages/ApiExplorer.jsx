import { useState } from 'react';
import { apiRequest, listDataFiles, readVfsFile } from '../almostnode/container';
import styles from './ApiExplorer.module.css';

const ROUTES = [
  { label: 'GET /api/health',        path: '/api/health',        desc: 'Health check' },
  { label: 'GET /api/products',      path: '/api/products',      desc: 'All products' },
  { label: 'GET /api/products/1',    path: '/api/products/1',    desc: 'Single product (id=1)' },
  { label: 'GET /api/products/99',   path: '/api/products/99',   desc: '404 – product not found' },
  { label: 'GET /api/users',         path: '/api/users',         desc: 'All users' },
  { label: 'GET /api/users/2',       path: '/api/users/2',       desc: 'Single user (id=2)' },
];

function StatusBadge({ status }) {
  const ok  = status >= 200 && status < 300;
  const cls = ok ? styles.statusOk : styles.statusErr;
  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>;
}

export default function ApiExplorer() {
  const [selected, setSelected]   = useState(ROUTES[1]);
  const [loading,  setLoading]    = useState(false);
  const [response, setResponse]   = useState(null);
  const [timing,   setTiming]     = useState(null);
  const [files,    setFiles]      = useState(null);
  const [vfsView,  setVfsView]    = useState(null);

  async function handleRequest() {
    setLoading(true);
    setResponse(null);
    const t0 = performance.now();
    try {
      const res = await apiRequest(selected.path);
      setTiming(Math.round(performance.now() - t0));
      setResponse(res);
    } catch (err) {
      setResponse({ status: 500, body: { success: false, message: err.message } });
    }
    setLoading(false);
  }

  function handleListFiles() {
    try {
      const f = listDataFiles();
      setFiles(f);
      setVfsView(null);
    } catch (err) {
      setFiles([{ name: 'error', size: 0, records: 0, error: err.message }]);
    }
  }

  function handleViewFile(name) {
    try {
      const content = readVfsFile(`/data/${name}`);
      setVfsView({ name, content });
    } catch (err) {
      setVfsView({ name, content: `Error: ${err.message}` });
    }
  }

  return (
    <div className={styles.wrap}>
      {/* ── Left panel: route selector ───────────────────────────────── */}
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>API Routes</h2>
        <p className={styles.sidebarNote}>
          All requests run inside an <strong>AlmostNode</strong> container in the browser —
          no real server involved.
        </p>
        <ul className={styles.routeList}>
          {ROUTES.map((r) => (
            <li key={r.path}>
              <button
                className={`${styles.routeBtn} ${selected.path === r.path ? styles.routeBtnActive : ''}`}
                onClick={() => { setSelected(r); setResponse(null); }}
              >
                <span className={styles.method}>GET</span>
                <span className={styles.routePath}>{r.path}</span>
                <span className={styles.routeDesc}>{r.desc}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.vfsSection}>
          <h3 className={styles.vfsTitle}>Virtual Filesystem</h3>
          <button className={styles.vfsBtn} onClick={handleListFiles}>
            📂 List /data files
          </button>
          {files && (
            <ul className={styles.fileList}>
              {files.map((f) => (
                <li key={f.name}>
                  <button className={styles.fileBtn} onClick={() => handleViewFile(f.name)}>
                    <span>📄 {f.name}</span>
                    <span className={styles.fileMeta}>{f.records} records · {f.size}B</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Right panel: request / response ──────────────────────────── */}
      <div className={styles.main}>
        {/* Request bar */}
        <div className={styles.requestBar}>
          <span className={styles.methodTag}>GET</span>
          <code className={styles.urlInput}>{selected.path}</code>
          <button
            className={`${styles.sendBtn} ${loading ? styles.sendBtnLoading : ''}`}
            onClick={handleRequest}
            disabled={loading}
          >
            {loading ? '⏳ Running…' : '▶ Send'}
          </button>
        </div>

        {/* Response */}
        {response && (
          <div className={styles.responseWrap}>
            <div className={styles.responseHeader}>
              <StatusBadge status={response.status} />
              {timing !== null && (
                <span className={styles.timing}>⚡ {timing} ms · AlmostNode runtime</span>
              )}
            </div>
            <pre className={styles.responseBody}>
              {JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        )}

        {/* VFS file viewer */}
        {vfsView && (
          <div className={styles.responseWrap}>
            <div className={styles.responseHeader}>
              <span className={styles.vfsFileLabel}>📄 /data/{vfsView.name}</span>
              <button className={styles.closeBtn} onClick={() => setVfsView(null)}>✕</button>
            </div>
            <pre className={styles.responseBody}>{vfsView.content}</pre>
          </div>
        )}

        {!response && !vfsView && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚡</span>
            <p>Select a route and click <strong>Send</strong> to run it inside AlmostNode</p>
            <p className={styles.emptyNote}>
              The Node.js handler executes entirely in your browser using AlmostNode's
              virtual filesystem and Node.js shims.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
