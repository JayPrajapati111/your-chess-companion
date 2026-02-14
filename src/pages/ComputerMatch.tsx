import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Board,
  Position,
  PieceColor,
  PieceType,
  PIECE_SYMBOLS,
  CastlingRights,
  createInitialBoard,
  createInitialCastlingRights,
  getValidMoves,
  makeMove,
  updateCastlingRights,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  isPromotionMove,
} from "@/lib/chess";
import { Difficulty, getAIMove } from "@/lib/chessAI";
import { ChessTimer, TimeControl, TimeControlSelector, TIME_CONTROLS } from "@/components/ChessTimer";
import { PromotionDialog } from "@/components/PromotionDialog";

const ComputerMatch = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate" | "check" | "timeout">("playing");
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[5]);
  const [gameKey, setGameKey] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isThinking, setIsThinking] = useState(false);
  const thinkingRef = useRef(false);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);

  const playerColor: PieceColor = "white";
  const aiColor: PieceColor = "black";
  const isGameActive = gameStatus === "playing" || gameStatus === "check";

  const handleTimeOut = useCallback((loser: PieceColor) => {
    setGameStatus("timeout");
    setWinner(loser === "white" ? "black" : "white");
  }, []);

  const performMove = useCallback((b: Board, from: Position, to: Position, color: PieceColor, rights: CastlingRights, promotionPiece?: PieceType) => {
    const capturedPiece = b[to.row][to.col];
    const newRights = updateCastlingRights(rights, b, from, to);
    const newBoard = makeMove(b, from, to, promotionPiece);

    if (capturedPiece) {
      setCapturedPieces((prev) => ({
        ...prev,
        [color]: [...prev[color], PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type]],
      }));
    }

    setBoard(newBoard);
    setCastlingRights(newRights);

    const nextColor = color === "white" ? "black" : "white";
    setCurrentTurn(nextColor);

    if (isCheckmate(newBoard, nextColor, newRights)) {
      setGameStatus("checkmate");
      setWinner(color);
    } else if (isStalemate(newBoard, nextColor, newRights)) {
      setGameStatus("stalemate");
    } else if (isKingInCheck(newBoard, nextColor)) {
      setGameStatus("check");
    } else {
      setGameStatus("playing");
    }

    return { newBoard, newRights };
  }, []);

  // AI move
  useEffect(() => {
    if (currentTurn !== aiColor || !isGameActive || pendingPromotion) return;
    if (thinkingRef.current) return;

    thinkingRef.current = true;
    setIsThinking(true);

    const baseDelay = difficulty === "easy" ? 800 : difficulty === "medium" ? 1500 : 2500;
    const randomExtra = Math.floor(Math.random() * (difficulty === "hard" ? 1500 : 800));

    const timer = setTimeout(() => {
      const move = getAIMove(board, aiColor, difficulty);
      if (move) {
        // AI always promotes to queen
        const promoType = isPromotionMove(board, move.from, move.to) ? "queen" : undefined;
        performMove(board, move.from, move.to, aiColor, castlingRights, promoType);
      }
      thinkingRef.current = false;
      setIsThinking(false);
    }, baseDelay + randomExtra);

    return () => { clearTimeout(timer); thinkingRef.current = false; };
  }, [currentTurn, board, aiColor, isGameActive, difficulty, castlingRights, pendingPromotion, performMove]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "timeout") return;
      if (currentTurn !== playerColor || isThinking || pendingPromotion) return;

      const clickedPiece = board[row][col];

      if (clickedPiece && clickedPiece.color === playerColor) {
        setSelectedSquare({ row, col });
        const moves = getValidMoves(board, { row, col }, playerColor, castlingRights);
        const legalMoves = moves.filter((move) => {
          const testBoard = makeMove(board, { row, col }, move);
          return !isKingInCheck(testBoard, playerColor);
        });
        setValidMoves(legalMoves);
        return;
      }

      if (selectedSquare) {
        const isValidMove = validMoves.some((m) => m.row === row && m.col === col);
        if (isValidMove) {
          if (isPromotionMove(board, selectedSquare, { row, col })) {
            setPendingPromotion({ from: selectedSquare, to: { row, col } });
            return;
          }
          performMove(board, selectedSquare, { row, col }, playerColor, castlingRights);
          setSelectedSquare(null);
          setValidMoves([]);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    },
    [board, selectedSquare, validMoves, currentTurn, gameStatus, playerColor, isThinking, castlingRights, pendingPromotion, performMove]
  );

  const handlePromotion = useCallback((piece: PieceType) => {
    if (!pendingPromotion) return;
    performMove(board, pendingPromotion.from, pendingPromotion.to, playerColor, castlingRights, piece);
    setPendingPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
  }, [pendingPromotion, board, playerColor, castlingRights, performMove]);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn("white");
    setCapturedPieces({ white: [], black: [] });
    setGameStatus("playing");
    setWinner(null);
    setIsThinking(false);
    thinkingRef.current = false;
    setCastlingRights(createInitialCastlingRights());
    setPendingPromotion(null);
    setGameKey((k) => k + 1);
  };

  const isSquareHighlighted = (row: number, col: number) => validMoves.some((m) => m.row === row && m.col === col);
  const isSquareSelected = (row: number, col: number) => selectedSquare?.row === row && selectedSquare?.col === col;

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Play vs Computer</h1>
            <p className="text-muted-foreground">
              Difficulty: <span className="capitalize font-semibold text-primary">{difficulty}</span>
              {isThinking && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="animate-pulse">🤔</span>
                  <span className="text-sm animate-pulse">Thinking</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex gap-2 mb-6 justify-center">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); resetGame(); }}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                difficulty === d ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="w-full lg:w-48 order-first lg:order-none">
              <TimeControlSelector selected={timeControl} onSelect={setTimeControl} />
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  currentTurn === "white" ? "bg-foreground text-background" : "bg-card text-foreground border border-border"
                }`}>
                  {currentTurn === "white" ? "⚪ Your" : "⚫ Computer's"} Turn
                </div>
                {gameStatus === "check" && <span className="text-destructive font-bold animate-pulse">CHECK!</span>}
                {gameStatus === "checkmate" && (
                  <span className="text-primary font-bold">CHECKMATE! {winner === playerColor ? "You win!" : "Computer wins!"}</span>
                )}
                {gameStatus === "stalemate" && <span className="text-muted-foreground font-bold">STALEMATE! Draw!</span>}
                {gameStatus === "timeout" && (
                  <span className="text-destructive font-bold">TIME OUT! {winner === playerColor ? "You win!" : "Computer wins!"}</span>
                )}
              </div>

              {/* Captured by Computer */}
              <div className="flex items-center gap-2 h-8">
                <span className="text-xs text-muted-foreground">Computer captured:</span>
                <div className="flex gap-1 text-2xl">{capturedPieces.black.map((p, i) => <span key={i} className="drop-shadow-sm">{p}</span>)}</div>
              </div>

              {/* Board */}
              <div className="relative">
                <div className="flex ml-8 mb-1">
                  {files.map((f) => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
                <div className="flex">
                  <div className="flex flex-col mr-1">
                    {ranks.map((r) => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                  </div>
                  <div className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl border-4 border-secondary">
                    {board.map((row, rowIndex) =>
                      row.map((piece, colIndex) => {
                        const isLight = (rowIndex + colIndex) % 2 === 0;
                        const highlighted = isSquareHighlighted(rowIndex, colIndex);
                        const selected = isSquareSelected(rowIndex, colIndex);
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 relative
                              ${isLight ? "chess-square-light" : "chess-square-dark"}
                              ${selected ? "chess-square-selected" : ""}
                              ${highlighted ? "chess-square-highlight" : ""}
                            `}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                          >
                            {piece && (
                              <span
                                className={`text-3xl md:text-5xl select-none transition-transform duration-150
                                  ${selected ? "scale-110" : ""}
                                  ${piece.color === "white" ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"}
                                `}
                                style={{ WebkitTextStroke: piece.color === "white" ? "1px #333" : "none" }}
                              >
                                {PIECE_SYMBOLS[piece.color][piece.type]}
                              </span>
                            )}
                            {highlighted && !piece && <div className="absolute w-3 h-3 rounded-full bg-primary/60" />}
                            {highlighted && piece && <div className="absolute inset-0 border-4 border-primary/60 rounded-sm" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex flex-col ml-1">
                    {ranks.map((r) => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                  </div>
                </div>
                <div className="flex ml-8 mt-1">
                  {files.map((f) => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
              </div>

              {/* Captured by You */}
              <div className="flex items-center gap-2 h-8">
                <span className="text-xs text-muted-foreground">You captured:</span>
                <div className="flex gap-1 text-2xl">{capturedPieces.white.map((p, i) => <span key={i}>{p}</span>)}</div>
              </div>

              <button onClick={resetGame} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                New Game
              </button>
            </div>

            {timeControl.initialTime > 0 && (
              <div key={gameKey} className="order-last">
                <ChessTimer timeControl={timeControl} currentTurn={currentTurn} isGameActive={isGameActive} onTimeOut={handleTimeOut} />
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingPromotion && <PromotionDialog color={playerColor} onSelect={handlePromotion} />}
    </div>
  );
};

export default ComputerMatch;
