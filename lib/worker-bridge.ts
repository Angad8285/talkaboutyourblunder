/**
 * Worker Bridge for Stockfish Engine
 * Single-concurrency queue with health watchdog
 */

import type { EngineSnapshot } from './types';

interface EvaluationRequest {
  fen: string;
  opts: { movetime?: number; depth?: number; multipv?: number };
  resolve: (result: EngineSnapshot) => void;
  reject: (err: Error) => void;
  timestamp: number;
}

class WorkerBridge {
  private worker: Worker | null = null;
  private isReady = false;
  private queue: EvaluationRequest[] = [];
  private currentRequest: EvaluationRequest | null = null;
  private watchdogTimer: NodeJS.Timeout | null = null;
  private restartCount = 0;
  private maxRestarts = 3;
  // Track latest evaluation reported by engine
  private lastDepth = 0;
  private lastScore: { cp?: number; mate?: number } | null = null;
  private lastPv: string[] = [];

  constructor() {
    this.initWorker();
  }

  /**
   * Initialize the worker
   */
  private initWorker() {
    console.log('[WorkerBridge] Initializing Stockfish WASM worker...');
    // Helpful diagnostics: SAB requires cross-origin isolated context
    try {
      if (typeof (globalThis as any).crossOriginIsolated !== 'undefined' && !(globalThis as any).crossOriginIsolated) {
        console.warn('[WorkerBridge] Page is NOT crossOriginIsolated. SharedArrayBuffer will be unavailable. Ensure COOP/COEP headers are set.');
      }
    } catch {}
    try {
  // Use the Stockfish 17.1 lite wasm worker directly. It expects string commands
  // Ensure the file exists in /public as: stockfish-17.1-lite-51f59da.js
  this.worker = new Worker('/stockfish-17.1-lite-51f59da.js');
      console.log('[WorkerBridge] Worker created successfully');

      this.worker.onmessage = (e: MessageEvent) => {
        const data = e.data as string;
        // stockfish posts plain strings like 'info ...', 'uciok', 'readyok', 'bestmove ...'
        this.handleEngineLine(typeof data === 'string' ? data : '');
      };

      this.worker.onerror = (err: ErrorEvent) => {
        console.error('[WorkerBridge] Worker error:', err);
        this.handleWorkerError(new Error(err.message));
      };

      // Kick off UCI handshake
      this.post('uci');
    } catch (err) {
      console.error('[WorkerBridge] Failed to create worker:', err);
      this.isReady = false;
    }
  }

  /**
   * Send a command string to the engine
   */
  private post(cmd: string) {
    console.log('[Engine] Sending command:', cmd); // Debug: show what we send
    this.worker?.postMessage(cmd);
  }

  /**
   * Handle a single line coming from the engine
   */
  private handleEngineLine(line: string) {
    if (!line) return;
    console.log('[Engine]', line); // Debug: show all engine output
    if (line === 'uciok') {
      // set engine options (this older Stockfish doesn't support NNUE)
      this.post('setoption name Threads value 1');
      // Use a conservative Hash value that all builds accept
      this.post('setoption name Hash value 16');
      // Removed: Use NNUE - not supported by this Stockfish build
      this.post('isready');
      return;
    }
    if (line === 'readyok' || line.includes('readyok')) {
      console.log('[WorkerBridge] Engine is ready!');
      this.isReady = true;
      this.restartCount = 0;
      this.processQueue();
      return;
    }
    if (line.startsWith('info')) {
      // parse depth / score / pv
      const depthMatch = line.match(/\bdepth (\d+)/);
      const cpMatch = line.match(/\bscore cp (-?\d+)/);
      const mateMatch = line.match(/\bscore mate (-?\d+)/);
      const pvMatch = line.match(/\bpv (.+)/);

      if (depthMatch) this.lastDepth = parseInt(depthMatch[1], 10);
      if (cpMatch) this.lastScore = { cp: parseInt(cpMatch[1], 10) };
      else if (mateMatch) this.lastScore = { mate: parseInt(mateMatch[1], 10) };
      if (pvMatch) this.lastPv = pvMatch[1].trim().split(/\s+/);
      return;
    }
    if (line.startsWith('bestmove')) {
      // Resolve with latest info
      this.clearWatchdog();
      if (this.currentRequest) {
        const bestMoveMatch = line.match(/bestmove (\S+)/);
        const result = {
          fen: this.currentRequest.fen,
          depth: this.lastDepth,
          score: this.lastScore || { cp: 0 },
          pv: this.lastPv || (bestMoveMatch ? [bestMoveMatch[1]] : []),
          bestMove: bestMoveMatch ? bestMoveMatch[1] : '',
        };
        const snapshot = this.parseResult(result);
        this.currentRequest.resolve(snapshot);
        this.currentRequest = null;
      }
      // reset latest info
      this.lastDepth = 0;
      this.lastScore = null;
      this.lastPv = [];
      // continue with queue
      this.processQueue();
      return;
    }
    // ignore other lines
  }

