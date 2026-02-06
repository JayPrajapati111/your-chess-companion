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

// Unicode chess pieces
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

  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }

  // Set up back row pieces
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

export const getValidMoves = (board: Board, position: Position, currentTurn: PieceColor): Position[] => {
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

      // Forward move
      if (!board[row + direction]?.[col]) {
        addMoveIfValid(row + direction, col, false);
        // Double move from starting position
        if (row === startRow && !board[row + direction * 2]?.[col]) {
          addMoveIfValid(row + direction * 2, col, false);
        }
      }

      // Diagonal captures
      addMoveIfValid(row + direction, col - 1, true, true);
      addMoveIfValid(row + direction, col + 1, true, true);
      break;
    }

    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of knightMoves) {
        addMoveIfValid(row + dr, col + dc);
      }
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
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
          if (board[row + dr * i]?.[col + dc * i]) break;
        }
      }
      break;
    }

    case 'king': {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      for (const [dr, dc] of directions) {
        addMoveIfValid(row + dr, col + dc);
      }
      break;
    }
  }

  return moves;
};

export const isKingInCheck = (board: Board, color: PieceColor): boolean => {
  // Find king position
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

  // Check if any opponent piece can capture the king
  const opponentColor = color === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === opponentColor) {
        const moves = getValidMovesWithoutCheck(board, { row, col }, opponentColor);
        if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
          return true;
        }
      }
    }
  }

  return false;
};

const getValidMovesWithoutCheck = (board: Board, position: Position, currentTurn: PieceColor): Position[] => {
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
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of knightMoves) {
        addMoveIfValid(row + dr, col + dc);
      }
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
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
          if (board[row + dr * i]?.[col + dc * i]) break;
        }
      }
      break;
    }

    case 'king': {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      for (const [dr, dc] of directions) {
        addMoveIfValid(row + dr, col + dc);
      }
      break;
    }
  }

  return moves;
};

export const makeMove = (board: Board, from: Position, to: Position): Board => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  // Pawn promotion (auto-promote to queen)
  if (piece?.type === 'pawn') {
    if ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7)) {
      newBoard[to.row][to.col] = { type: 'queen', color: piece.color };
    }
  }
  
  return newBoard;
};

export const isCheckmate = (board: Board, color: PieceColor): boolean => {
  if (!isKingInCheck(board, color)) return false;

  // Check if any move can get out of check
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const moves = getValidMoves(board, { row, col }, color);
        for (const move of moves) {
          const testBoard = makeMove(board, { row, col }, move);
          if (!isKingInCheck(testBoard, color)) {
            return false;
          }
        }
      }
    }
  }

  return true;
};

export const isStalemate = (board: Board, color: PieceColor): boolean => {
  if (isKingInCheck(board, color)) return false;

  // Check if any legal move exists
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const moves = getValidMoves(board, { row, col }, color);
        for (const move of moves) {
          const testBoard = makeMove(board, { row, col }, move);
          if (!isKingInCheck(testBoard, color)) {
            return false;
          }
        }
      }
    }
  }

  return true;
};
