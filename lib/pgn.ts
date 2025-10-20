/**
 * PGN parsing utilities using @mliebelt/pgn-parser
 */

import { parse } from '@mliebelt/pgn-parser'
import type { GameMetadata, Position } from './types'
import { Chess } from 'chess.js'

export function parsePGN(pgnString: string) {
  try {
    const games = parse(pgnString, { startRule: 'games' })
    return games
  } catch (error) {
    console.error('PGN parsing error:', error)
    throw new Error('Invalid PGN format')
  }
}

export function extractMetadata(pgn: string): GameMetadata {
  const metadata: GameMetadata = {}
  
  const headerPattern = /\[(\w+)\s+"([^"]+)"\]/g
  let match

  while ((match = headerPattern.exec(pgn)) !== null) {
    const [, key, value] = match
    switch (key) {
      case 'Event':
        metadata.event = value
        break
      case 'Site':
        metadata.site = value
        break
      case 'Date':
        metadata.date = value
        break
      case 'Round':
        metadata.round = value
        break
      case 'White':
        metadata.white = value
        break
      case 'Black':
        metadata.black = value
        break
      case 'Result':
        metadata.result = value
        break
      case 'WhiteElo':
        metadata.whiteElo = value
        break
      case 'BlackElo':
        metadata.blackElo = value
        break
      case 'TimeControl':
        metadata.timeControl = value
        break
      case 'ECO':
        metadata.eco = value
        break
      case 'Opening':
        metadata.opening = value
        break
    }
  }

  return metadata
}

export function extractPositions(pgn: string): Position[] {
  const chess = new Chess()
  const positions: Position[] = []

  try {
    chess.loadPgn(pgn)
    const history = chess.history({ verbose: true })
    
    chess.reset()
    positions.push({
      fen: chess.fen(),
      moveNumber: 0,
      move: 'start',
    })

    for (let i = 0; i < history.length; i++) {
      const move = history[i]
      chess.move(move.san)
      
      positions.push({
        fen: chess.fen(),
        moveNumber: i + 1,
        move: move.san,
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
      })
    }
  } catch (error) {
    console.error('Failed to extract positions:', error)
    throw new Error('Could not parse game positions')
  }

  return positions
}

export function validatePGN(pgnString: string): boolean {
  try {
    const chess = new Chess()
    chess.loadPgn(pgnString)
    return true
  } catch {
    return false
  }
}

export function cleanPGN(pgnString: string): string {
  // Remove comments and variations
  let cleaned = pgnString.replace(/\{[^}]*\}/g, '')
  cleaned = cleaned.replace(/\([^)]*\)/g, '')
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  return cleaned
}
