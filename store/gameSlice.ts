import { create } from 'zustand';
import type { GameAnalysis, Ply, Score, Label, Blunder, ChatTurn } from '@/lib/types';

interface GameSlice {
  pgn: string;
  meta: GameAnalysis['meta'];
  plies: Ply[];
  selectedPly: number;
  error: string | null;
  setPGN: (pgn: string) => void;
  setMeta: (meta: GameAnalysis['meta']) => void;
  setPlies: (plies: Ply[]) => void;
  setSelectedPly: (ply: number) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useGameSlice = create<GameSlice>((set) => ({
  pgn: '',
  meta: { engineName: '', engineDepth: 0, analyzedAt: 0 },
  plies: [],
  selectedPly: 0,
  error: null,
  setPGN: (pgn) => set({ pgn }),
  setMeta: (meta) => set({ meta }),
  setPlies: (plies) => set({ plies }),
  setSelectedPly: (selectedPly) => set({ selectedPly }),
  setError: (error) => set({ error }),
  reset: () => set({ pgn: '', meta: { engineName: '', engineDepth: 0, analyzedAt: 0 }, plies: [], selectedPly: 0, error: null }),
}));
