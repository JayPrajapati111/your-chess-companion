import { Board, PieceColor, PieceType, Position, getValidMoves, makeMove, isKingInCheck, isCheckmate, isStalemate, CastlingRights } from "./chess";

export type Difficulty = "easy" | "medium" | "hard";

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
const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
  [-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],
  [-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],
  [-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20],
];

function getPieceSquareValue(type: PieceType, row: number, col: number, color: PieceColor): number {
  const r = color === "white" ? row : 7 - row;
  switch (type) {
    case "pawn": return PAWN_TABLE[r][col];
    case "knight": return KNIGHT_TABLE[r][col];
    case "bishop": return BISHOP_TABLE[r][col];
    default: return 0;
  }
}

interface AIMove { from: Position; to: Position; }

function getAllLegalMoves(board: Board, color: PieceColor): AIMove[] {
  const moves: AIMove[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const validMoves = getValidMoves(board, { row, col }, color);
        const legalMoves = validMoves.filter((to) => {
          const testBoard = makeMove(board, { row, col }, to);
          return !isKingInCheck(testBoard, color);
        });
        for (const to of legalMoves) moves.push({ from: { row, col }, to });
      }
    }
  }
  return moves;
}

function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type] + getPieceSquareValue(piece.type, row, col, piece.color);
        score += piece.color === color ? value : -value;
      }
    }
  }
  return score;
}

function getEasyMove(board: Board, color: PieceColor): AIMove | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function getMediumMove(board: Board, color: PieceColor): AIMove | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;
  const scored = moves.map((move) => {
    const newBoard = makeMove(board, move.from, move.to);
    const opponent = color === "white" ? "black" : "white";
    let score = 0;
    if (isCheckmate(newBoard, opponent)) score = 10000;
    else if (isKingInCheck(newBoard, opponent)) score = 500;
    const captured = board[move.to.row][move.to.col];
    if (captured) score += PIECE_VALUES[captured.type];
    score += getPieceSquareValue(board[move.from.row][move.from.col]!.type, move.to.row, move.to.col, color);
    score += Math.random() * 50;
    return { move, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].move;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, aiColor: PieceColor): number {
  const opponent = aiColor === "white" ? "black" : "white";
  const currentColor = maximizing ? aiColor : opponent;
  if (depth === 0) return evaluateBoard(board, aiColor);
  if (isCheckmate(board, currentColor)) return maximizing ? -99999 + (3 - depth) : 99999 - (3 - depth);
  if (isStalemate(board, currentColor)) return 0;
  const moves = getAllLegalMoves(board, currentColor);
  if (moves.length === 0) return evaluateBoard(board, aiColor);

  // Move ordering: captures first
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

function getHardMove(board: Board, color: PieceColor): AIMove | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;

  // Move ordering
  moves.sort((a, b) => {
    const capA = board[a.to.row][a.to.col] ? PIECE_VALUES[board[a.to.row][a.to.col]!.type] : 0;
    const capB = board[b.to.row][b.to.col] ? PIECE_VALUES[board[b.to.row][b.to.col]!.type] : 0;
    return capB - capA;
  });

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

  return bestMove;
}

export function getAIMove(board: Board, color: PieceColor, difficulty: Difficulty): AIMove | null {
  switch (difficulty) {
    case "easy": return getEasyMove(board, color);
    case "medium": return getMediumMove(board, color);
    case "hard": return getHardMove(board, color);
  }
}
