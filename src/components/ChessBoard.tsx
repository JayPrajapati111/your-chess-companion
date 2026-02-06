import { useState, useCallback } from "react";
import {
  Board,
  Position,
  PieceColor,
  PIECE_SYMBOLS,
  createInitialBoard,
  getValidMoves,
  makeMove,
  isKingInCheck,
  isCheckmate,
  isStalemate,
} from "@/lib/chess";
import { ChessTimer, TimeControl, TimeControlSelector, TIME_CONTROLS } from "./ChessTimer";

interface ChessBoardProps {
  onGameEnd?: (winner: PieceColor | "draw") => void;
  showTimeControls?: boolean;
}

export const ChessBoard = ({ onGameEnd, showTimeControls = true }: ChessBoardProps) => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({
    white: [],
    black: [],
  });
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate" | "check" | "timeout">("playing");
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[5]); // Default 5 min
  const [gameKey, setGameKey] = useState(0); // Force timer reset

  const isGameActive = gameStatus === "playing" || gameStatus === "check";

  const handleTimeOut = useCallback((loser: PieceColor) => {
    setGameStatus("timeout");
    const gameWinner = loser === "white" ? "black" : "white";
    setWinner(gameWinner);
    onGameEnd?.(gameWinner);
  }, [onGameEnd]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "timeout") return;

      const clickedPiece = board[row][col];

      // If clicking on own piece, select it
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare({ row, col });
        const moves = getValidMoves(board, { row, col }, currentTurn);
        // Filter moves that would leave king in check
        const legalMoves = moves.filter((move) => {
          const testBoard = makeMove(board, { row, col }, move);
          return !isKingInCheck(testBoard, currentTurn);
        });
        setValidMoves(legalMoves);
        return;
      }

      // If a piece is selected and clicking on a valid move
      if (selectedSquare) {
        const isValidMove = validMoves.some((m) => m.row === row && m.col === col);

        if (isValidMove) {
          const capturedPiece = board[row][col];
          const newBoard = makeMove(board, selectedSquare, { row, col });

          // Update captured pieces
          if (capturedPiece) {
            setCapturedPieces((prev) => ({
              ...prev,
              [currentTurn]: [...prev[currentTurn], PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type]],
            }));
          }

          setBoard(newBoard);
          setSelectedSquare(null);
          setValidMoves([]);

          const nextTurn = currentTurn === "white" ? "black" : "white";
          setCurrentTurn(nextTurn);

          // Check game status
          if (isCheckmate(newBoard, nextTurn)) {
            setGameStatus("checkmate");
            setWinner(currentTurn);
            onGameEnd?.(currentTurn);
          } else if (isStalemate(newBoard, nextTurn)) {
            setGameStatus("stalemate");
            onGameEnd?.("draw");
          } else if (isKingInCheck(newBoard, nextTurn)) {
            setGameStatus("check");
          } else {
            setGameStatus("playing");
          }
        } else {
          // Deselect if clicking elsewhere
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    },
    [board, selectedSquare, validMoves, currentTurn, gameStatus, onGameEnd]
  );

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn("white");
    setCapturedPieces({ white: [], black: [] });
    setGameStatus("playing");
    setWinner(null);
    setGameKey((k) => k + 1); // Reset timer
  };

  const isSquareHighlighted = (row: number, col: number) => {
    return validMoves.some((m) => m.row === row && m.col === col);
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
      {/* Time Control Selector */}
      {showTimeControls && (
        <div className="w-full lg:w-48 order-first lg:order-none">
          <TimeControlSelector selected={timeControl} onSelect={setTimeControl} />
        </div>
      )}

      {/* Main Board Area */}
      <div className="flex flex-col items-center gap-4">
        {/* Game Status */}
        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentTurn === "white" ? "bg-foreground text-background" : "bg-card text-foreground border border-border"
            }`}
          >
            {currentTurn === "white" ? "⚪ White" : "⚫ Black"}'s Turn
          </div>
          {gameStatus === "check" && (
            <span className="text-destructive font-bold animate-pulse">CHECK!</span>
          )}
          {gameStatus === "checkmate" && (
            <span className="text-primary font-bold">CHECKMATE! {winner === "white" ? "White" : "Black"} wins!</span>
          )}
          {gameStatus === "stalemate" && (
            <span className="text-muted-foreground font-bold">STALEMATE! Draw!</span>
          )}
          {gameStatus === "timeout" && (
            <span className="text-destructive font-bold">TIME OUT! {winner === "white" ? "White" : "Black"} wins!</span>
          )}
        </div>

        {/* Captured Pieces - Black's captures */}
        <div className="flex items-center gap-2 h-8">
          <span className="text-xs text-muted-foreground">Black captured:</span>
          <div className="flex gap-1 text-2xl">
            {capturedPieces.black.map((piece, i) => (
              <span key={i} className="drop-shadow-sm">{piece}</span>
            ))}
          </div>
        </div>

        {/* Chess Board */}
        <div className="relative">
          {/* Column labels - top */}
          <div className="flex ml-8 mb-1">
            {files.map((file) => (
              <div key={file} className="w-12 md:w-16 text-center text-xs text-muted-foreground">
                {file}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Row labels - left */}
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

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer
                        transition-all duration-150 relative
                        ${isLight ? "chess-square-light" : "chess-square-dark"}
                        ${selected ? "chess-square-selected" : ""}
                        ${highlighted ? "chess-square-highlight" : ""}
                      `}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                    >
                      {piece && (
                        <span
                          className={`
                            text-3xl md:text-5xl select-none transition-transform duration-150
                            ${selected ? "scale-110" : ""}
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
                      {highlighted && piece && (
                        <div className="absolute inset-0 border-4 border-primary/60 rounded-sm" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Row labels - right */}
            <div className="flex flex-col ml-1">
              {ranks.map((rank) => (
                <div key={rank} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">
                  {rank}
                </div>
              ))}
            </div>
          </div>

          {/* Column labels - bottom */}
          <div className="flex ml-8 mt-1">
            {files.map((file) => (
              <div key={file} className="w-12 md:w-16 text-center text-xs text-muted-foreground">
                {file}
              </div>
            ))}
          </div>
        </div>

        {/* Captured Pieces - White's captures */}
        <div className="flex items-center gap-2 h-8">
          <span className="text-xs text-muted-foreground">White captured:</span>
          <div className="flex gap-1 text-2xl">
            {capturedPieces.white.map((piece, i) => (
              <span key={i}>{piece}</span>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          New Game
        </button>
      </div>

      {/* Timer */}
      {showTimeControls && timeControl.initialTime > 0 && (
        <div key={gameKey} className="order-last">
          <ChessTimer
            timeControl={timeControl}
            currentTurn={currentTurn}
            isGameActive={isGameActive}
            onTimeOut={handleTimeOut}
          />
        </div>
      )}
    </div>
  );
};
