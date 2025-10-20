import { Chess } from 'chess.js';
import type { Ply, GameMetadata, ParsedPGN } from './types';

/**
 * Clean PGN: normalize line endings, trim, ensure single blank line between headers and moves
 */
export function cleanPGN(pgn: string): string {
  let cleaned = pgn.replace(/\r\n|\r/g, '\n');
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/(\]\n)(\s*\n)+/g, '$1\n');
  return cleaned;
}

/**
 * Parse the FIRST game from a PGN string using chess.js for robust move parsing and FEN stepping.
 * Returns meta tags and plies. On error, returns error with failing move index.
 */
export function parsePgnToGameAnalysis(pgn: string): ParsedPGN {
  try {
    const cleanedPGN = cleanPGN(pgn);
    const chess = new Chess();
    chess.loadPgn(cleanedPGN); // loadPgn returns void in chess.js v1.x
    // Extract meta from chess.header()
    const rawMeta = chess.header();
    const meta: GameMetadata = {};
    for (const key in rawMeta) {
      // Convert keys to camelCase for consistency
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      if (rawMeta[key] != null) meta[camelKey] = rawMeta[key] as string;
    }
    // Extract plies
    const history = chess.history({ verbose: true });
    const plies: Ply[] = [];
    let chessReplay = new Chess();
    let moveNumber = 1;
    let side: 'W' | 'B' = 'W';
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const fenBefore = chessReplay.fen();
      const result = chessReplay.move(move);
      if (!result) {
        return {
          success: false,
          meta,
          plies,
          error: {
            message: `Parse error at move ${i + 1}: Invalid move: ${move.san}`,
            failingMoveIndex: i,
          },
        };
      }
      const fenAfter = chessReplay.fen();
      plies.push({
        plyIndex: i,
        moveNumber,
        side,
        san: move.san,
        uci: move.from + move.to + (move.promotion ? move.promotion : ''),
        fenBefore,
        fenAfter,
        // chess.js does not provide comments/NAGs, so leave undefined
      });
      if (side === 'B') moveNumber++;
      side = side === 'W' ? 'B' : 'W';
    }
    return { success: true, meta, plies };
  } catch (err) {
    return {
      success: false,
      meta: {},
      plies: [],
      error: { message: (err as Error).message, failingMoveIndex: -1 },
    };
  }
}
