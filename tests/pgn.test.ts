import { describe, it, expect } from '@jest/globals'
import { validatePGN, extractMetadata, cleanPGN } from '@/lib/pgn'

describe('PGN Utilities', () => {
  const samplePGN = `[Event "Test Game"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 1-0`

  describe('validatePGN', () => {
    it('should validate correct PGN', () => {
      expect(validatePGN(samplePGN)).toBe(true)
    })

    it('should reject invalid PGN', () => {
      expect(validatePGN('invalid pgn')).toBe(false)
    })
  })

  describe('extractMetadata', () => {
    it('should extract metadata from PGN headers', () => {
      const metadata = extractMetadata(samplePGN)
      
      expect(metadata.event).toBe('Test Game')
      expect(metadata.white).toBe('Player 1')
      expect(metadata.black).toBe('Player 2')
      expect(metadata.result).toBe('1-0')
    })

    it('should handle missing headers', () => {
      const minimal = '1. e4 e5'
      const metadata = extractMetadata(minimal)
      
      expect(metadata.event).toBeUndefined()
    })
  })

  describe('cleanPGN', () => {
    it('should remove comments', () => {
      const withComments = '1. e4 {good move} e5 2. Nf3'
      const cleaned = cleanPGN(withComments)
      
      expect(cleaned).not.toContain('{good move}')
    })

    it('should remove variations', () => {
      const withVariations = '1. e4 e5 (1... c5) 2. Nf3'
      const cleaned = cleanPGN(withVariations)
      
      expect(cleaned).not.toContain('(1... c5)')
    })
  })
})
