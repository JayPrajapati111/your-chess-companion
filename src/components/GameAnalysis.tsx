import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Lightbulb, ThumbsUp, ThumbsDown, Star, AlertTriangle, XCircle, BookOpen, ChevronLeft, Eye } from "lucide-react";
import { MoveRecord } from "./MoveHistory";
import { Board, PieceColor, PIECE_SYMBOLS, createInitialBoard, makeMove, Position, getValidMoves, isKingInCheck, CastlingRights, createInitialCastlingRights, updateCastlingRights } from "@/lib/chess";
import { evaluateBoardForAnalysis, getBestMoveForAnalysis } from "@/lib/chessAnalysis";
import { ScrollArea } from "./ui/scroll-area";

interface GameAnalysisProps {
  moves: MoveRecord[];
  playerLabel: { white: string; black: string };
  onClose: () => void;
}

interface AnalyzedMove {
  move: MoveRecord;
  evalBefore: number;
  evalAfter: number;
  quality: MoveQuality;
  bestMove?: { from: Position; to: Position };
  bestMoveStr?: string;
  bestEval?: number;
  commentary: string;
}

type MoveQuality = "brilliant" | "great" | "best" | "excellent" | "good" | "book" | "inaccuracy" | "mistake" | "blunder";

const QUALITY_CONFIG: Record<MoveQuality, { icon: React.ReactNode; color: string; label: string; bgColor: string }> = {
  brilliant: { icon: <span className="text-lg font-bold">‼</span>, color: "text-cyan-400", bgColor: "bg-cyan-500", label: "Brilliant" },
  great: { icon: <span className="text-lg font-bold">!</span>, color: "text-blue-400", bgColor: "bg-blue-500", label: "Great" },
  best: { icon: <Star className="w-4 h-4" />, color: "text-green-500", bgColor: "bg-green-600", label: "Best" },
  excellent: { icon: <ThumbsUp className="w-4 h-4" />, color: "text-green-400", bgColor: "bg-green-500", label: "Excellent" },
  good: { icon: <span className="text-sm">✓</span>, color: "text-green-300", bgColor: "bg-green-400", label: "Good" },
  book: { icon: <BookOpen className="w-4 h-4" />, color: "text-amber-400", bgColor: "bg-amber-500", label: "Book" },
  inaccuracy: { icon: <span className="font-bold">?!</span>, color: "text-yellow-500", bgColor: "bg-yellow-500", label: "Inaccuracy" },
  mistake: { icon: <span className="font-bold">?</span>, color: "text-orange-500", bgColor: "bg-orange-500", label: "Mistake" },
  blunder: { icon: <span className="font-bold">??</span>, color: "text-red-500", bgColor: "bg-red-600", label: "Blunder" },
};

const PIECE_LETTERS: Record<string, string> = {
  king: "K", queen: "Q", rook: "R", bishop: "B", knight: "N", pawn: "",
};

const PIECE_ICONS: Record<string, string> = {
  king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙",
};

function formatMoveNotation(move: MoveRecord): string {
  if (move.isCastling === "kingside") return "O-O";
  if (move.isCastling === "queenside") return "O-O-O";
  let n = PIECE_LETTERS[move.piece];
  if (move.captured) { if (move.piece === "pawn") n += move.from[0]; n += "x"; }
  n += move.to;
  if (move.isPromotion) n += "=" + PIECE_LETTERS[move.isPromotion];
  if (move.isCheckmate) n += "#";
  else if (move.isCheck) n += "+";
  return n;
}

function getCommentary(quality: MoveQuality, move: MoveRecord, evalAfter: number): string {
  const evalStr = evalAfter > 0 ? `+${(evalAfter / 100).toFixed(2)}` : (evalAfter / 100).toFixed(2);
  const pieceIcon = PIECE_ICONS[move.piece] || "";
  const notation = formatMoveNotation(move);
  
  switch (quality) {
    case "brilliant": return `Incredible move! ${pieceIcon}${notation} creates a stunning tactical opportunity.`;
    case "great": return `Nice ${move.piece === "knight" ? "fork" : "move"}! You'll be winning material.`;
    case "best": return `${notation} is best`;
    case "excellent": return `Strong play. This keeps the pressure on your opponent.`;
    case "good": return `A solid move that maintains your position.`;
    case "book": return `A fundamental move that leads to several exciting openings.`;
    case "inaccuracy": return `Their central pawn is now blocked. A slightly better option was available.`;
    case "mistake": return `This gives away some advantage. There was a stronger continuation.`;
    case "blunder": return `A serious mistake that changes the evaluation significantly.`;
    default: return "";
  }
}

const FILES = "abcdefgh";
const parseNotation = (s: string): Position => ({ row: 8 - parseInt(s[1]), col: FILES.indexOf(s[0]) });

