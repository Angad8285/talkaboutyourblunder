# Stockfish Analysis Implementation

## Overview
The Chess Blunder Analyzer now includes full Stockfish WASM engine integration for position evaluation and blunder detection.

## Components Implemented

### 1. Engine Worker (`workers/engine.worker.ts`)
- Loads Stockfish WASM engine
- Handles UCI communication protocol
- Evaluates chess positions with configurable depth/movetime
- Parses Stockfish output (info lines, scores, principal variations)
- Returns structured evaluation results

**Features:**
- Supports both centipawn and mate scores
- Configurable search depth or movetime
- Streams progress updates during analysis
- Timeout protection (10s max per position)

### 2. Worker Bridge (`lib/worker-bridge.ts`)
- Single-concurrency evaluation queue
- Health watchdog (5s timeout per evaluation)
- Automatic worker restart (up to 3 attempts)
- Promise-based API for easy integration
- Singleton pattern for global access

**API:**
```typescript
const bridge = getWorkerBridge();
const snapshot = await bridge.evaluateFen(fen, { depth: 20 });
```

### 3. Analysis Slice (`store/analysisSlice.ts`)
- Zustand state management for analysis
- Evaluates all positions (before/after each move)
- Computes centipawn loss (CPL) from mover's perspective
- Detects blunders, mistakes, and inaccuracies
- Tracks analysis progress (0-100%)

**Blunder Classification:**
- **Blunder**: CPL > 200 centipawns
- **Mistake**: CPL > 100 centipawns
- **Inaccuracy**: CPL > 50 centipawns

### 4. UI Integration

#### Analysis Panel (`app/components/AnalysisPanel.tsx`)
- "Run Analysis" button to start engine evaluation
- Real-time progress bar during analysis
- Displays detected blunders with severity badges
- Shows centipawn loss and best move suggestions
- Stop button to cancel running analysis

#### Evaluation Graph (`app/components/EvalGraph.tsx`)
- Displays position evaluations over time
- Updates automatically after analysis completes
- Shows evaluations from White's perspective
- Handles both centipawn and mate scores
- Visual reference line at 0.00 (equal position)

## Usage Flow

1. **Upload/Paste PGN**: User loads a chess game
2. **Click "Run Analysis"**: Triggers Stockfish evaluation
3. **Progress Updates**: Real-time progress bar (0-100%)
4. **Results Display**:
   - Evaluation Graph shows position scores
   - Analysis Panel lists blunders/mistakes
   - Each blunder shows CPL loss and best move

## Technical Details

### Engine Configuration
```javascript
Threads: 1
Hash: 32 MB
Use NNUE: true
Default Depth: 15 (configurable)
```

### Performance
- Single-threaded to avoid UI blocking
- Evaluates ~1-2 positions per second (depth 15)
- Queue-based to prevent concurrent evaluations
- Watchdog ensures no hangs

### Error Handling
- Worker timeout protection (5s per position)
- Automatic worker restart on failure
- User-friendly error messages
- Graceful degradation if engine unavailable

## Acceptance Criteria ✅

- [x] Load Stockfish WASM in web worker
- [x] UCI initialization with proper options
- [x] Position evaluation with structured results
- [x] Queue-based evaluation with health watchdog
- [x] CPL computation from mover's perspective
- [x] Blunder detection (blunder/mistake/inaccuracy)
- [x] Progress tracking (0-100%)
- [x] UI updates without freezing
- [x] Evaluation graph displays results
- [x] Analysis panel shows blunders

## Future Enhancements

1. **Multi-PV Analysis**: Show multiple best moves
2. **Opening Book**: Skip analysis for book moves
3. **Endgame Tablebase**: Perfect play in endgames
4. **Export Analysis**: Save as annotated PGN
5. **AI Coaching**: GPT-4 explanations for blunders
6. **Comparative Analysis**: Compare with other players
7. **Position Search**: Find similar positions
8. **Training Mode**: Practice avoiding blunders

## Notes

- Stockfish requires `stockfish.js` package installed
- Worker runs in separate thread (no UI blocking)
- Analysis can be stopped mid-evaluation
- Results persist until new analysis starts
- Compatible with all valid PGN files
