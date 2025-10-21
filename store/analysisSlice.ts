/**
 * Analysis Slice - Handles chess position evaluation and blunder detection
 */

import { create } from 'zustand';
import type { Ply, EngineSnapshot, Blunder } from '@/lib/types';
import { getWorkerBridge } from '@/lib/worker-bridge';

interface AnalysisSlice {
  isAnalyzing: boolean;
  progress: number;
  evaluations: Map<number, { before: EngineSnapshot; after: EngineSnapshot }>;
  blunders: Blunder[];
  error: string | null;
  startAnalysis: (plies: Ply[], opts?: { depth?: number; movetime?: number }) => Promise<void>;
  stopAnalysis: () => void;
  reset: () => void;
}

export const useAnalysisSlice = create<AnalysisSlice>((set, get) => ({
  isAnalyzing: false,
  progress: 0,
  evaluations: new Map(),
  blunders: [],
  error: null,

  /**
   * Start analysis on a list of plies
   */
  startAnalysis: async (plies: Ply[], opts = {}) => {
    const { depth = 20, movetime } = opts;
    console.log('[Analysis] Starting analysis for', plies.length, 'plies with opts:', { depth, movetime });
    set({ isAnalyzing: true, progress: 0, error: null, evaluations: new Map(), blunders: [] });

    const bridge = getWorkerBridge();
    const evaluations = new Map<number, { before: EngineSnapshot; after: EngineSnapshot }>();
    const blunders: Blunder[] = [];

    try {
      for (let i = 0; i < plies.length; i++) {
        const ply = plies[i];
        console.log(`[Analysis] Evaluating ply ${i + 1}/${plies.length}: ${ply.san}`);

        // Evaluate position before the move
        console.log(`[Analysis] Evaluating fenBefore: ${ply.fenBefore}`);
        const evalBefore = await bridge.evaluateFen(ply.fenBefore, { depth, movetime });
        console.log(`[Analysis] evalBefore result:`, evalBefore);

        // Evaluate position after the move
        console.log(`[Analysis] Evaluating fenAfter: ${ply.fenAfter}`);
        const evalAfter = await bridge.evaluateFen(ply.fenAfter, { depth, movetime });
        console.log(`[Analysis] evalAfter result:`, evalAfter);

        // Store evaluations
        evaluations.set(i, { before: evalBefore, after: evalAfter });

        // Compute centipawn loss (CPL)
        const cpl = computeCPL(evalBefore, evalAfter, ply.side);

        // Detect blunders (CPL > 200 = blunder, > 100 = mistake, > 50 = inaccuracy)
        if (cpl > 50) {
          const severity =
            cpl > 200 ? 'blunder' : cpl > 100 ? 'mistake' : 'inaccuracy';

          blunders.push({
            plyIndex: i,
            ply,
            evalBefore,
            evalAfter,
            cpLoss: cpl,
            bestMove: evalBefore.bestMove,
            severity,
          });
        }

        // Update progress
        const progress = Math.round(((i + 1) / plies.length) * 100);
        set({ progress, evaluations: new Map(evaluations), blunders: [...blunders] });
      }

      set({ isAnalyzing: false, progress: 100 });
    } catch (err: any) {
      set({ isAnalyzing: false, error: err.message || 'Analysis failed' });
    }
  },

  /**
   * Stop the current analysis
   */
  stopAnalysis: () => {
    const bridge = getWorkerBridge();
    bridge.stop();
    set({ isAnalyzing: false });
  },

  /**
   * Reset analysis state
   */
  reset: () => {
    set({
      isAnalyzing: false,
      progress: 0,
      evaluations: new Map(),
      blunders: [],
      error: null,
    });
  },
}));

/**
 * Compute centipawn loss (CPL) from the mover's perspective
 */
function computeCPL(
  evalBefore: EngineSnapshot,
  evalAfter: EngineSnapshot,
  side: 'W' | 'B'
): number {
  // Convert scores to centipawns from the mover's perspective
  const cpBefore = getCP(evalBefore, side);
  const cpAfter = getCP(evalAfter, side === 'W' ? 'B' : 'W'); // After move, it's opponent's turn

  // CPL is the loss in evaluation: cpBefore - cpAfter
  const cpl = cpBefore - cpAfter;

  // Return absolute CPL (always positive)
  return Math.max(0, cpl);
}

/**
 * Get centipawn score from the given side's perspective
 */
function getCP(snapshot: EngineSnapshot, side: 'W' | 'B'): number {
  if (snapshot.isMate) {
    // Mate: return a large value (positive if winning, negative if losing)
    const mateValue = snapshot.score > 0 ? 10000 : -10000;
    return side === 'W' ? mateValue : -mateValue;
  }

  // Regular centipawn score (from White's perspective)
  return side === 'W' ? snapshot.score : -snapshot.score;
}