  /**
   * Handle messages from worker
   */
  // Deprecated path (kept for compatibility if wrapper worker is used). Not used with wasm worker.
  private handleWorkerMessage(_data: any) { /* no-op */ }

  /**
   * Parse worker result to EngineSnapshot
   */
  private parseResult(data: any): EngineSnapshot {
    const isMate = data.score && data.score.mate !== undefined;
    const score = isMate ? data.score.mate : (data.score?.cp ?? 0);
    return {
      fen: data.fen,
      score,
      isMate: !!isMate,
      depth: data.depth || 0,
      bestMove: data.bestMove || '',
      pv: data.pv || [],
      timestamp: Date.now(),
    };
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(err: Error) {
    this.clearWatchdog();

    if (this.currentRequest) {
      this.currentRequest.reject(err);
      this.currentRequest = null;
    }

    // Attempt restart
    if (this.restartCount < this.maxRestarts) {
      console.warn(`Restarting worker (attempt ${this.restartCount + 1}/${this.maxRestarts})`);
      this.restartCount++;
      this.restartWorker();
    } else {
      console.error('Max worker restarts reached. Engine unavailable.');
      // Reject all queued requests
      while (this.queue.length > 0) {
        const req = this.queue.shift();
        if (req) req.reject(new Error('Engine unavailable'));
      }
    }
  }

  /**
   * Restart the worker
   */
  private restartWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.initWorker();
  }

  /**
   * Start watchdog timer
   */
  private startWatchdog() {
    this.clearWatchdog();
    this.watchdogTimer = setTimeout(() => {
      console.error('Watchdog timeout: no response from worker');
      this.handleWorkerError(new Error('Worker timeout (no response in 5s)'));
    }, 5000);
  }

  /**
   * Clear watchdog timer
   */
  private clearWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Process the evaluation queue
   */
  private processQueue() {
    console.log('[WorkerBridge] processQueue called. isReady:', this.isReady, 'currentRequest:', !!this.currentRequest, 'queue length:', this.queue.length);
    if (!this.isReady || this.currentRequest || this.queue.length === 0) {
      return;
    }

    this.currentRequest = this.queue.shift()!;
    console.log('[WorkerBridge] Processing request for FEN:', this.currentRequest.fen);
    this.startWatchdog();
    // Send position and go commands to engine
    this.lastDepth = 0; this.lastScore = null; this.lastPv = [];
    const { fen, opts } = this.currentRequest;
    const multipv = opts.multipv ?? 1;
    this.post(`setoption name MultiPV value ${multipv}`);
    this.post(`position fen ${fen}`);
    if (opts.depth) this.post(`go depth ${opts.depth}`);
    else this.post(`go movetime ${opts.movetime ?? 1000}`);
  }

  /**
   * Evaluate a FEN position
   */
  public evaluateFen(
    fen: string,
    opts: { movetime?: number; depth?: number; multipv?: number } = {}
  ): Promise<EngineSnapshot> {
    return new Promise((resolve, reject) => {
      const request: EvaluationRequest = {
        fen,
        opts,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  /**
   * Stop current evaluation
   */
  public stop() {
    if (this.worker) this.post('stop');
    this.clearWatchdog();
    if (this.currentRequest) {
      this.currentRequest.reject(new Error('Evaluation stopped'));
      this.currentRequest = null;
    }
  }

  /**
   * Terminate the worker
   */
  public terminate() {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    // Reject all queued requests
    while (this.queue.length > 0) {
      const req = this.queue.shift();
      if (req) req.reject(new Error('Worker terminated'));
    }
  }
}

// Singleton instance
let bridge: WorkerBridge | null = null;

export function getWorkerBridge(): WorkerBridge {
  if (!bridge) {
    bridge = new WorkerBridge();
  }
  return bridge;
}

export function terminateWorkerBridge() {
  if (bridge) {
    bridge.terminate();
    bridge = null;
  }
}
