import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Lightbulb, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Board,
  PieceColor,
  Position,
  PIECE_SYMBOLS,
  getValidMoves,
  makeMove,
  isValidPosition,
} from "@/lib/chess";

// Sample puzzles - In production, these would come from the database
const SAMPLE_PUZZLES = [
  {
    id: "1",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    moves: ["h5f7"], // Qxf7# - Scholar's Mate
    rating: 600,
    theme: "Checkmate in 1",
  },
  {
    id: "2",
    fen: "r1b1kb1r/pppp1ppp/5n2/4p3/2B1n2q/3P4/PPP2PPP/RNBQK1NR w KQkq - 0 5",
    moves: ["g2g3"], // g3 wins the queen
    rating: 800,
    theme: "Win the Queen",
  },
  {
    id: "3",
    fen: "r2qkb1r/ppp2ppp/2n1bn2/3pp3/4P3/1B3N2/PPPP1PPP/RNBQK2R w KQkq - 4 5",
    moves: ["b3d5"], // Bxd5 wins a pawn
    rating: 700,
    theme: "Win Material",
  },
];

// Parse FEN string to board
const parseFEN = (fen: string): { board: Board; turn: PieceColor } => {
  const parts = fen.split(" ");
  const rows = parts[0].split("/");
  const turn = parts[1] === "w" ? "white" : "black";

  const pieceMap: Record<string, { type: any; color: PieceColor }> = {
    k: { type: "king", color: "black" },
    q: { type: "queen", color: "black" },
    r: { type: "rook", color: "black" },
    b: { type: "bishop", color: "black" },
    n: { type: "knight", color: "black" },
    p: { type: "pawn", color: "black" },
    K: { type: "king", color: "white" },
    Q: { type: "queen", color: "white" },
    R: { type: "rook", color: "white" },
    B: { type: "bishop", color: "white" },
    N: { type: "knight", color: "white" },
    P: { type: "pawn", color: "white" },
  };

  const board: Board = [];

  for (const row of rows) {
    const boardRow: any[] = [];
    for (const char of row) {
      if (/\d/.test(char)) {
        for (let i = 0; i < parseInt(char); i++) {
          boardRow.push(null);
        }
      } else if (pieceMap[char]) {
        boardRow.push(pieceMap[char]);
      }
    }
    board.push(boardRow);
  }

  return { board, turn };
};

// Parse move notation like "e2e4" or "h5f7"
const parseMove = (move: string): { from: Position; to: Position } => {
  const files = "abcdefgh";
  return {
    from: { row: 8 - parseInt(move[1]), col: files.indexOf(move[0]) },
    to: { row: 8 - parseInt(move[3]), col: files.indexOf(move[2]) },
  };
};

