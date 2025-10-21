// Minimal pthread worker bootstrap expected by Stockfish.js build when using multithreading.
// The lite build may still reference this path internally; we alias it here.
/* eslint-disable no-undef */
try {
  importScripts('/stockfish-17.1-lite-51f59da.js');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('[stockfish.worker.js shim] Failed to load engine in pthread worker:', err);
  throw err;
}
