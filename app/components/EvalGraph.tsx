'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGameSlice } from '../../store/gameSlice'

export default function EvalGraph() {
  const { plies } = useGameSlice()

  // Build graph data from plies (if you have engine evals, add them here)
  const data = plies.map((ply, idx) => ({
    move: idx + 1,
    eval: typeof ply.eval === 'number' ? ply.eval : null,
    san: ply.san,
  })).filter(d => d.eval !== null)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Evaluation Graph
      </h2>

      {data.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-12">
          Run analysis to see position evaluations
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="move" 
                label={{ value: 'Move', position: 'insideBottom', offset: -5 }}
                stroke="#64748b"
              />
              <YAxis 
                label={{ value: 'Evaluation', angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
                domain={[-10, 10]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#fff',
                }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="eval" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Position Evaluation</span>
        </div>
        <div className="text-right">
          Positive = White advantage | Negative = Black advantage
        </div>
      </div>
    </div>
  )
}
