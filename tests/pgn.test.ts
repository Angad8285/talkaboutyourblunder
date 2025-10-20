import { describe, it, expect } from '@jest/globals'
import { parsePgnToGameAnalysis } from '@/lib/pgn'

const samplePGN = `[Event "Test Game"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 1-0`

const minimalPGN = '1. e4 e5'
const withComments = '1. e4 {good move} e5 2. Nf3'
const withVariations = '1. e4 e5 (1... c5) 2. Nf3'

describe('PGN Parser', () => {
  it('should parse valid PGN and extract metadata', () => {
    const result = parsePgnToGameAnalysis(samplePGN)
    expect(result.meta.Event).toBe('Test Game')
    expect(result.meta.White).toBe('Player 1')
    expect(result.meta.Black).toBe('Player 2')
    expect(result.meta.Result).toBe('1-0')
    expect(result.plies.length).toBeGreaterThan(0)
    expect(result.error).toBeUndefined()
  })

  it('should handle minimal PGN', () => {
    const result = parsePgnToGameAnalysis(minimalPGN)
    expect(result.meta).toBeDefined()
    expect(result.plies.length).toBeGreaterThan(0)
    expect(result.error).toBeUndefined()
  })

  it('should remove comments from plies', () => {
    const result = parsePgnToGameAnalysis(withComments)
    for (const ply of result.plies) {
      expect(ply.san).not.toContain('{')
    }
  })

  it('should ignore variations in plies', () => {
    const result = parsePgnToGameAnalysis(withVariations)
    for (const ply of result.plies) {
      expect(ply.san).not.toContain('(')
    }
  })

  it('should set error for invalid PGN', () => {
    const result = parsePgnToGameAnalysis('invalid pgn')
    expect(result.error).toBeDefined()
  })
})
