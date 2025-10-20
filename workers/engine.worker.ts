/**
 * Stockfish Web Worker
 * Handles chess engine communication in a separate thread
 */

import type { StockfishMessage } from '@/lib/types'

let stockfish: any = null
let isReady = false

// Initialize Stockfish WASM
async function initStockfish() {
  try {
    // Check if running in a browser environment
    if (typeof self === 'undefined') {
      throw new Error('Worker must run in browser context')
    }

    // Load Stockfish WASM
    // NOTE: This requires stockfish.wasm.js to be placed in /public folder
    // Download from: https://github.com/lichess-org/stockfish.wasm/releases
    
    // Dynamic import will fail if file doesn't exist
    // @ts-ignore - Dynamic import of WASM module
    const stockfishModule = await import('/stockfish.wasm.js')
    
    stockfish = await stockfishModule.default()
    
    stockfish.addMessageListener((line: string) => {
      handleEngineOutput(line)
    })

    // Initialize UCI protocol
    stockfish.postMessage('uci')
    
  } catch (error) {
    console.error('Failed to initialize Stockfish:', error)
    self.postMessage({
      type: 'error',
      data: 'Failed to load Stockfish engine. Please download stockfish.wasm and stockfish.wasm.js from https://github.com/lichess-org/stockfish.wasm/releases and place them in the /public folder.',
    } as StockfishMessage)
  }
}

function handleEngineOutput(line: string) {
  if (line === 'uciok') {
    isReady = true
    self.postMessage({ type: 'ready' } as StockfishMessage)
    return
  }

  if (line.startsWith('info')) {
    parseInfoLine(line)
    return
  }

  if (line.startsWith('bestmove')) {
    const parts = line.split(' ')
    const bestMove = parts[1]
    self.postMessage({
      type: 'bestmove',
      bestMove,
    } as StockfishMessage)
    return
  }
}

function parseInfoLine(line: string) {
  const depthMatch = line.match(/depth (\d+)/)
  const scoreMatch = line.match(/score cp (-?\d+)/)
  const mateMatch = line.match(/score mate (-?\d+)/)
  const pvMatch = line.match(/pv (.+)/)

  if (depthMatch && (scoreMatch || mateMatch)) {
    const depth = parseInt(depthMatch[1])
    const evaluation = scoreMatch ? parseInt(scoreMatch[1]) / 100 : undefined
    const mate = mateMatch ? parseInt(mateMatch[1]) : undefined
    const pv = pvMatch ? pvMatch[1] : undefined

    self.postMessage({
      type: 'info',
      depth,
      evaluation,
      mate,
      pv,
    } as StockfishMessage)
  }
}

// Handle messages from main thread
self.onmessage = async (event) => {
  const { command, fen, depth = 20 } = event.data

  switch (command) {
    case 'init':
      await initStockfish()
      break

    case 'analyze':
      if (!stockfish || !isReady) {
        self.postMessage({
          type: 'error',
          data: 'Engine not ready',
        } as StockfishMessage)
        return
      }

      // Set position and analyze
      stockfish.postMessage(`position fen ${fen}`)
      stockfish.postMessage(`go depth ${depth}`)
      break

    case 'stop':
      if (stockfish) {
        stockfish.postMessage('stop')
      }
      break

    case 'quit':
      if (stockfish) {
        stockfish.postMessage('quit')
        stockfish = null
        isReady = false
      }
      break

    default:
      console.warn('Unknown command:', command)
  }
}

// Export for TypeScript
export {}
