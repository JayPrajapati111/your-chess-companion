import { Board, PieceColor, PieceType, Position, getValidMoves, makeMove, isKingInCheck, isCheckmate, isStalemate, CastlingRights, createInitialCastlingRights } from "./chess";

export type Difficulty = "easy" | "medium" | "hard";

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Position bonuses for pieces (center control)
const CENTER_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 5, 10, 10, 10, 10, 5, 0],
  [0, 5, 10, 20, 20, 10, 5, 0],
  [0, 5, 10, 20, 20, 10, 5, 0],
  [0, 5, 10, 10, 10, 10, 5, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

interface AIMove {
  from: Position;
  to: Position;
}

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
        for (const to of legalMoves) {
          moves.push({ from: { row, col }, to });
        }
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
        const value = PIECE_VALUES[piece.type] + CENTER_BONUS[row][col];
        score += piece.color === color ? value : -value;
      }
    }
  }
  return score;
}

// Easy: random legal move
function getEasyMove(board: Board, color: PieceColor): AIMove | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Medium: prefer captures and checks, otherwise random
function getMediumMove(board: Board, color: PieceColor): AIMove | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;

  // Prioritize: checkmate > checks > captures > random
  const scored = moves.map((move) => {
    const newBoard = makeMove(board, move.from, move.to);
    const opponent = color === "white" ? "black" : "white";
    let score = 0;
    if (isCheckmate(newBoard, opponent)) score = 10000;
    else if (isKingInCheck(newBoard, opponent)) score = 500;
    const captured = board[move.to.row][move.to.col];
    if (captured) score += PIECE_VALUES[captured.type];
    score += CENTER_BONUS[move.to.row][move.to.col];
    score += Math.random() * 50; // add randomness
    return { move, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].move;
}

// Hard: minimax with alpha-beta pruning (depth 3)
function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, aiColor: PieceColor): number {
  const opponent = aiColor === "white" ? "black" : "white";
  const currentColor = maximizing ? aiColor : opponent;

  if (depth === 0) return evaluateBoard(board, aiColor);
  if (isCheckmate(board, currentColor)) return maximizing ? -99999 : 99999;
  if (isStalemate(board, currentColor)) return 0;

  const moves = getAllLegalMoves(board, currentColor);
  if (moves.length === 0) return evaluateBoard(board, aiColor);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false, aiColor);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true, aiColor);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getHardMove(board: Board, color: PieceColor): AIMove | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const score = minimax(newBoard, 2, -Infinity, Infinity, false, color);
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
