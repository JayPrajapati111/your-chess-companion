export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isPromotion?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

export const createInitialCastlingRights = (): CastlingRights => ({
  whiteKingside: true,
  whiteQueenside: true,
  blackKingside: true,
  blackQueenside: true,
});

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  const backRowPieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRowPieces[col], color: 'black' };
    board[7][col] = { type: backRowPieces[col], color: 'white' };
  }
  return board;
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

export const isPromotionMove = (board: Board, from: Position, to: Position): boolean => {
  const piece = board[from.row][from.col];
  if (!piece || piece.type !== 'pawn') return false;
  return (piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7);
};

export const getValidMoves = (board: Board, position: Position, currentTurn: PieceColor, castlingRights?: CastlingRights): Position[] => {
  const { row, col } = position;
  const piece = board[row][col];
  if (!piece || piece.color !== currentTurn) return [];

  const moves: Position[] = [];

  const addMoveIfValid = (newRow: number, newCol: number, canCapture: boolean = true, mustCapture: boolean = false) => {
    if (!isValidPosition(newRow, newCol)) return false;
    const targetPiece = board[newRow][newCol];
    if (mustCapture) {
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push({ row: newRow, col: newCol });
        return true;
      }
      return false;
    }
    if (!targetPiece) {
      moves.push({ row: newRow, col: newCol });
      return true;
    } else if (canCapture && targetPiece.color !== piece.color) {
      moves.push({ row: newRow, col: newCol });
      return false;
    }
    return false;
  };

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      if (!board[row + direction]?.[col]) {
        addMoveIfValid(row + direction, col, false);
        if (row === startRow && !board[row + direction * 2]?.[col]) {
          addMoveIfValid(row + direction * 2, col, false);
        }
      }
      addMoveIfValid(row + direction, col - 1, true, true);
      addMoveIfValid(row + direction, col + 1, true, true);
      break;
    }
    case 'knight': {
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of knightMoves) addMoveIfValid(row + dr, col + dc);
      break;
    }
    case 'bishop': {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
          if (board[row + dr * i]?.[col + dc * i]) break;
        }
      }
      break;
    }
    case 'rook': {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
          if (board[row + dr * i]?.[col + dc * i]) break;
        }
      }
      break;
    }
    case 'queen': {
      const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
          if (board[row + dr * i]?.[col + dc * i]) break;
        }
      }
      break;
    }
    case 'king': {
      const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      for (const [dr, dc] of directions) addMoveIfValid(row + dr, col + dc);

      // Castling
      if (castlingRights && !isKingInCheck(board, piece.color)) {
        const backRank = piece.color === 'white' ? 7 : 0;
        if (row === backRank && col === 4) {
          // Kingside
          const canKingside = piece.color === 'white' ? castlingRights.whiteKingside : castlingRights.blackKingside;
          if (canKingside && !board[backRank][5] && !board[backRank][6]) {
            const rook = board[backRank][7];
            if (rook?.type === 'rook' && rook.color === piece.color) {
              // Check squares the king passes through aren't attacked
              const testBoard1 = makeMove(board, { row: backRank, col: 4 }, { row: backRank, col: 5 });
              if (!isKingInCheck(testBoard1, piece.color)) {
                moves.push({ row: backRank, col: 6 });
              }
            }
          }
          // Queenside
          const canQueenside = piece.color === 'white' ? castlingRights.whiteQueenside : castlingRights.blackQueenside;
          if (canQueenside && !board[backRank][3] && !board[backRank][2] && !board[backRank][1]) {
            const rook = board[backRank][0];
            if (rook?.type === 'rook' && rook.color === piece.color) {
              const testBoard1 = makeMove(board, { row: backRank, col: 4 }, { row: backRank, col: 3 });
              if (!isKingInCheck(testBoard1, piece.color)) {
                moves.push({ row: backRank, col: 2 });
              }
            }
          }
        }
      }
      break;
    }
  }

  return moves;
};

export const isKingInCheck = (board: Board, color: PieceColor): boolean => {
  let kingPos: Position | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  if (!kingPos) return false;

  const opponentColor = color === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === opponentColor) {
        // Use basic moves (no castling) to check attacks
        const moves = getValidMoves(board, { row, col }, opponentColor);
        if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const makeMove = (board: Board, from: Position, to: Position, promotionPiece?: PieceType): Board => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];

  // Handle castling (king moves 2 squares)
  if (piece?.type === 'king' && Math.abs(to.col - from.col) === 2) {
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
    // Move the rook
    if (to.col === 6) { // Kingside
      newBoard[to.row][5] = newBoard[to.row][7];
      newBoard[to.row][7] = null;
    } else if (to.col === 2) { // Queenside
      newBoard[to.row][3] = newBoard[to.row][0];
      newBoard[to.row][0] = null;
    }
    return newBoard;
  }

  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  // Pawn promotion
  if (piece?.type === 'pawn') {
    if ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7)) {
      newBoard[to.row][to.col] = { type: promotionPiece || 'queen', color: piece.color };
    }
  }

  return newBoard;
};

export const updateCastlingRights = (rights: CastlingRights, board: Board, from: Position, to: Position): CastlingRights => {
  const newRights = { ...rights };
  const piece = board[from.row][from.col];
  if (!piece) return newRights;

  // King moved
  if (piece.type === 'king') {
    if (piece.color === 'white') { newRights.whiteKingside = false; newRights.whiteQueenside = false; }
    else { newRights.blackKingside = false; newRights.blackQueenside = false; }
  }
  // Rook moved or captured
  if (from.row === 7 && from.col === 0) newRights.whiteQueenside = false;
  if (from.row === 7 && from.col === 7) newRights.whiteKingside = false;
  if (from.row === 0 && from.col === 0) newRights.blackQueenside = false;
  if (from.row === 0 && from.col === 7) newRights.blackKingside = false;
  // Rook captured
  if (to.row === 7 && to.col === 0) newRights.whiteQueenside = false;
  if (to.row === 7 && to.col === 7) newRights.whiteKingside = false;
  if (to.row === 0 && to.col === 0) newRights.blackQueenside = false;
  if (to.row === 0 && to.col === 7) newRights.blackKingside = false;

  return newRights;
};

export const isCheckmate = (board: Board, color: PieceColor, castlingRights?: CastlingRights): boolean => {
  if (!isKingInCheck(board, color)) return false;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const moves = getValidMoves(board, { row, col }, color, castlingRights);
        for (const move of moves) {
          const testBoard = makeMove(board, { row, col }, move);
          if (!isKingInCheck(testBoard, color)) return false;
        }
      }
    }
  }
  return true;
};

export const isStalemate = (board: Board, color: PieceColor, castlingRights?: CastlingRights): boolean => {
  if (isKingInCheck(board, color)) return false;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const moves = getValidMoves(board, { row, col }, color, castlingRights);
        for (const move of moves) {
          const testBoard = makeMove(board, { row, col }, move);
          if (!isKingInCheck(testBoard, color)) return false;
        }
      }
    }
  }
  return true;
};
