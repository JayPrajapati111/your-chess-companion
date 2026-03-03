import { Board, PieceColor, PieceType, Position, getValidMoves, makeMove, isKingInCheck, isCheckmate, isStalemate, CastlingRights, createInitialCastlingRights } from "./chess";

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
};

const PAWN_TABLE = [
  [0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],
  [5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],
  [5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0],
];
const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],
  [-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],
  [-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],
  [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50],
];

function getPST(type: PieceType, row: number, col: number, color: PieceColor): number {
  const r = color === "white" ? row : 7 - row;
  if (type === "pawn") return PAWN_TABLE[r][col];
  if (type === "knight") return KNIGHT_TABLE[r][col];
  return 0;
}

export function evaluateBoardForAnalysis(board: Board, perspective: PieceColor): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type] + getPST(piece.type, row, col, piece.color);
        score += piece.color === perspective ? value : -value;
      }
    }
  }
  return score;
}

interface AIMove { from: Position; to: Position; eval: number; }

function getAllLegalMoves(board: Board, color: PieceColor, rights?: CastlingRights): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const valid = getValidMoves(board, { row, col }, color, rights);
        const legal = valid.filter(to => {
          const testBoard = makeMove(board, { row, col }, to);
          return !isKingInCheck(testBoard, color);
        });
        for (const to of legal) moves.push({ from: { row, col }, to });
      }
    }
  }
  return moves;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, aiColor: PieceColor): number {
  const opponent = aiColor === "white" ? "black" : "white";
  const currentColor = maximizing ? aiColor : opponent;
  if (depth === 0) return evaluateBoardForAnalysis(board, aiColor);
  if (isCheckmate(board, currentColor)) return maximizing ? -99999 : 99999;
  if (isStalemate(board, currentColor)) return 0;
  const moves = getAllLegalMoves(board, currentColor);
  if (moves.length === 0) return evaluateBoardForAnalysis(board, aiColor);

  // Move ordering
  moves.sort((a, b) => {
    const capA = board[a.to.row][a.to.col] ? PIECE_VALUES[board[a.to.row][a.to.col]!.type] : 0;
    const capB = board[b.to.row][b.to.col] ? PIECE_VALUES[board[b.to.row][b.to.col]!.type] : 0;
    return capB - capA;
  });

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const e = minimax(newBoard, depth - 1, alpha, beta, false, aiColor);
      maxEval = Math.max(maxEval, e);
      alpha = Math.max(alpha, e);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const e = minimax(newBoard, depth - 1, alpha, beta, true, aiColor);
      minEval = Math.min(minEval, e);
      beta = Math.min(beta, e);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMoveForAnalysis(board: Board, color: PieceColor, rights?: CastlingRights): AIMove | null {
  const moves = getAllLegalMoves(board, color, rights);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const score = minimax(newBoard, 3, -Infinity, Infinity, false, color);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { ...bestMove, eval: bestScore };
}
