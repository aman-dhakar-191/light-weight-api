/**
 * almostnode/container.js
 *
 * Creates and exports a singleton AlmostNode container that runs a
 * lightweight Node.js API entirely inside the browser.
 *
 * The container's virtual filesystem (VFS) is pre-populated with the
 * project's data files (products.json, users.json) so the in-browser
 * Node.js API can read them just like a real Node.js server would.
 */
import { createContainer } from 'almostnode';
import productsData from '@data/products.json';
import usersData from '@data/users.json';

// ── API server script that runs inside AlmostNode ─────────────────────────────
// This is standard Node.js code – require(), fs, path all work here.
const API_SERVER_SCRIPT = `
const fs   = require('fs');
const path = require('path');

/**
 * Lightweight router: parses a route string like "GET /api/products/3"
 * and dispatches to the right handler.
 */
function handle(route) {
  const [method, rawPath] = route.split(' ');
  const parts = rawPath.split('/').filter(Boolean); // ['api', 'products', '3?q=foo']
  const base  = parts[1];          // 'products' | 'users'
  const idStr = parts[2]?.split('?')[0]; // optional id segment

  if (method !== 'GET') {
    return { status: 405, body: { success: false, message: 'Method Not Allowed' } };
  }

  try {
    if (base === 'products') {
      const products = JSON.parse(fs.readFileSync('/data/products.json', 'utf8'));
      if (idStr) {
        const product = products.find(p => p.id === Number(idStr));
        if (!product) return { status: 404, body: { success: false, message: 'Product not found' } };
        return { status: 200, body: { success: true, data: product } };
      }
      return { status: 200, body: { success: true, count: products.length, data: products } };
    }

    if (base === 'users') {
      const users = JSON.parse(fs.readFileSync('/data/users.json', 'utf8'));
      if (idStr) {
        const user = users.find(u => u.id === Number(idStr));
        if (!user) return { status: 404, body: { success: false, message: 'User not found' } };
        return { status: 200, body: { success: true, data: user } };
      }
      return { status: 200, body: { success: true, count: users.length, data: users } };
    }

    if (base === 'health') {
      return { status: 200, body: { success: true, status: 'ok', runtime: 'AlmostNode (browser)', timestamp: new Date().toISOString() } };
    }

    return { status: 404, body: { success: false, message: 'Route not found' } };
  } catch (err) {
    return { status: 500, body: { success: false, message: err.message } };
  }
}

module.exports = { handle };
`;

// ── Initialise container ──────────────────────────────────────────────────────

let _container = null;
const _logs = [];

function getContainer() {
  if (_container) return _container;

  _container = createContainer({
    cwd: '/app',
    env: { NODE_ENV: 'production' },
    onConsole: (method, args) => {
      const line = `[${method.toUpperCase()}] ${args.join(' ')}`;
      _logs.push({ time: new Date().toISOString(), level: method, message: args.join(' ') });
      console.log('[AlmostNode]', line);
    },
  });

  const { vfs } = _container;

  // 1. Write data files to VFS (mirrors the project's /data folder)
  vfs.mkdirSync('/data', { recursive: true });
  vfs.writeFileSync('/data/products.json', JSON.stringify(productsData, null, 2));
  vfs.writeFileSync('/data/users.json',    JSON.stringify(usersData,    null, 2));

  // 2. Write the API server script to VFS
  vfs.mkdirSync('/app', { recursive: true });
  vfs.writeFileSync('/app/server.js', API_SERVER_SCRIPT);

  return _container;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Calls an in-browser "GET /api/..." route handled by AlmostNode.
 * Returns { status, body, logs }.
 */
export async function apiRequest(path) {
  const container = getContainer();
  const route = `GET ${path}`;

  // Execute the route in the AlmostNode container
  const result = container.execute(`
    const server = require('/app/server.js');
    const response = server.handle(${JSON.stringify(route)});
    module.exports = response;
  `);

  const response = result.exports;
  const newLogs  = [..._logs];
  _logs.length   = 0; // clear collected logs

  return { status: response.status, body: response.body, logs: newLogs };
}

/**
 * Returns the current AlmostNode VFS listing for the /data directory.
 */
export function listDataFiles() {
  const container = getContainer();
  const result    = container.execute(`
    const fs = require('fs');
    module.exports = fs.readdirSync('/data').map(name => {
      const content = fs.readFileSync('/data/' + name, 'utf8');
      const parsed  = JSON.parse(content);
      return { name, size: content.length, records: Array.isArray(parsed) ? parsed.length : 1 };
    });
  `);
  return result.exports;
}

/**
 * Reads a raw file from the VFS.
 */
export function readVfsFile(filePath) {
  const container = getContainer();
  const result    = container.execute(`
    const fs = require('fs');
    module.exports = fs.readFileSync(${JSON.stringify(filePath)}, 'utf8');
  `);
  return result.exports;
}
