'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Chess } from 'chess.js'

export default function PGNInput() {
  const [error, setError] = useState<string | null>(null)
  const [inputPgn, setInputPgn] = useState('')
  
  const { setPgn, setMoves, setCurrentPosition, isAnalyzing, setIsAnalyzing } = useGameStore()

  const handlePgnChange = (value: string) => {
    setError(null)
    setInputPgn(value)
  }

  const handleLoadPgn = () => {
    try {
      const chess = new Chess()
      chess.loadPgn(inputPgn)
      
      const history = chess.history()
      setPgn(inputPgn)
      setMoves(history)
      setCurrentPosition('start')
      setError(null)
    } catch (err) {
      setError('Invalid PGN format. Please check and try again.')
    }
  }

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample.pgn')
      const samplePgn = await response.text()
      setInputPgn(samplePgn)
      
      const chess = new Chess()
      chess.loadPgn(samplePgn)
      
      const history = chess.history()
      setPgn(samplePgn)
      setMoves(history)
      setCurrentPosition('start')
      setError(null)
    } catch (err) {
      setError('Failed to load sample PGN')
    }
  }

  const isAnalyzeDisabled = !inputPgn.trim() || isAnalyzing

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Import Game
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="pgn-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Paste PGN Notation
          </label>
          <textarea
            id="pgn-input"
            value={inputPgn}
            onChange={(e) => handlePgnChange(e.target.value)}
            placeholder="[Event &quot;Sample Game&quot;]&#10;[White &quot;Player 1&quot;]&#10;[Black &quot;Player 2&quot;]&#10;&#10;1. e4 e5 2. Nf3 Nc6..."
            className="w-full h-64 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md 
                     bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     font-mono resize-none"
            disabled={isAnalyzing}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleLoadPgn}
            disabled={isAnalyzeDisabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 
                     text-white disabled:text-slate-500 font-medium py-2 px-4 rounded-md
                     transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Load PGN'}
          </button>

          <button
            onClick={handleLoadSample}
            disabled={isAnalyzing}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md
                     text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load Sample
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Paste PGN from chess.com, lichess.org, or any standard source</li>
            <li>Click &quot;Load Sample&quot; to see an example</li>
            <li>Analysis uses Stockfish WASM for accurate evaluation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
