/**
 * Stockfish WASM Engine Worker
 * Pure JavaScript worker for Stockfish communication
 */

let isReady = false;
let currentEvaluation = null;
let lastDepth = 0;
let lastScore = null;
let lastPv = [];

// Load Stockfish
importScripts('/stockfish.wasm.js');

// Handle Stockfish output
onmessage = function(e) {
  const msg = e.data;
  
  // Check if it's a string (Stockfish output)
  if (typeof msg === 'string') {
    handleStockfishOutput(msg);
    return;
  }
  
  // Otherwise it's a command from main thread
  handleMainThreadMessage(msg);
};

function handleStockfishOutput(line) {
  console.log('[Stockfish]:', line);

  if (line.includes('uciok')) {
    // Configure engine options
    postMessage('setoption name Threads value 1');
    postMessage('setoption name Hash value 32');
    postMessage('setoption name Use NNUE value true');
    postMessage('isready');
  } else if (line.includes('readyok')) {
    isReady = true;
    self.postMessage({ type: 'ready' });
  } else if (line.startsWith('info')) {
    parseInfoLine(line);
  } else if (line.startsWith('bestmove')) {
    handleBestMove(line);
  }
}

function parseInfoLine(line) {
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

function handleBestMove(line) {
  if (!currentEvaluation) return;

  const bestMoveMatch = line.match(/bestmove (\S+)/);
  const bestMove = bestMoveMatch ? bestMoveMatch[1] : '';

  // Send result
  const result = {
    type: 'result',
    fen: currentEvaluation.fen,
    depth: lastDepth,
    score: lastScore || { cp: 0 },
    pv: lastPv,
    bestMove,
  };

  self.postMessage(result);
  currentEvaluation = null;

  // Reset state
  lastDepth = 0;
  lastScore = null;
  lastPv = [];
}

function handleMainThreadMessage(msg) {
  const { type, fen, opts } = msg;

  switch (type) {
    case 'init':
      console.log('[Worker] Initializing Stockfish...');
      postMessage('uci');
      break;

    case 'evaluate':
      if (!isReady) {
        self.postMessage({ type: 'error', message: 'Engine not ready', fen });
        return;
      }

      currentEvaluation = { fen };
      lastDepth = 0;
      lastScore = null;
      lastPv = [];

      // Set position
      postMessage(`position fen ${fen}`);

      // Set multipv if specified
      if (opts && opts.multipv) {
        postMessage(`setoption name MultiPV value ${opts.multipv}`);
      }

      // Start search
      if (opts && opts.movetime) {
        postMessage(`go movetime ${opts.movetime}`);
      } else if (opts && opts.depth) {
        postMessage(`go depth ${opts.depth}`);
      } else {
        postMessage('go depth 15');
      }

      // Timeout after 30 seconds
      setTimeout(function() {
        if (currentEvaluation && currentEvaluation.fen === fen) {
          postMessage('stop');
          self.postMessage({ type: 'error', message: 'Evaluation timeout', fen });
          currentEvaluation = null;
        }
      }, 30000);
      break;

    case 'stop':
      postMessage('stop');
      if (currentEvaluation) {
        self.postMessage({ type: 'error', message: 'Evaluation stopped', fen: currentEvaluation.fen });
        currentEvaluation = null;
      }
      break;

    default:
      console.warn('Unknown worker message type:', type);
  }
}
