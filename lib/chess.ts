/**
 * Chess.js wrapper utilities
 */

import { Chess } from 'chess.js'

export function createChessGame(fen?: string): Chess {
  if (fen) {
    return new Chess(fen)
  }
  return new Chess()
}

export function validateFEN(fen: string): boolean {
  try {
    const chess = new Chess(fen)
    return chess.fen() === fen
  } catch {
    return false
  }
}

export function makeMove(chess: Chess, move: string): boolean {
  try {
    const result = chess.move(move)
    return result !== null
  } catch {
    return false
  }
}

export function getAllLegalMoves(chess: Chess): string[] {
  return chess.moves()
}

export function isCheckmate(chess: Chess): boolean {
  return chess.isCheckmate()
}

export function isCheck(chess: Chess): boolean {
  return chess.isCheck()
}

export function isDraw(chess: Chess): boolean {
  return chess.isDraw()
}

export function getGameHistory(chess: Chess): string[] {
  return chess.history()
}

export function getPGN(chess: Chess): string {
  return chess.pgn()
}

export function getCurrentFEN(chess: Chess): string {
  return chess.fen()
}

export function resetGame(chess: Chess): void {
  chess.reset()
}

export function loadPGN(chess: Chess, pgn: string): boolean {
  try {
    chess.loadPgn(pgn)
    return true
  } catch (error) {
    console.error('Failed to load PGN:', error)
    return false
  }
}
