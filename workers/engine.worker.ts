/**
 * Stockfish WASM Engine Worker
 * Loads Stockfish and handles UCI communication for position evaluation
 */

// Declare importScripts for TypeScript
declare function importScripts(...urls: string[]): void;

let stockfish: any = null;
let isReady = false;
let currentEvaluation: {
  fen: string;
  resolve: (result: any) => void;
  reject: (err: Error) => void;
} | null = null;

// Stockfish output parser state
let lastDepth = 0;
let lastScore: { cp?: number; mate?: number } | null = null;
let lastPv: string[] = [];

/**
 * Load Stockfish WASM
 */
function loadStockfish() {
  try {
  console.log('[Worker] Loading Stockfish from /stockfish-17.1-lite-51f59da.js');
  // Load Stockfish using importScripts (works in web workers)
  importScripts('/stockfish-17.1-lite-51f59da.js');
  console.log('[Worker] Stockfish script loaded');
    
    // Initialize Stockfish
    // @ts-ignore
    if (typeof Stockfish === 'function') {
      console.log('[Worker] Stockfish function found, initializing...');
      // @ts-ignore
      stockfish = Stockfish();
      console.log('[Worker] Stockfish instance created');
      
      // Set up message handler
      if (stockfish.addMessageListener) {
        stockfish.addMessageListener((line: string) => {
          handleStockfishOutput(line);
        });
      } else if (stockfish.onmessage !== undefined) {
        stockfish.onmessage = (line: string) => {
          handleStockfishOutput(line);
        };
      } else {
        // Fallback: listen on global
        stockfish.listen = (callback: (line: string) => void) => {
          stockfish.onmessage = callback;
        };
        stockfish.listen(handleStockfishOutput);
      }

      // Initialize UCI
      stockfish.postMessage('uci');
      console.log('[Worker] Stockfish initialized, sent UCI command');
    } else {
      throw new Error('Stockfish not available');
    }
  } catch (err) {
    console.error('[Worker] Failed to load Stockfish:', err);
    self.postMessage({ type: 'error', message: 'Failed to load Stockfish engine: ' + (err as Error).message });
  }
}

/**
 * Handle Stockfish output
 */
function handleStockfishOutput(line: string) {
  console.log('[Stockfish]:', line);

  if (line.includes('uciok')) {
    // Configure engine options
  // Set only supported options for Stockfish 17.1 lite
  stockfish.postMessage('setoption name Threads value 1');
  stockfish.postMessage('setoption name Hash value 16');
  // Remove UseNNUE (not needed for lite build)
  stockfish.postMessage('isready');
  } else if (line.includes('readyok')) {
    isReady = true;
    self.postMessage({ type: 'ready' });
  } else if (line.startsWith('info')) {
    parseInfoLine(line);
  } else if (line.startsWith('bestmove')) {
    handleBestMove(line);
  }
}

/**
 * Parse 'info' lines from Stockfish
 */
function parseInfoLine(line: string) {
  const depthMatch = line.match(/depth (\d+)/);
  const cpMatch = line.match(/score cp (-?\d+)/);
  const mateMatch = line.match(/score mate (-?\d+)/);
  const pvMatch = line.match(/pv (.+)/);

  if (depthMatch) {
    lastDepth = parseInt(depthMatch[1], 10);
  }

  if (cpMatch) {
    lastScore = { cp: parseInt(cpMatch[1], 10) };
  } else if (mateMatch) {
    lastScore = { mate: parseInt(mateMatch[1], 10) };
  }

  if (pvMatch) {
    lastPv = pvMatch[1].split(' ');
  }

  // Send progress updates
  if (currentEvaluation && lastDepth > 0) {
    self.postMessage({
      type: 'progress',
      fen: currentEvaluation.fen,
      depth: lastDepth,
      score: lastScore,
      pv: lastPv,
    });
  }
}

/**
 * Handle 'bestmove' output
 */
function handleBestMove(line: string) {
  if (!currentEvaluation) return;

  const bestMoveMatch = line.match(/bestmove (\S+)/);
  const bestMove = bestMoveMatch ? bestMoveMatch[1] : '';

  // Resolve the current evaluation
  const result = {
    type: 'result',
    fen: currentEvaluation.fen,
    depth: lastDepth,
    score: lastScore || { cp: 0 },
    pv: lastPv,
    bestMove,
  };

  currentEvaluation.resolve(result);
  currentEvaluation = null;

  // Reset state
  lastDepth = 0;
  lastScore = null;
  lastPv = [];
}

/**
 * Evaluate a FEN position
 */
function evaluate(fen: string, opts: { movetime?: number; depth?: number; multipv?: number }) {
  return new Promise((resolve, reject) => {
    if (!isReady) {
      reject(new Error('Engine not ready'));
      return;
    }

    currentEvaluation = { fen, resolve, reject };

    // Set position
    stockfish.postMessage(`position fen ${fen}`);

    // Set multipv if specified
    if (opts.multipv) {
      stockfish.postMessage(`setoption name MultiPV value ${opts.multipv}`);
    }

    // Start search
    if (opts.movetime) {
      stockfish.postMessage(`go movetime ${opts.movetime}`);
    } else if (opts.depth) {
      stockfish.postMessage(`go depth ${opts.depth}`);
    } else {
      // Default: depth 20
      stockfish.postMessage('go depth 20');
    }

    // Timeout after 10 seconds
    setTimeout(() => {
      if (currentEvaluation && currentEvaluation.fen === fen) {
        stockfish.postMessage('stop');
        reject(new Error('Evaluation timeout'));
        currentEvaluation = null;
      }
    }, 10000);
  });
}

/**
 * Handle messages from main thread
 */
self.onmessage = (e: MessageEvent) => {
  const { type, fen, opts } = e.data;
  console.log('[Worker] Received message:', type, fen ? `FEN: ${fen.substring(0, 20)}...` : '');

  switch (type) {
    case 'init':
      console.log('[Worker] Init requested');
      loadStockfish();
      break;

    case 'evaluate':
      console.log('[Worker] Evaluate requested');
      evaluate(fen, opts || {})
        .then((result) => {
          console.log('[Worker] Evaluation complete, sending result');
          self.postMessage(result);
        })
        .catch((err: any) => {
          console.error('[Worker] Evaluation error:', err);
          self.postMessage({ type: 'error', message: err.message, fen });
        });
      break;

    case 'stop':
      console.log('[Worker] Stop requested');
      if (stockfish) {
        stockfish.postMessage('stop');
      }
      if (currentEvaluation) {
        currentEvaluation.reject(new Error('Evaluation stopped'));
        currentEvaluation = null;
      }
      break;

    default:
      console.warn('[Worker] Unknown message type:', type);
  }
};

// Export for TypeScript
export {}
