/**
 * Strict TypeScript contracts for Chess Blunder Analyzer
 */

// ============================================================================
// Core Chess Types
// ============================================================================

/**
 * Centipawn score from engine perspective (positive = advantage for side to move)
 */
export type Score = number;

/**
 * Half-move (ply) in a chess game
 * Index 0 = position after move 1 by White
 */
export interface Ply {
  /** Zero-based ply index (0 = first move by White) */
  plyIndex: number;
  /** Full move number (1-based, same for both White and Black moves in same turn) */
  moveNumber: number;
  /** Side that made this move */
  side: 'W' | 'B';
  /** Standard Algebraic Notation (e.g., "Nf3", "e4") */
  san: string;
  /** UCI format (e.g., "e2e4", "g1f3") */
  uci: string;
  /** FEN before this move was played */
  fenBefore: string;
  /** FEN after this move was played */
  fenAfter: string;
  /** Optional comment from PGN */
  comment?: string;
  /** Optional NAG (Numeric Annotation Glyph) codes */
  nags?: number[];
  /** Engine evaluation in centipawns (optional) */
  eval?: number;
}

/**
 * Engine evaluation snapshot for a position
 */
export interface EngineSnapshot {
  /** FEN of the position evaluated */
  fen: string;
  /** Evaluation score in centipawns (or mate distance if isMate is true) */
  score: Score;
  /** True if this is a mate score (score represents plies to mate) */
  isMate: boolean;
  /** Engine search depth */
  depth: number;
  /** Best move in UCI format */
  bestMove: string;
  /** Principal variation (sequence of best moves) */
  pv: string[];
  /** Timestamp of evaluation */
  timestamp: number;
}

/**
 * User-assigned or AI-generated label for a position/move
 */
export interface Label {
  /** Label type */
  type: 'blunder' | 'mistake' | 'inaccuracy' | 'good' | 'brilliant' | 'book' | 'forced';
  /** Explanation text */
  text: string;
  /** Optional severity (for blunders/mistakes) */
  severity?: number;
}

/**
 * Detected blunder with context
 */
export interface Blunder {
  /** Ply index where blunder occurred */
  plyIndex: number;
  /** The ply that was a blunder */
  ply: Ply;
  /** Evaluation before the blunder */
  evalBefore: EngineSnapshot;
  /** Evaluation after the blunder */
  evalAfter: EngineSnapshot;
  /** Centipawn loss (always positive) */
  cpLoss: number;
  /** Best move that should have been played */
  bestMove: string;
  /** Classification of the mistake */
  severity: 'blunder' | 'mistake' | 'inaccuracy';
  /** Optional AI explanation */
  explanation?: string;
}

/**
 * Complete game analysis result
 */
export interface GameAnalysis {
  /** All plies from the game */
  plies: Ply[];
  /** Engine evaluations for each position (indexed by ply) */
  evaluations: Map<number, EngineSnapshot>;
  /** Detected blunders/mistakes */
  blunders: Blunder[];
  /** Overall accuracy scores */
  accuracy: {
    white: number; // 0-100
    black: number; // 0-100
  };
  /** Analysis metadata */
  meta: {
    engineName: string;
    engineDepth: number;
    analyzedAt: number;
  };
}

/**
 * Chat interaction turn
 */
export interface ChatTurn {
  /** Turn ID */
  id: string;
  /** Role: user or assistant */
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** Optional context (e.g., ply being discussed) */
  context?: {
    plyIndex?: number;
    blunderIndex?: number;
  };
  /** Timestamp */
  timestamp: number;
}

// ============================================================================
// PGN Parsing Types
// ============================================================================

/**
 * PGN metadata (header tags)
 */
export interface GameMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  whiteElo?: string;
  blackElo?: string;
  timeControl?: string;
  eco?: string;
  opening?: string;
  // Allow any additional tags
  [key: string]: string | undefined;
}

/**
 * Result of parsing a PGN string
 */
export interface ParsedPGN {
  /** Success flag */
  success: boolean;
  /** Game metadata tags */
  meta: GameMetadata;
  /** Parsed plies (empty if failed) */
  plies: Ply[];
  /** Error details if parsing failed */
  error?: {
    message: string;
    /** Index of the first move that failed to parse (-1 if header error) */
    failingMoveIndex: number;
  };
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Game slice state (Zustand store)
 */
export interface GameState {
  /** Raw PGN string */
  pgn: string;
  /** Parsed game metadata */
  meta: GameMetadata;
  /** All plies from the game */
  plies: Ply[];
  /** Currently selected ply index (-1 = start position) */
  selectedPlyIndex: number;
  /** Currently displayed FEN */
  currentFen: string;
  /** Board orientation */
  orientation: 'white' | 'black';
  /** Analysis results (if game has been analyzed) */
  analysis: GameAnalysis | null;
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
  /** Analysis progress (0-100) */
  analysisProgress: number;
}

/**
 * Stockfish worker message types
 */
export interface StockfishMessage {
  type: 'ready' | 'evaluation' | 'bestmove' | 'info' | 'error' | 'progress';
  data?: any;
  fen?: string;
  score?: Score;
  isMate?: boolean;
  depth?: number;
  bestMove?: string;
  pv?: string[];
  progress?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