const Puzzles = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [board, setBoard] = useState<Board>([]);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [turn, setTurn] = useState<PieceColor>("white");
  const [puzzleState, setPuzzleState] = useState<"solving" | "correct" | "wrong">("solving");
  const [showHint, setShowHint] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  const currentPuzzle = SAMPLE_PUZZLES[currentPuzzleIndex];

  // Initialize puzzle
  useEffect(() => {
    const { board: newBoard, turn: newTurn } = parseFEN(currentPuzzle.fen);
    setBoard(newBoard);
    setTurn(newTurn);
    setPuzzleState("solving");
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
  }, [currentPuzzleIndex, currentPuzzle.fen]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (puzzleState !== "solving") return;

      const clickedPiece = board[row]?.[col];

      // If clicking on own piece, select it
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare({ row, col });
        const moves = getValidMoves(board, { row, col }, turn);
        setValidMoves(moves);
        return;
      }

      // If a piece is selected and clicking on a valid move
      if (selectedSquare) {
        const isValid = validMoves.some((m) => m.row === row && m.col === col);

        if (isValid) {
          const correctMove = parseMove(currentPuzzle.moves[0]);
          
          // Check if this is the correct move
          if (
            selectedSquare.row === correctMove.from.row &&
            selectedSquare.col === correctMove.from.col &&
            row === correctMove.to.row &&
            col === correctMove.to.col
          ) {
            // Correct move!
            const newBoard = makeMove(board, selectedSquare, { row, col });
            setBoard(newBoard);
            setPuzzleState("correct");
            setPuzzlesSolved((prev) => prev + 1);
          } else {
            // Wrong move
            setPuzzleState("wrong");
          }
        }

        setSelectedSquare(null);
        setValidMoves([]);
      }
    },
    [board, selectedSquare, validMoves, turn, puzzleState, currentPuzzle.moves]
  );

  const nextPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev + 1) % SAMPLE_PUZZLES.length);
  };

  const retryPuzzle = () => {
    const { board: newBoard, turn: newTurn } = parseFEN(currentPuzzle.fen);
    setBoard(newBoard);
    setTurn(newTurn);
    setPuzzleState("solving");
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
  };

  const isSquareHighlighted = (row: number, col: number) => {
    return validMoves.some((m) => m.row === row && m.col === col);
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const getHintSquare = () => {
    if (!showHint || !currentPuzzle.moves[0]) return null;
    const move = parseMove(currentPuzzle.moves[0]);
    return move.from;
  };

  const hintSquare = getHintSquare();

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Puzzles</h1>
              <p className="text-muted-foreground">Solve tactical puzzles to improve your skills</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Solved</p>
            <p className="text-2xl font-bold text-primary">{puzzlesSolved}</p>
          </div>
        </div>

        {/* Puzzle Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-game-purple/20 text-game-purple rounded-lg text-sm font-medium">
              Rating: {currentPuzzle.rating}
            </span>
            <span className="text-muted-foreground">{currentPuzzle.theme}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${turn === "white" ? "text-foreground" : "text-muted-foreground"}`}>
              {turn === "white" ? "⚪ White" : "⚫ Black"} to move
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Column labels */}
            <div className="flex ml-8 mb-1">
              {files.map((file) => (
                <div key={file} className="w-12 md:w-16 text-center text-xs text-muted-foreground">
                  {file}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Row labels */}
              <div className="flex flex-col mr-1">
                {ranks.map((rank) => (
                  <div key={rank} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">
                    {rank}
                  </div>
                ))}
              </div>

              {/* Board */}
              <div className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl border-4 border-secondary">
                {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    const highlighted = isSquareHighlighted(rowIndex, colIndex);
                    const selected = isSquareSelected(rowIndex, colIndex);
                    const isHint = hintSquare?.row === rowIndex && hintSquare?.col === colIndex;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer
                          transition-all duration-150 relative
                          ${isLight ? "chess-square-light" : "chess-square-dark"}
                          ${selected ? "chess-square-selected" : ""}
                          ${highlighted ? "chess-square-highlight" : ""}
                          ${isHint ? "ring-4 ring-game-orange ring-inset" : ""}
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {piece && (
                          <span
                            className={`
                              text-3xl md:text-5xl select-none
                              ${piece.color === "white" 
                                ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" 
                                : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                              }
                            `}
                            style={{
                              WebkitTextStroke: piece.color === "white" ? "1px #333" : "none",
                            }}
                          >
                            {PIECE_SYMBOLS[piece.color][piece.type]}
                          </span>
                        )}
                        {highlighted && !piece && (
                          <div className="absolute w-3 h-3 rounded-full bg-primary/60" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Row labels right */}
              <div className="flex flex-col ml-1">
                {ranks.map((rank) => (
                  <div key={rank} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">
                    {rank}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Controls */}
        <div className="flex flex-col items-center gap-4">
          {puzzleState === "correct" && (
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <Check className="w-6 h-6" />
              Correct! Well done!
            </div>
          )}
          {puzzleState === "wrong" && (
            <div className="flex items-center gap-2 text-destructive font-bold text-xl">
              <X className="w-6 h-6" />
              Wrong move. Try again!
            </div>
          )}

          <div className="flex items-center gap-4">
            {puzzleState === "solving" && (
              <button
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="flex items-center gap-2 px-4 py-2 bg-game-orange/20 text-game-orange rounded-lg hover:bg-game-orange/30 disabled:opacity-50 transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
                Hint
              </button>
            )}
            
            {puzzleState === "wrong" && (
              <button
                onClick={retryPuzzle}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Retry
              </button>
            )}

            {(puzzleState === "correct" || puzzleState === "wrong") && (
              <button
                onClick={nextPuzzle}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Next Puzzle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Puzzles;
