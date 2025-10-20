'use client';

import PGNInput from './components/PGNInput';
import ChessBoard from './components/ChessBoard';
import MoveList from './components/MoveList';
import EvalGraph from './components/EvalGraph';
import AnalysisPanel from './components/AnalysisPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            ♟️ Chess Blunder Analyzer & AI Coach
          </h1>
          <p className="text-slate-600 mt-1">
            Analyze your games, detect blunders, and improve with AI coaching
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - PGN Input */}
          <div className="lg:col-span-1">
            <PGNInput />
          </div>

          {/* Middle Column - Board & Move List */}
          <div className="lg:col-span-1 space-y-6">
            <ChessBoard />
            <MoveList />
          </div>

          {/* Right Column - Eval Graph & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            <EvalGraph />
            <AnalysisPanel />
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            Built with Next.js, Stockfish WASM, and chess.js
          </p>
        </div>
      </footer>
    </div>
  );
}