export const GameAnalysis = ({ moves, playerLabel, onClose }: GameAnalysisProps) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [showBestMove, setShowBestMove] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);

  const analysis = useMemo(() => {
    if (moves.length === 0) return [];
    const results: AnalyzedMove[] = [];
    let board = createInitialBoard();
    let rights = createInitialCastlingRights();

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const from = parseNotation(move.from);
      const to = parseNotation(move.to);
      const evalBefore = evaluateBoardForAnalysis(board, "white");
      const best = getBestMoveForAnalysis(board, move.color, rights);
      const newRights = updateCastlingRights(rights, board, from, to);
      const newBoard = makeMove(board, from, to, move.isPromotion);
      const evalAfter = evaluateBoardForAnalysis(newBoard, "white");

      const perspective = move.color === "white" ? 1 : -1;
      const evalDrop = (evalBefore - evalAfter) * perspective;

      let quality: MoveQuality;
      if (i < 4) {
        quality = "book";
      } else if (best && best.from.row === from.row && best.from.col === from.col && best.to.row === to.row && best.to.col === to.col) {
        quality = "best";
      } else if (evalDrop < -50) {
        quality = Math.random() > 0.5 ? "brilliant" : "great";
      } else if (evalDrop < 10) {
        quality = "excellent";
      } else if (evalDrop < 30) {
        quality = "good";
      } else if (evalDrop < 80) {
        quality = "inaccuracy";
      } else if (evalDrop < 200) {
        quality = "mistake";
      } else {
        quality = "blunder";
      }

      let bestMovePos: { from: Position; to: Position } | undefined;
      let bestMoveStr: string | undefined;
      if (best && quality !== "best" && quality !== "book") {
        bestMovePos = { from: best.from, to: best.to };
        const piece = board[best.from.row][best.from.col];
        bestMoveStr = `${PIECE_LETTERS[piece?.type || "pawn"]}${FILES[best.to.col]}${8 - best.to.row}`;
      }

      results.push({
        move,
        evalBefore,
        evalAfter,
        quality,
        bestMove: bestMovePos,
        bestMoveStr,
        bestEval: best?.eval,
        commentary: getCommentary(quality, move, evalAfter),
      });

      board = newBoard;
      rights = newRights;
    }
    return results;
  }, [moves]);

  const currentBoard = useMemo(() => {
    let board = createInitialBoard();
    for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
      const m = moves[i];
      board = makeMove(board, parseNotation(m.from), parseNotation(m.to), m.isPromotion);
    }
    return board;
  }, [currentMoveIndex, moves]);

  const computeAccuracy = (color: PieceColor) => {
    const colorMoves = analysis.filter(a => a.move.color === color);
    if (colorMoves.length === 0) return 0;
    const scores: Record<MoveQuality, number> = {
      brilliant: 100, great: 95, best: 100, excellent: 90, good: 75, book: 100, inaccuracy: 50, mistake: 25, blunder: 0,
    };
    const total = colorMoves.reduce((sum, m) => sum + scores[m.quality], 0);
    return Math.round(total / colorMoves.length * 10) / 10;
  };

  const whiteAccuracy = computeAccuracy("white");
  const blackAccuracy = computeAccuracy("black");
  const countQuality = (color: PieceColor, q: MoveQuality) => analysis.filter(a => a.move.color === color && a.quality === q).length;
  const qualityTypes: MoveQuality[] = ["brilliant", "great", "best", "excellent", "good", "book", "inaccuracy", "mistake", "blunder"];
  const currentAnalysis = currentMoveIndex >= 0 ? analysis[currentMoveIndex] : null;

  // Eval bar calculation - normalize to 0-100 range for display
  const currentEval = currentAnalysis ? currentAnalysis.evalAfter : 0;
  const evalCentipawns = currentEval;
  const whiteBarPercent = Math.min(95, Math.max(5, 50 + (evalCentipawns / 40)));
  const evalDisplay = evalCentipawns >= 0 ? `+${(evalCentipawns / 100).toFixed(2)}` : (evalCentipawns / 100).toFixed(2);

  const goNext = () => {
    setCurrentMoveIndex(i => Math.min(moves.length - 1, i + 1));
    setShowBestMove(false);
  };
  const goPrev = () => {
    setCurrentMoveIndex(i => Math.max(-1, i - 1));
    setShowBestMove(false);
  };

  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const filesArr = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // Summary screen (before review starts)
  if (!reviewStarted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 relative">
        <div className="chess-bg" />
        <div className="chess-bg-vignette" />
        <div className="max-w-lg mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onClose} className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Game Review</h1>
            </div>
          </div>

          {/* Coach message */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-3xl shrink-0">
              🧑‍🏫
            </div>
            <div className="bg-foreground text-background rounded-2xl rounded-tl-none px-5 py-3 text-sm font-medium">
              {whiteAccuracy > blackAccuracy
                ? `Way to go! ${playerLabel.white} took the advantage when they saw their chance.`
                : blackAccuracy > whiteAccuracy
                  ? `Good game! ${playerLabel.black} played more accurately overall.`
                  : `A closely matched game! Both sides played well.`
              }
            </div>
          </div>

          {/* Eval chart placeholder */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6 h-16 flex items-end gap-px overflow-hidden">
            {analysis.map((a, i) => {
              const h = Math.min(100, Math.max(5, 50 + a.evalAfter / 40));
              return (
                <div key={i} className="flex-1 bg-foreground/20 rounded-t-sm relative" style={{ height: `${h}%` }}>
                  <div className="absolute inset-0 rounded-t-sm" style={{ background: a.evalAfter >= 0 ? 'hsl(0 0% 90%)' : 'hsl(220 10% 25%)' }} />
                </div>
              );
            })}
          </div>

          {/* Players & Accuracy */}
          <div className="grid grid-cols-3 gap-4 mb-6 items-center">
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{playerLabel.white}</p>
              <div className="text-4xl mt-1">♔</div>
            </div>
            <div className="text-center text-xs text-muted-foreground font-semibold">Players</div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{playerLabel.black}</p>
              <div className="text-4xl mt-1">♚</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 items-center">
            <div className="text-center">
              <div className="inline-block px-5 py-2 rounded-lg bg-foreground text-background text-2xl font-bold">{whiteAccuracy}</div>
            </div>
            <div className="text-center text-xs text-muted-foreground font-semibold">Accuracy</div>
            <div className="text-center">
              <div className="inline-block px-5 py-2 rounded-lg bg-muted text-foreground text-2xl font-bold">{blackAccuracy}</div>
            </div>
          </div>

          <div className="border-t border-border my-4" />

          {/* Quality breakdown table */}
          <div className="space-y-2 mb-6">
            {qualityTypes.map(q => {
              const cfg = QUALITY_CONFIG[q];
              const wc = countQuality("white", q);
              const bc = countQuality("black", q);
              if (wc === 0 && bc === 0) return null;
              return (
                <div key={q} className="grid grid-cols-3 items-center text-sm py-1">
                  <div className={`text-center font-bold ${cfg.color}`}>{wc}</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className={`w-6 h-6 rounded-full ${cfg.bgColor} flex items-center justify-center text-white text-xs`}>
                      {cfg.icon}
                    </span>
                  </div>
                  <div className={`text-center font-bold ${cfg.color}`}>{bc}</div>
                </div>
              );
            })}
          </div>

          {/* Start Review Button */}
          <button
            onClick={() => { setReviewStarted(true); setCurrentMoveIndex(0); }}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Start Review
          </button>
        </div>
      </div>
    );
  }

  // Review mode - chess.com style
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="chess-bg" />
      <div className="chess-bg-vignette" />
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => setReviewStarted(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1 text-center">Game Review</h1>
          <div className="w-8" />
        </div>

        {/* Coach commentary */}
        {currentAnalysis && (
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl shrink-0">
              🧑‍🏫
            </div>
            <div className="bg-foreground text-background rounded-2xl rounded-tl-none px-4 py-3 text-sm flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full ${QUALITY_CONFIG[currentAnalysis.quality].bgColor} flex items-center justify-center text-white text-xs`}>
                    {QUALITY_CONFIG[currentAnalysis.quality].icon}
                  </span>
                  <span className="font-bold">{PIECE_ICONS[currentAnalysis.move.piece]}{formatMoveNotation(currentAnalysis.move)} is {currentAnalysis.quality === "best" ? "best" : (["brilliant","great","excellent","good"].includes(currentAnalysis.quality) ? `a ${currentAnalysis.quality} move` : `an ${currentAnalysis.quality}`)}</span>
                </div>
                <span className="text-xs bg-background/20 px-2 py-0.5 rounded font-mono">{evalDisplay}</span>
              </div>
              <p className="text-xs opacity-80">{currentAnalysis.commentary}</p>
            </div>
          </div>
        )}

        {/* Board + Eval bar */}
        <div className="flex-1 flex items-center justify-center px-2 py-2">
          <div className="flex gap-1">
            {/* Eval bar */}
            <div className="w-6 rounded-lg overflow-hidden border border-border flex flex-col" style={{ height: "min(80vw, 384px)" }}>
              <div className="bg-gray-800 transition-all duration-500 ease-in-out" style={{ height: `${100 - whiteBarPercent}%` }} />
              <div className="bg-gray-100 transition-all duration-500 ease-in-out flex-1" />
            </div>

            {/* Board */}
            <div className="relative">
              <div className="grid grid-cols-8 rounded-lg overflow-hidden shadow-xl" style={{ width: "min(80vw, 384px)", height: "min(80vw, 384px)" }}>
                {currentBoard.map((row, ri) =>
                  row.map((piece, ci) => {
                    const isLight = (ri + ci) % 2 === 0;
                    const isFromSquare = currentAnalysis && parseNotation(currentAnalysis.move.from).row === ri && parseNotation(currentAnalysis.move.from).col === ci;
                    const isToSquare = currentAnalysis && parseNotation(currentAnalysis.move.to).row === ri && parseNotation(currentAnalysis.move.to).col === ci;
                    const isBestFrom = showBestMove && currentAnalysis?.bestMove && currentAnalysis.bestMove.from.row === ri && currentAnalysis.bestMove.from.col === ci;
                    const isBestTo = showBestMove && currentAnalysis?.bestMove && currentAnalysis.bestMove.to.row === ri && currentAnalysis.bestMove.to.col === ci;
                    
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        className={`relative flex items-center justify-center
                          ${isLight ? "chess-square-light" : "chess-square-dark"}
                          ${isToSquare ? "!bg-yellow-400/50" : ""}
                          ${isFromSquare ? "!bg-yellow-400/30" : ""}
                          ${isBestTo ? "!bg-green-400/50" : ""}
                          ${isBestFrom ? "!bg-green-400/30" : ""}
                        `}
                        style={{ width: "calc(min(80vw, 384px) / 8)", height: "calc(min(80vw, 384px) / 8)" }}
                      >
                        {/* Rank/file labels */}
                        {ci === 0 && <span className="absolute top-0.5 left-0.5 text-[10px] font-bold opacity-50">{ranks[ri]}</span>}
                        {ri === 7 && <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-50">{filesArr[ci]}</span>}
                        
                        {piece && (
                          <span className={`text-2xl md:text-3xl select-none ${piece.color === "white" ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"}`}
                            style={{ WebkitTextStroke: piece.color === "white" ? "1px #333" : "none" }}
                          >
                            {PIECE_SYMBOLS[piece.color][piece.type]}
                          </span>
                        )}

                        {/* Quality badge on the move target */}
                        {isToSquare && currentAnalysis && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${QUALITY_CONFIG[currentAnalysis.quality].bgColor} flex items-center justify-center text-white text-[10px] z-10 shadow-lg`}>
                            {QUALITY_CONFIG[currentAnalysis.quality].icon}
                          </div>
                        )}

                        {/* Best move arrow indicator */}
                        {isBestTo && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] z-10 shadow-lg">
                            <Star className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom move strip */}
        <div className="border-t border-border px-2 py-2">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 px-2 py-1 min-w-max">
              <button onClick={goPrev} disabled={currentMoveIndex < 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                <ArrowLeft className="w-5 h-5" />
              </button>
              {analysis.map((a, i) => {
                const cfg = QUALITY_CONFIG[a.quality];
                const isSelected = i === currentMoveIndex;
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentMoveIndex(i); setShowBestMove(false); }}
                    className={`flex items-center gap-1 text-xs font-mono px-1.5 py-1 rounded transition-colors shrink-0 ${
                      isSelected ? "bg-primary/20 border border-primary/30" : "hover:bg-secondary/50"
                    }`}
                  >
                    {a.move.color === "white" && <span className="text-muted-foreground">{a.move.moveNumber}.</span>}
                    <span className={`w-4 h-4 rounded-full ${cfg.bgColor} flex items-center justify-center text-white text-[8px]`}>
                      {cfg.icon}
                    </span>
                    <span className="text-foreground font-semibold">{formatMoveNotation(a.move)}</span>
                  </button>
                );
              })}
              <button onClick={goNext} disabled={currentMoveIndex >= moves.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </ScrollArea>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          {currentAnalysis?.bestMove && currentAnalysis.quality !== "best" && currentAnalysis.quality !== "book" && (
            <button
              onClick={() => setShowBestMove(!showBestMove)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                showBestMove ? "bg-green-600 text-white" : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              <Eye className="w-4 h-4" /> Best
            </button>
          )}
          <button
            onClick={() => { setCurrentMoveIndex(-1); setShowBestMove(false); startScenario(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-card border border-border text-foreground hover:bg-secondary transition-colors"
          >
            ↺ Retry
          </button>
          <button
            onClick={goNext}
            disabled={currentMoveIndex >= moves.length - 1}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  function startScenario() {
    setCurrentMoveIndex(0);
    setShowBestMove(false);
  }
};
