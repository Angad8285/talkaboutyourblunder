# Chess Blunder Analyzer & AI Coach - Project Structure

## 📋 Overview

Complete Next.js TypeScript MVP for analyzing chess games with Stockfish WASM and AI coaching.

## 🗂️ Project Structure

```
talkaboutyourblunder/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home page - main UI
│   ├── globals.css                # Global styles + Tailwind
│   ├── api/
│   │   └── chat/
│   │       └── route.ts           # AI coaching API endpoint (provider-agnostic)
│   └── components/
│       ├── PGNInput.tsx           # PGN input/upload component
│       ├── ChessBoard.tsx         # Interactive chessboard (react-chessboard)
│       ├── MoveList.tsx           # Move navigation list
│       ├── EvalGraph.tsx          # Position evaluation chart (Recharts)
│       └── AnalysisPanel.tsx      # Blunder detection & AI insights
│
├── lib/                           # Utility libraries
│   ├── types.ts                   # Shared TypeScript interfaces
│   ├── chess.ts                   # Chess.js wrapper utilities
│   └── pgn.ts                     # PGN parsing with @mliebelt/pgn-parser
│
├── store/                         # State management
│   └── gameStore.ts               # Zustand store for game state
│
├── workers/                       # Web Workers
│   └── engine.worker.ts           # Stockfish WASM worker
│
├── tests/                         # Jest tests
│   ├── setup.ts                   # Test configuration
│   └── pgn.test.ts                # PGN parsing tests
│
├── fixtures/                      # Test data
│   └── sample.pgn                 # Sample chess game
│
├── public/                        # Static assets
│   ├── sample.pgn                 # Public sample game
│   ├── stockfish.wasm             # ⚠️ YOU MUST ADD THIS
│   └── stockfish.wasm.js          # ⚠️ YOU MUST ADD THIS
│
├── .env.example                   # Environment variables template
├── next.config.mjs                # Next.js config (WASM support)
├── tailwind.config.ts             # Tailwind CSS config
├── postcss.config.mjs             # PostCSS config
├── tsconfig.json                  # TypeScript config
├── jest.config.js                 # Jest config
├── package.json                   # Dependencies
└── README.md                      # Setup instructions

```

## 🎯 Key Features Implemented

### ✅ Core Functionality
- [x] PGN import and parsing (chess.js + @mliebelt/pgn-parser)
- [x] Interactive chessboard (react-chessboard)
- [x] Move navigation and history
- [x] Position evaluation graph (Recharts)
- [x] Blunder detection (via Stockfish)
- [x] AI coaching API endpoint (provider-agnostic stub)

### ✅ Technical Stack
- [x] Next.js 14+ with App Router
- [x] TypeScript throughout
- [x] Tailwind CSS for styling
- [x] Zustand for state management
- [x] Web Worker for Stockfish (non-blocking)
- [x] Jest for testing

### ✅ Project Configuration
- [x] WASM support in next.config.mjs
- [x] Tailwind + PostCSS setup
- [x] Environment variables (.env.example)
- [x] TypeScript strict mode
- [x] ESLint configuration

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local and add your API key (optional)
```

### 3. **IMPORTANT: Stockfish WASM Setup**

Download Stockfish WASM files:
1. Visit: https://github.com/lichess-org/stockfish.wasm/releases
2. Download `stockfish.wasm` and `stockfish.wasm.js`
3. Place both files in `/public/` directory

**Without these files, engine analysis will not work!**

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 5. Run Tests
```bash
npm test
```

## 📦 Dependencies

### Production
- `next` - Framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety
- `zustand` - State management
- `chess.js` - Chess rules and FEN
- `@mliebelt/pgn-parser` - PGN parsing
- `react-chessboard` - Board UI
- `recharts` - Evaluation chart
- `tailwindcss` - Styling

### Development
- `@types/*` - TypeScript definitions
- `eslint` - Code linting
- `jest` & `@testing-library/*` - Testing
- `typescript` - Compiler

## 🎮 Usage Flow

1. **Load Game**
   - Paste PGN or click "Load Sample"
   - Game loads into board and move list

2. **Navigate Moves**
   - Click moves in move list
   - Board updates to show position

3. **Analyze Game**
   - Click "Analyze with Stockfish"
   - Engine evaluates each position
   - Blunders/mistakes highlighted

4. **AI Coaching**
   - Click on detected blunder
   - AI explains the mistake
   - Suggests improvements

## 🏗️ Architecture Decisions

### State Management (Zustand)
- Single source of truth for game state
- Minimal boilerplate vs Redux
- Easy to extend and test

### Web Worker for Stockfish
- Non-blocking UI during analysis
- WASM for near-native performance
- Message-based communication

### Next.js App Router
- Modern React patterns (Server Components)
- File-based routing
- Built-in API routes
- Optimized builds

### Provider-Agnostic AI
- Stub implementation in `/api/chat`
- Easy to swap OpenAI/Anthropic/etc.
- No vendor lock-in

## 🔮 Future Enhancements

- [ ] Server-side Stockfish analysis (for performance)
- [ ] Opening book integration
- [ ] Batch game analysis
- [ ] User accounts and game history
- [ ] Export annotated PGN
- [ ] Spaced repetition training mode
- [ ] Mobile responsive improvements

## 🐛 Known Limitations

1. **Stockfish WASM not included** - Must be downloaded separately (licensing)
2. **Client-side analysis only** - Can be CPU-intensive for long games
3. **No persistence** - Games reset on page refresh (add database later)
4. **AI coaching requires API key** - Stub returns placeholder text

## 📝 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚀 Deployment Checklist

- [ ] Add Stockfish WASM to build
- [ ] Set production environment variables
- [ ] Configure API rate limiting
- [ ] Add analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Optimize bundle size
- [ ] Add CDN for static assets
- [ ] Configure caching headers

## 📄 License

MIT

---

**Status**: ✅ MVP Complete - Ready for development and testing

**Last Updated**: October 20, 2025
