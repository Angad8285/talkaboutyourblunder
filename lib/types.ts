/**
 * Shared TypeScript types for the Chess Blunder Analyzer
 */

export interface GameMetadata {
  event?: string
  site?: string
  date?: string
  round?: string
  white?: string
  black?: string
  result?: string
  whiteElo?: string
  blackElo?: string
  timeControl?: string
  eco?: string
  opening?: string
}

export interface Position {
  fen: string
  moveNumber: number
  move: string
  evaluation?: number
  isBlunder?: boolean
  isCheck?: boolean
  isCheckmate?: boolean
}

export interface Blunder {
  moveNumber: number
  move: string
  player: 'white' | 'black'
  severity: 'blunder' | 'mistake' | 'inaccuracy'
  evalBefore: number
  evalAfter: number
  evalDrop: number
  bestMove?: string
  description: string
}

export interface EvaluationPoint {
  move: number
  eval: number
  mate?: number
}

export interface EngineAnalysis {
  fen: string
  evaluation: number
  mate?: number
  depth: number
  bestMove?: string
  pv?: string[] // Principal variation
}

export interface GameState {
  pgn: string
  metadata: GameMetadata
  positions: Position[]
  currentPosition: string
  currentMoveIndex: number
  moves: string[]
  evaluations: EvaluationPoint[]
  blunders: Blunder[]
  orientation: 'white' | 'black'
  isAnalyzing: boolean
}

export interface StockfishMessage {
  type: 'ready' | 'evaluation' | 'bestmove' | 'info' | 'error'
  data?: any
  fen?: string
  evaluation?: number
  mate?: number
  depth?: number
  bestMove?: string
  pv?: string
}
