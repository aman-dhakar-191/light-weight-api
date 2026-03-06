/**
 * Browser shim for node:zlib
 * Uses pako (already bundled by almostnode) to provide browser-compatible
 * implementations of the Node.js zlib functions used by just-bash.
 */
import pako from 'pako';

export const constants = {
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
};

export function gunzipSync(buffer, _options) {
  return pako.ungzip(buffer);
}

export function gzipSync(buffer, options = {}) {
  return pako.gzip(buffer, { level: options.level });
}

export function deflateSync(buffer, options = {}) {
  return pako.deflate(buffer, { level: options.level });
}

export function inflateSync(buffer, _options) {
  return pako.inflate(buffer);
}

export default {
  constants,
  gunzipSync,
  gzipSync,
  deflateSync,
  inflateSync,
};
