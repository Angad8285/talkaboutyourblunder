/**
 * Zustand store for game state management
 */

import { create } from 'zustand'
import type { GameState, Blunder, EvaluationPoint, GameMetadata } from '@/lib/types'

interface GameStore extends GameState {
  // Actions
  setPgn: (pgn: string) => void
  setMetadata: (metadata: GameMetadata) => void
  setCurrentPosition: (fen: string) => void
  setCurrentMoveIndex: (index: number) => void
  setMoves: (moves: string[]) => void
  addEvaluation: (evaluation: EvaluationPoint) => void
  setEvaluations: (evaluations: EvaluationPoint[]) => void
  addBlunder: (blunder: Blunder) => void
  setBlunders: (blunders: Blunder[]) => void
  toggleOrientation: () => void
  setIsAnalyzing: (analyzing: boolean) => void
  resetGame: () => void
}

const initialState: GameState = {
  pgn: '',
  metadata: {},
  positions: [],
  currentPosition: 'start',
  currentMoveIndex: 0,
  moves: [],
  evaluations: [],
  blunders: [],
  orientation: 'white',
  isAnalyzing: false,
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPgn: (pgn) => set({ pgn }),

  setMetadata: (metadata) => set({ metadata }),

  setCurrentPosition: (fen) => set({ currentPosition: fen }),

  setCurrentMoveIndex: (index) => set({ currentMoveIndex: index }),

  setMoves: (moves) => set({ moves }),

  addEvaluation: (evaluation) =>
    set((state) => ({
      evaluations: [...state.evaluations, evaluation],
    })),

  setEvaluations: (evaluations) => set({ evaluations }),

  addBlunder: (blunder) =>
    set((state) => ({
      blunders: [...state.blunders, blunder],
    })),

  setBlunders: (blunders) => set({ blunders }),

  toggleOrientation: () =>
    set((state) => ({
      orientation: state.orientation === 'white' ? 'black' : 'white',
    })),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  resetGame: () => set(initialState),
}))
