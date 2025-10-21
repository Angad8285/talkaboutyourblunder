
'use client'

import { useGameSlice } from '../../store/gameSlice'
import { useAnalysisSlice } from '../../store/analysisSlice'

export default function AnalysisPanel() {
  const { plies } = useGameSlice();
  const { isAnalyzing, progress, blunders, startAnalysis, stopAnalysis } = useAnalysisSlice();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Analysis & Blunders
      </h2>

      {isAnalyzing ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          <div className="text-4xl mb-2">⚙️</div>
          <p>Analyzing game...</p>
          <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-2">{progress}% complete</p>
          <button
            onClick={stopAnalysis}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Stop Analysis
          </button>
        </div>
      ) : blunders.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p>No blunders detected yet</p>
          <p className="text-xs mt-2">Analyze a game to find mistakes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blunders.map((blunder, index) => (
            <div
              key={index}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-md 
                       hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Move {blunder.ply.moveNumber}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  blunder.severity === 'blunder' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : blunder.severity === 'mistake'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {blunder.severity}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Loss: {blunder.cpLoss} centipawns
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                Played: {blunder.ply.san} | Best: {blunder.bestMove}
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
          disabled={plies.length === 0 || isAnalyzing}
          onClick={() => startAnalysis(plies, { depth: 15 })}
        >
          {isAnalyzing ? '⚙️ Analyzing...' : '🔍 Run Analysis'}
        </button>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
          {isAnalyzing ? 'This may take a few minutes...' : 'Analyze the game with Stockfish engine'}
        </p>
      </div>
    </div>
  )
}
