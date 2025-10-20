# Project Structure

```
talkaboutyourblunder/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (main UI shell)
│   ├── globals.css               # Tailwind CSS imports
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI coaching endpoint (provider-agnostic stub)
│   └── components/               # React components
│       ├── PGNInput.tsx          # PGN paste/upload input
│       ├── ChessBoard.tsx        # Interactive chessboard (react-chessboard)
│       ├── MoveList.tsx          # Move navigation list
│       ├── EvalGraph.tsx         # Evaluation graph (Recharts)
│       └── AnalysisPanel.tsx     # Blunder list & AI coaching UI
│
├── lib/                          # Utilities
│   ├── types.ts                  # TypeScript types/interfaces
│   ├── chess.ts                  # chess.js wrapper utilities
│   └── pgn.ts                    # PGN parsing utilities
│
├── store/                        # State management
│   └── gameStore.ts              # Zustand store for game state
│
├── workers/                      # Web Workers
│   └── engine.worker.ts          # Stockfish WASM worker
│
├── fixtures/                     # Test data
│   └── sample.pgn                # Sample PGN for testing
│
├── tests/                        # Jest tests
│   ├── setup.ts                  # Jest configuration
│   └── pgn.test.ts               # PGN utility tests
│
├── public/                       # Static assets
│   ├── .gitkeep                  # Placeholder
│   ├── sample.pgn                # Public sample PGN
│   ├── stockfish.wasm            # ⚠️ YOU MUST ADD THIS
│   └── stockfish.wasm.js         # ⚠️ YOU MUST ADD THIS
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.mjs               # Next.js config (WASM support)
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
├── jest.config.js                # Jest config
├── .eslintrc.json                # ESLint config
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
└── README.md                     # Documentation
```

## Key Features

### 1. PGN Input (`PGNInput.tsx`)
- Textarea for pasting PGN notation
- "Load Sample" button
- "Analyze Game" button (disabled when empty)
- Validation and error handling

### 2. Chess Board (`ChessBoard.tsx`)
- Interactive board using react-chessboard
- Board orientation toggle
- Connected to Zustand store

### 3. Move List (`MoveList.tsx`)
- Scrollable list of moves
- Navigation controls (First, Prev, Next, Last)
- Highlights current move

### 4. Evaluation Graph (`EvalGraph.tsx`)
- Recharts line chart
- X-axis: Move number
- Y-axis: Evaluation (-10 to +10)
- Reference line at 0

### 5. Analysis Panel (`AnalysisPanel.tsx`)
- Blunder cards with severity badges
- "Get AI Coaching" button
- Empty state

### 6. State Management (`gameStore.ts`)
- Zustand store
- Game state (PGN, positions, evaluations, blunders)
- Actions for updating state

### 7. API Route (`/api/chat/route.ts`)
- Provider-agnostic stub
- Ready for OpenAI, Anthropic, Google, etc.
- GET endpoint for health check
- POST endpoint for coaching

### 8. Stockfish Worker (`engine.worker.ts`)
- Loads Stockfish WASM
- UCI protocol communication
- Position analysis
- Best move calculation

## Next Steps

1. **Install dependencies**: `npm install` or `pnpm install`
2. **Download Stockfish WASM** and place in `/public`
3. **Run dev server**: `npm run dev`
4. **Configure API key** in `.env.local` (optional)
5. **Implement analysis logic** in `page.tsx`

## Notes

- All TypeScript errors will resolve after `npm install`
- Stockfish WASM is required for engine analysis
- AI coaching is stubbed - configure your LLM provider
- Tests can be run with `npm test`
