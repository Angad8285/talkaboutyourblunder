# ♟️ Chess Blunder Analyzer & AI Coach

An MVP web application that analyzes chess games, detects blunders, and provides AI-powered coaching insights using Stockfish engine evaluation.

## 🚀 Features

- **PGN Import**: Paste PGN notation to load chess games
- **Blunder Detection**: Automatic detection using Stockfish WASM (NNUE)
- **Interactive Board**: Navigate through moves with react-chessboard
- **Evaluation Graph**: Visual representation of position evaluation over time
- **AI Coach**: Get contextual coaching advice (API-based, provider-agnostic)

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Chess Logic**: chess.js
- **PGN Parsing**: @mliebelt/pgn-parser
- **Board UI**: react-chessboard
- **Engine**: Stockfish WASM (NNUE) in Web Worker
- **Charts**: Recharts
- **API**: Next.js API Routes (provider-agnostic)

## 📋 Prerequisites

- Node.js 18+ or Bun/pnpm
- Stockfish WASM binary (see setup below)

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key (optional for AI coaching):

```
OPENAI_API_KEY=your_key_here
```

### 3. Stockfish WASM Setup

**Important**: Download the Stockfish WASM binary and place it in the `/public` folder.

#### Option A: Download Pre-built Binary

1. Visit [https://github.com/lichess-org/stockfish.wasm/releases](https://github.com/lichess-org/stockfish.wasm/releases)
2. Download `stockfish.wasm` (with NNUE support)
3. Place it in `/public/stockfish.wasm`
4. Also download `stockfish.wasm.js` (loader) to `/public/stockfish.wasm.js`

#### Option B: Build from Source

```bash
# Clone the repository
git clone https://github.com/lichess-org/stockfish.wasm.git
cd stockfish.wasm

# Build (requires Emscripten)
make build ARCH=wasm

# Copy to your project
cp stockfish.wasm /path/to/your/project/public/
cp stockfish.wasm.js /path/to/your/project/public/
```

### 4. Verify Stockfish Files

Ensure these files exist:
```
public/
  ├── stockfish.wasm          # The WASM binary
  └── stockfish.wasm.js       # The loader script (optional but recommended)
```

## 🚦 Running the App

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles + Tailwind
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # AI coaching endpoint (provider-agnostic)
│   └── components/
│       ├── PGNInput.tsx        # PGN paste/upload input
│       ├── ChessBoard.tsx      # Interactive board component
│       ├── EvalGraph.tsx       # Evaluation chart
│       ├── MoveList.tsx        # Move navigation
│       └── AnalysisPanel.tsx   # Blunder list & insights
├── lib/
│   ├── chess.ts                # Chess.js wrapper utilities
│   ├── pgn.ts                  # PGN parsing utilities
│   └── types.ts                # Shared TypeScript types
├── store/
│   └── gameStore.ts            # Zustand store for game state
├── workers/
│   └── engine.worker.ts        # Stockfish Web Worker
├── fixtures/
│   └── sample.pgn              # Sample PGN for testing
├── tests/
│   ├── pgn.test.ts             # PGN parsing tests
│   └── setup.ts                # Jest setup
└── public/
    ├── stockfish.wasm          # ⚠️ You must add this file
    └── stockfish.wasm.js       # ⚠️ You must add this file
```

## 🧪 Testing

```bash
npm test
# or
npm run test:watch
```

## 🎯 Usage

1. **Import a Game**: Paste PGN notation into the input field
2. **Analyze**: Click "Analyze" to start Stockfish evaluation
3. **Review**: Navigate through moves, see evaluation graph, and identify blunders
4. **Get Coaching**: Click on blunders to get AI-powered insights

## 🔮 Roadmap

- [ ] Opening book integration
- [ ] Multi-game batch analysis
- [ ] Export annotated PGN
- [ ] User accounts & game history
- [ ] Advanced filtering (by rating, time control, etc.)
- [ ] Spaced repetition for blunder training

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Note**: This is an MVP. Stockfish analysis can be CPU-intensive in the browser. Consider limiting analysis depth or implementing server-side analysis for production use.
