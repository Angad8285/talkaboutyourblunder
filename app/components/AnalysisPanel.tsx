
'use client'

import { useGameSlice } from '../../store/gameSlice'

export default function AnalysisPanel() {
  const { plies } = useGameSlice();
  // For demo, filter plies with a comment containing 'blunder' as mock blunders
  const blunders = plies.filter(ply => ply.comment?.toLowerCase().includes('blunder'));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Analysis & Blunders
      </h2>

      {blunders.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p>No blunders detected yet</p>
          <p className="text-xs mt-2">Analyze a game to find mistakes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blunders.map((blunder: typeof plies[0], index: number) => (
            <div
              key={index}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-md 
                       hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Move {blunder.moveNumber}
                </span>
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  blunder
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {blunder.comment || 'No description'}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                SAN: {blunder.san}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button 
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 
                   hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-md
                   transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={blunders.length === 0}
        >
          🤖 Get AI Coaching
        </button>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
          Receive personalized improvement suggestions
        </p>
      </div>
    </div>
  )
}
