'use client'

import { useGameSlice } from '../../store/gameSlice';

export default function MoveList() {
  const { plies, selectedPly, setSelectedPly } = useGameSlice();

  if (plies.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Move List
        </h2>
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          No moves to display. Import a PGN to get started.
        </div>
      </div>
    );
  }

  const handleSelect = (idx: number) => setSelectedPly(idx);
  const handleFirst = () => setSelectedPly(0);
  const handlePrev = () => setSelectedPly(Math.max(0, selectedPly - 1));
  const handleNext = () => setSelectedPly(Math.min(plies.length - 1, selectedPly + 1));
  const handleLast = () => setSelectedPly(plies.length - 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Move List
      </h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {plies.map((ply, idx) => (
          <div
            key={idx}
            className={`
              flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
              ${idx === selectedPly 
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
            onClick={() => handleSelect(idx)}
          >
            <span className="text-sm font-mono text-slate-600 dark:text-slate-400 w-12">
              {ply.moveNumber}.{ply.side === 'B' ? '..' : ''}
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {ply.san}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors" onClick={handleFirst}>
          ⏮ First
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors" onClick={handlePrev}>
          ◀ Prev
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors" onClick={handleNext}>
          Next ▶
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors" onClick={handleLast}>
          Last ⏭
        </button>
      </div>
    </div>
  );
}
