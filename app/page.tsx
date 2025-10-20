'use client';

import PGNInput from '@/app/components/PGNInput';
import ChessBoard from '@/app/components/ChessBoard';
import MoveList from '@/app/components/MoveList';
import EvalGraph from '@/app/components/EvalGraph';
import AnalysisPanel from '@/app/components/AnalysisPanel';

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
                {/* PGN Input full width above all columns */}
                <div className="mb-8">
                    <PGNInput />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Evaluation Graph */}
                    <div className="lg:col-span-1 space-y-6">
                        <EvalGraph />
                    </div>

                    {/* Middle Column - Board */}
                    <div className="lg:col-span-1 space-y-6">
                        <ChessBoard />
                    </div>

                    {/* Right Column - Move List */}
                    <div className="lg:col-span-1 space-y-6">
                        <MoveList />
                    </div>
                </div>
                {/* AnalysisPanel full width below all columns */}
                <div className="mt-8">
                    <AnalysisPanel />
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
