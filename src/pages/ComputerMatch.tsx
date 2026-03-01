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
import { ChessTimer, TimeControl, TIME_CONTROLS } from "@/components/ChessTimer";
import { PromotionDialog } from "@/components/PromotionDialog";
import { MoveHistory, MoveRecord } from "@/components/MoveHistory";
import { TimeControlDialog } from "@/components/TimeControlDialog";
import { GameEndDialog } from "@/components/GameEndDialog";
import { GameAnalysis } from "@/components/GameAnalysis";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const posToNotation = (pos: Position) => FILES[pos.col] + RANKS[pos.row];

const ComputerMatch = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate" | "check" | "timeout">("playing");
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [timeControl, setTimeControl] = useState<TimeControl | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isThinking, setIsThinking] = useState(false);
  const thinkingRef = useRef(false);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [gameStarted, setGameStarted] = useState(false);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [moveNumber, setMoveNumber] = useState(1);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const aiColor: PieceColor = playerColor === "white" ? "black" : "white";
  const isGameActive = gameStatus === "playing" || gameStatus === "check";
  const isGameOver = gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "timeout";

  const isFlipped = playerColor === "black";
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;
  const getDisplayRow = (row: number) => isFlipped ? 7 - row : row;
  const getDisplayCol = (col: number) => isFlipped ? 7 - col : col;

  const handleTimeOut = useCallback((loser: PieceColor) => {
    setGameStatus("timeout");
    setWinner(loser === "white" ? "black" : "white");
    setShowEndDialog(true);
  }, []);

  const performMove = useCallback((b: Board, from: Position, to: Position, color: PieceColor, rights: CastlingRights, promotionPiece?: PieceType) => {
    const capturedPiece = b[to.row][to.col];
    const movingPiece = b[from.row][from.col];
    const newRights = updateCastlingRights(rights, b, from, to);
    const newBoard = makeMove(b, from, to, promotionPiece);

    if (capturedPiece) {
      setCapturedPieces((prev) => ({
        ...prev,
        [color]: [...prev[color], PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type]],
      }));
    }

    const nextColor = color === "white" ? "black" : "white";
    const isCheck = isKingInCheck(newBoard, nextColor);
    const isMate = isCheckmate(newBoard, nextColor, newRights);
    const isCastling = movingPiece?.type === "king" && Math.abs(to.col - from.col) === 2;

    const record: MoveRecord = {
      moveNumber: color === "white" ? moveNumber : moveNumber,
      color,
      piece: movingPiece!.type,
      from: posToNotation(from),
      to: posToNotation(to),
      captured: capturedPiece?.type,
      isCheck: isCheck && !isMate,
      isCheckmate: isMate,
      isCastling: isCastling ? (to.col === 6 ? "kingside" : "queenside") : undefined,
      isPromotion: promotionPiece,
    };
    setMoveHistory(prev => [...prev, record]);
    if (color === "black") setMoveNumber(n => n + 1);

    setBoard(newBoard);
    setCastlingRights(newRights);
    setCurrentTurn(nextColor);

    if (isMate) {
      setGameStatus("checkmate");
      setWinner(color);
      setShowEndDialog(true);
    } else if (isStalemate(newBoard, nextColor, newRights)) {
      setGameStatus("stalemate");
      setShowEndDialog(true);
    } else if (isCheck) {
      setGameStatus("check");
    } else {
      setGameStatus("playing");
    }

    return { newBoard, newRights };
  }, [moveNumber]);

  // AI move with realistic thinking time
  useEffect(() => {
    if (currentTurn !== aiColor || !isGameActive || pendingPromotion) return;
    if (thinkingRef.current) return;

    thinkingRef.current = true;
    setIsThinking(true);

    const baseDelay = difficulty === "easy" ? 1200 : difficulty === "medium" ? 2500 : 4000;
    const randomExtra = Math.floor(Math.random() * (difficulty === "hard" ? 3000 : 1500));
    const thinkingSpike = Math.random() < 0.3 ? Math.floor(Math.random() * 2000) : 0;

    const timer = setTimeout(() => {
      const move = getAIMove(board, aiColor, difficulty);
      if (move) {
        const promoType = isPromotionMove(board, move.from, move.to) ? "queen" : undefined;
        performMove(board, move.from, move.to, aiColor, castlingRights, promoType);
      }
      thinkingRef.current = false;
      setIsThinking(false);
    }, baseDelay + randomExtra + thinkingSpike);

    return () => { clearTimeout(timer); thinkingRef.current = false; };
  }, [currentTurn, board, aiColor, isGameActive, difficulty, castlingRights, pendingPromotion, performMove]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver) return;
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
    [board, selectedSquare, validMoves, currentTurn, isGameOver, playerColor, isThinking, castlingRights, pendingPromotion, performMove]
  );

  const handlePromotion = useCallback((piece: PieceType) => {
    if (!pendingPromotion) return;
    performMove(board, pendingPromotion.from, pendingPromotion.to, playerColor, castlingRights, piece);
    setPendingPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
  }, [pendingPromotion, board, playerColor, castlingRights, performMove]);

  const resetGame = (color?: PieceColor) => {
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
    setMoveHistory([]);
    setMoveNumber(1);
    setShowEndDialog(false);
    setShowAnalysis(false);
    if (color) {
      setPlayerColor(color);
      setGameStarted(true);
    } else {
      setGameStarted(false);
      setTimeControl(null);
    }
  };

  const isSquareHighlighted = (row: number, col: number) => validMoves.some((m) => m.row === row && m.col === col);
  const isSquareSelected = (row: number, col: number) => selectedSquare?.row === row && selectedSquare?.col === col;

  // Show analysis view
  if (showAnalysis) {
    return (
      <GameAnalysis
        moves={moveHistory}
        playerLabel={{ white: playerColor === "white" ? "You" : "Computer", black: playerColor === "black" ? "You" : "Computer" }}
        onClose={() => setShowAnalysis(false)}
      />
    );
  }

  // Step 1: Time control selection
  if (!timeControl) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
                <ArrowLeft className="w-6 h-6 text-foreground" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Play vs Computer</h1>
            </div>
          </div>
        </div>
        <TimeControlDialog open={true} onSelect={(tc) => setTimeControl(tc)} />
      </>
    );
  }

  // Step 2: Color selection screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Play vs Computer</h1>
          </div>

          <div className="flex flex-col items-center gap-8 mt-16">
            <p className="text-sm text-muted-foreground">Time: <span className="font-semibold text-primary">{timeControl.label}</span></p>
            <h2 className="text-xl font-semibold text-foreground">Choose Your Side</h2>
            <div className="flex gap-6">
              <button
                onClick={() => resetGame("white")}
                className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all group"
              >
                <span className="text-6xl group-hover:scale-110 transition-transform">♔</span>
                <span className="font-bold text-foreground text-lg">Play as White</span>
                <span className="text-xs text-muted-foreground">Move first</span>
              </button>
              <button
                onClick={() => resetGame("black")}
                className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all group"
              >
                <span className="text-6xl group-hover:scale-110 transition-transform">♚</span>
                <span className="font-bold text-foreground text-lg">Play as Black</span>
                <span className="text-xs text-muted-foreground">Computer moves first</span>
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                    difficulty === d ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Difficulty: <span className="capitalize font-semibold text-primary">{difficulty}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              Playing as <span className="capitalize font-semibold text-primary">{playerColor}</span> •
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
              onClick={() => { setDifficulty(d); resetGame(playerColor); }}
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
            <div className="flex flex-col items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  currentTurn === playerColor ? "bg-foreground text-background" : "bg-card text-foreground border border-border"
                }`}>
                  {currentTurn === playerColor ? "⚪ Your" : "⚫ Computer's"} Turn
                </div>
                {gameStatus === "check" && <span className="text-destructive font-bold animate-pulse">CHECK!</span>}
              </div>

              {/* Captured by opponent (top) */}
              <div className="flex items-center gap-2 h-8">
                <span className="text-xs text-muted-foreground">Computer captured:</span>
                <div className="flex gap-1 text-2xl">{capturedPieces[aiColor].map((p, i) => <span key={i} className="drop-shadow-sm">{p}</span>)}</div>
              </div>

              {/* Board */}
              <div className="relative">
                <div className="flex ml-8 mb-1">
                  {displayFiles.map((f) => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
                <div className="flex">
                  <div className="flex flex-col mr-1">
                    {displayRanks.map((r) => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                  </div>
                  <div className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl border-4 border-secondary">
                    {Array.from({ length: 8 }, (_, displayRow) =>
                      Array.from({ length: 8 }, (_, displayCol) => {
                        const row = getDisplayRow(displayRow);
                        const col = getDisplayCol(displayCol);
                        const piece = board[row][col];
                        const isLight = (row + col) % 2 === 0;
                        const highlighted = isSquareHighlighted(row, col);
                        const selected = isSquareSelected(row, col);
                        return (
                          <div
                            key={`${displayRow}-${displayCol}`}
                            className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 relative
                              ${isLight ? "chess-square-light" : "chess-square-dark"}
                              ${selected ? "chess-square-selected" : ""}
                              ${highlighted ? "chess-square-highlight" : ""}
                            `}
                            onClick={() => handleSquareClick(row, col)}
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
                    {displayRanks.map((r) => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                  </div>
                </div>
                <div className="flex ml-8 mt-1">
                  {displayFiles.map((f) => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
              </div>

              {/* Captured by You */}
              <div className="flex items-center gap-2 h-8">
                <span className="text-xs text-muted-foreground">You captured:</span>
                <div className="flex gap-1 text-2xl">{capturedPieces[playerColor].map((p, i) => <span key={i}>{p}</span>)}</div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => resetGame(playerColor)} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  New Game
                </button>
                <button onClick={() => resetGame()} className="px-6 py-3 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-secondary transition-colors">
                  Change Settings
                </button>
              </div>
            </div>

            {/* Move History */}
            <div className="order-last">
              <MoveHistory moves={moveHistory} />
              {timeControl.initialTime > 0 && (
                <div key={gameKey} className="mt-4">
                  <ChessTimer timeControl={timeControl} currentTurn={currentTurn} isGameActive={isGameActive} onTimeOut={handleTimeOut} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {pendingPromotion && <PromotionDialog color={playerColor} onSelect={handlePromotion} />}

      <GameEndDialog
        open={showEndDialog}
        status={isGameOver ? gameStatus as "checkmate" | "stalemate" | "timeout" : null}
        winner={winner}
        playerLabel={{ white: playerColor === "white" ? "You" : "Computer", black: playerColor === "black" ? "You" : "Computer" }}
        onNewGame={() => resetGame(playerColor)}
        onClose={() => setShowEndDialog(false)}
        onAnalyze={() => { setShowEndDialog(false); setShowAnalysis(true); }}
      />
    </div>
  );
};

export default ComputerMatch;
