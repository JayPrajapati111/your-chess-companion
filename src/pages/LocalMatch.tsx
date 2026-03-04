import { useState, useCallback } from "react";
import { ArrowLeft, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Board, Position, PieceColor, PieceType, PIECE_SYMBOLS, CastlingRights,
  createInitialBoard, createInitialCastlingRights, getValidMoves, makeMove,
  updateCastlingRights, isKingInCheck, isCheckmate, isStalemate, isPromotionMove,
} from "@/lib/chess";
import { ChessTimer, TimeControl, TIME_CONTROLS } from "@/components/ChessTimer";
import { PromotionDialog } from "@/components/PromotionDialog";
import { MoveHistory, MoveRecord } from "@/components/MoveHistory";
import { TimeControlDialog } from "@/components/TimeControlDialog";
import { GameEndDialog } from "@/components/GameEndDialog";
import { GameAnalysis } from "@/components/GameAnalysis";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];
const posToNotation = (pos: Position) => FILES[pos.col] + RANKS[pos.row];

const boardToString = (board: Board, turn: PieceColor): string => {
  let s = turn;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      s += p ? `${p.color[0]}${p.type[0]}` : "--";
    }
  return s;
};

interface HistoryEntry {
  board: Board;
  turn: PieceColor;
  castlingRights: CastlingRights;
  capturedPieces: { white: string[]; black: string[] };
  moveHistory: MoveRecord[];
  moveNumber: number;
  halfMoveClock: number;
  positionHistory: Map<string, number>;
}

