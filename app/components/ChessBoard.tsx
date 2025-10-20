'use client'

import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameSlice } from '../../store/gameSlice';

export default function ChessBoard() {
  const { plies, selectedPly } = useGameSlice();
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const fen = plies[selectedPly]?.fenAfter || 'start';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Board Position
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {fen}
        </div>
      </div>

      <div className="aspect-square w-full max-w-md mx-auto">
        <Chessboard
          position={fen}
          boardOrientation={orientation}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button
          className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                   text-slate-700 dark:text-slate-300 rounded-md transition-colors"
          onClick={() => setOrientation(orientation === 'white' ? 'black' : 'white')}
        >
          ↻ Flip Board
        </button>
      </div>
    </div>
  );
}
