'use client'

import { useGameStore } from '@/store/gameStore'

export default function MoveList() {
  const { moves, currentMoveIndex } = useGameStore()

  if (moves.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Move List
        </h2>
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          No moves to display. Import a PGN to get started.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Move List
      </h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {moves.map((move, index) => (
          <div
            key={index}
            className={`
              flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
              ${index === currentMoveIndex 
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            <span className="text-sm font-mono text-slate-600 dark:text-slate-400 w-12">
              {Math.floor(index / 2) + 1}.
              {index % 2 === 0 ? '' : '..'}
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {move}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors">
          ⏮ First
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors">
          ◀ Prev
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors">
          Next ▶
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-md transition-colors">
          Last ⏭
        </button>
      </div>
    </div>
  )
}