const LocalMatch = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate" | "check" | "timeout" | "repetition" | "fifty-move">("playing");
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [timeControl, setTimeControl] = useState<TimeControl | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [moveNumber, setMoveNumber] = useState(1);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [positionHistory, setPositionHistory] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>();
    m.set(boardToString(createInitialBoard(), "white"), 1);
    return m;
  });
  const [halfMoveClock, setHalfMoveClock] = useState(0);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);

  const isGameActive = gameStatus === "playing" || gameStatus === "check";
  const isGameOver = gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "timeout" || gameStatus === "repetition" || gameStatus === "fifty-move";

  const handleTimeOut = useCallback((loser: PieceColor) => {
    setGameStatus("timeout");
    const w = loser === "white" ? "black" : "white";
    setWinner(w);
    setShowEndDialog(true);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || isGameOver) return;
    const prev = undoStack[undoStack.length - 1];
    setBoard(prev.board);
    setCurrentTurn(prev.turn);
    setCastlingRights(prev.castlingRights);
    setCapturedPieces(prev.capturedPieces);
    setMoveHistory(prev.moveHistory);
    setMoveNumber(prev.moveNumber);
    setHalfMoveClock(prev.halfMoveClock);
    setPositionHistory(prev.positionHistory);
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus("playing");
    setUndoStack(s => s.slice(0, -1));
  }, [undoStack, isGameOver]);

  const executeMove = useCallback((from: Position, to: Position, promotionPiece?: PieceType) => {
    // Save state for undo
    setUndoStack(s => [...s, {
      board: board.map(r => [...r]),
      turn: currentTurn,
      castlingRights: { ...castlingRights },
      capturedPieces: { white: [...capturedPieces.white], black: [...capturedPieces.black] },
      moveHistory: [...moveHistory],
      moveNumber,
      halfMoveClock,
      positionHistory: new Map(positionHistory),
    }]);

    const capturedPiece = board[to.row][to.col];
    const movingPiece = board[from.row][from.col];
    const newRights = updateCastlingRights(castlingRights, board, from, to);
    const newBoard = makeMove(board, from, to, promotionPiece);

    if (capturedPiece) {
      setCapturedPieces((prev) => ({
        ...prev,
        [currentTurn]: [...prev[currentTurn], PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type]],
      }));
    }

    const nextTurn = currentTurn === "white" ? "black" : "white";
    const isCheck = isKingInCheck(newBoard, nextTurn);
    const isMate = isCheckmate(newBoard, nextTurn, newRights);
    const isCastling = movingPiece?.type === "king" && Math.abs(to.col - from.col) === 2;

    const record: MoveRecord = {
      moveNumber,
      color: currentTurn,
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
    if (currentTurn === "black") setMoveNumber(n => n + 1);

    const newHalfMove = (capturedPiece || movingPiece?.type === "pawn") ? 0 : halfMoveClock + 1;
    setHalfMoveClock(newHalfMove);

    const posKey = boardToString(newBoard, nextTurn);
    const newPosHistory = new Map(positionHistory);
    newPosHistory.set(posKey, (newPosHistory.get(posKey) || 0) + 1);
    setPositionHistory(newPosHistory);

    setBoard(newBoard);
    setCastlingRights(newRights);
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn(nextTurn);

    if (isMate) {
      setGameStatus("checkmate");
      setWinner(currentTurn);
      setShowEndDialog(true);
    } else if (isStalemate(newBoard, nextTurn, newRights)) {
      setGameStatus("stalemate");
      setShowEndDialog(true);
    } else if ((newPosHistory.get(posKey) || 0) >= 3) {
      setGameStatus("repetition");
      setShowEndDialog(true);
    } else if (newHalfMove >= 100) {
      setGameStatus("fifty-move");
      setShowEndDialog(true);
    } else if (isCheck) {
      setGameStatus("check");
    } else {
      setGameStatus("playing");
    }
  }, [board, castlingRights, currentTurn, moveNumber, halfMoveClock, positionHistory, capturedPieces, moveHistory]);


  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver) return;
      if (pendingPromotion) return;
      const clickedPiece = board[row][col];
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare({ row, col });
        const moves = getValidMoves(board, { row, col }, currentTurn, castlingRights);
        const legalMoves = moves.filter((move) => {
          const testBoard = makeMove(board, { row, col }, move);
          return !isKingInCheck(testBoard, currentTurn);
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
          executeMove(selectedSquare, { row, col });
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    },
    [board, selectedSquare, validMoves, currentTurn, isGameOver, castlingRights, pendingPromotion, executeMove]
  );

  const handlePromotion = useCallback((piece: PieceType) => {
    if (!pendingPromotion) return;
    executeMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  }, [pendingPromotion, executeMove]);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn("white");
    setCapturedPieces({ white: [], black: [] });
    setGameStatus("playing");
    setWinner(null);
    setCastlingRights(createInitialCastlingRights());
    setPendingPromotion(null);
    setGameKey((k) => k + 1);
    setMoveHistory([]);
    setMoveNumber(1);
    setShowEndDialog(false);
    setShowAnalysis(false);
    setTimeControl(null);
    setHalfMoveClock(0);
    setUndoStack([]);
    
    const m = new Map<string, number>();
    m.set(boardToString(createInitialBoard(), "white"), 1);
    setPositionHistory(m);
  };

  if (showAnalysis) {
    return (
      <GameAnalysis
        moves={moveHistory}
        playerLabel={{ white: "White", black: "Black" }}
        onClose={() => setShowAnalysis(false)}
      />
    );
  }

  const isSquareHighlighted = (row: number, col: number) => validMoves.some((m) => m.row === row && m.col === col);
  const isSquareSelected = (row: number, col: number) => selectedSquare?.row === row && selectedSquare?.col === col;

  if (!timeControl) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 md:p-8 relative">
          <div className="chess-bg" />
          <div className="chess-bg-vignette" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
                <ArrowLeft className="w-6 h-6 text-foreground" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Local Match</h1>
                <p className="text-muted-foreground">Play against a friend on the same device</p>
              </div>
            </div>
          </div>
        </div>
        <TimeControlDialog open={true} onSelect={(tc) => setTimeControl(tc)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="chess-bg" />
      <div className="chess-bg-vignette" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Local Match</h1>
            <p className="text-muted-foreground">Play against a friend on the same device</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  currentTurn === "white" ? "bg-foreground text-background" : "bg-card text-foreground border border-border"
                }`}>
                  {currentTurn === "white" ? "⚪ White" : "⚫ Black"}'s Turn
                </div>
                {gameStatus === "check" && <span className="text-destructive font-bold animate-pulse">CHECK!</span>}
              </div>

              <div className="flex items-center gap-2 h-8">
                <span className="text-xs text-muted-foreground">Black captured:</span>
                <div className="flex gap-1 text-2xl">{capturedPieces.black.map((p, i) => <span key={i} className="drop-shadow-sm">{p}</span>)}</div>
              </div>

              <div className="relative">
                <div className="flex ml-8 mb-1">
                  {FILES.map((f) => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
                <div className="flex">
                  <div className="flex flex-col mr-1">
                    {RANKS.map((r) => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
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
                    {RANKS.map((r) => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                  </div>
                </div>
                <div className="flex ml-8 mt-1">
                  {FILES.map((f) => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
              </div>

              <div className="flex items-center gap-2 h-8">
                <span className="text-xs text-muted-foreground">White captured:</span>
                <div className="flex gap-1 text-2xl">{capturedPieces.white.map((p, i) => <span key={i}>{p}</span>)}</div>
              </div>

              <div className="flex gap-3">
                <button onClick={resetGame} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  New Game
                </button>
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0 || isGameOver}
                  className="flex items-center gap-2 px-4 py-3 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-40"
                >
                  <Undo2 className="w-4 h-4" /> Undo
                </button>
              </div>
            </div>

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

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Full chess rules • Castling • Pawn Promotion • Threefold Repetition • 50-Move Rule</p>
        </div>
      </div>

      {pendingPromotion && <PromotionDialog color={currentTurn} onSelect={handlePromotion} />}

      <GameEndDialog
        open={showEndDialog}
        status={isGameOver ? gameStatus as any : null}
        winner={winner}
        playerLabel={{ white: "White", black: "Black" }}
        onNewGame={resetGame}
        onClose={() => setShowEndDialog(false)}
        onAnalyze={() => { setShowEndDialog(false); setShowAnalysis(true); }}
      />
    </div>
  );
};

export default LocalMatch;
