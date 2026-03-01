import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Lightbulb, ThumbsUp, ThumbsDown, Star, AlertTriangle, XCircle, BookOpen, ChevronLeft } from "lucide-react";
import { MoveRecord } from "./MoveHistory";
import { Board, PieceColor, PIECE_SYMBOLS, createInitialBoard, makeMove, Position, getValidMoves, isKingInCheck, CastlingRights, createInitialCastlingRights, updateCastlingRights } from "@/lib/chess";
import { evaluateBoardForAnalysis, getBestMoveForAnalysis } from "@/lib/chessAnalysis";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";

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
  bestMove?: string;
  bestEval?: number;
}

type MoveQuality = "brilliant" | "great" | "best" | "excellent" | "good" | "book" | "inaccuracy" | "mistake" | "blunder";

const QUALITY_CONFIG: Record<MoveQuality, { icon: React.ReactNode; color: string; label: string }> = {
  brilliant: { icon: <span className="text-lg">‼</span>, color: "text-cyan-400", label: "Brilliant" },
  great: { icon: <span className="text-lg">!</span>, color: "text-blue-400", label: "Great" },
  best: { icon: <Star className="w-4 h-4" />, color: "text-green-500", label: "Best" },
  excellent: { icon: <ThumbsUp className="w-4 h-4" />, color: "text-green-400", label: "Excellent" },
  good: { icon: <span className="text-sm">✓</span>, color: "text-green-300", label: "Good" },
  book: { icon: <BookOpen className="w-4 h-4" />, color: "text-amber-400", label: "Book" },
  inaccuracy: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-yellow-500", label: "Inaccuracy" },
  mistake: { icon: <ThumbsDown className="w-4 h-4" />, color: "text-orange-500", label: "Mistake" },
  blunder: { icon: <XCircle className="w-4 h-4" />, color: "text-red-500", label: "Blunder" },
};

const PIECE_LETTERS: Record<string, string> = {
  king: "K", queen: "Q", rook: "R", bishop: "B", knight: "N", pawn: "",
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

const FILES = "abcdefgh";
const parseNotation = (s: string): Position => ({ row: 8 - parseInt(s[1]), col: FILES.indexOf(s[0]) });

export const GameAnalysis = ({ moves, playerLabel, onClose }: GameAnalysisProps) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // Analyze all moves
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

      // Get best move for the moving side
      const best = getBestMoveForAnalysis(board, move.color, rights);
      const newRights = updateCastlingRights(rights, board, from, to);
      const newBoard = makeMove(board, from, to, move.isPromotion);
      const evalAfter = evaluateBoardForAnalysis(newBoard, "white");

      // Calculate quality based on eval change
      const perspective = move.color === "white" ? 1 : -1;
      const evalDrop = (evalBefore - evalAfter) * perspective; // positive = player lost advantage

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

      let bestMoveStr: string | undefined;
      if (best && quality !== "best" && quality !== "book") {
        bestMoveStr = `${PIECE_LETTERS[board[best.from.row][best.from.col]?.type || "pawn"]}${FILES[best.to.col]}${8 - best.to.row}`;
      }

      results.push({
        move,
        evalBefore,
        evalAfter,
        quality,
        bestMove: bestMoveStr,
        bestEval: best?.eval,
      });

      board = newBoard;
      rights = newRights;
    }
    return results;
  }, [moves]);

  // Compute board at current move index
  const currentBoard = useMemo(() => {
    let board = createInitialBoard();
    for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
      const m = moves[i];
      board = makeMove(board, parseNotation(m.from), parseNotation(m.to), m.isPromotion);
    }
    return board;
  }, [currentMoveIndex, moves]);

  // Compute accuracy
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

  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onClose} className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Game Review</h1>
          </div>
        </div>

        {/* Accuracy Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">{playerLabel.white} (White)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{whiteAccuracy}</span>
              <span className="text-sm text-muted-foreground">accuracy</span>
            </div>
            <Progress value={whiteAccuracy} className="h-2 mt-2" />
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">{playerLabel.black} (Black)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{blackAccuracy}</span>
              <span className="text-sm text-muted-foreground">accuracy</span>
            </div>
            <Progress value={blackAccuracy} className="h-2 mt-2" />
          </div>
        </div>

        {/* Quality breakdown table */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="font-semibold text-muted-foreground">Move Type</div>
            <div className="text-center font-semibold text-muted-foreground">Icon</div>
            <div className="text-center font-semibold text-muted-foreground">{playerLabel.white}</div>
            <div className="text-center font-semibold text-muted-foreground">{playerLabel.black}</div>
            {qualityTypes.map(q => {
              const cfg = QUALITY_CONFIG[q];
              const wc = countQuality("white", q);
              const bc = countQuality("black", q);
              if (wc === 0 && bc === 0) return null;
              return (
                <div key={q} className="contents">
                  <div className={`font-semibold ${cfg.color}`}>{cfg.label}</div>
                  <div className={`text-center ${cfg.color}`}>{cfg.icon}</div>
                  <div className={`text-center font-bold ${cfg.color}`}>{wc}</div>
                  <div className={`text-center font-bold ${cfg.color}`}>{bc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Board replay */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="flex ml-8 mb-1">
                {files.map(f => <div key={f} className="w-10 md:w-12 text-center text-xs text-muted-foreground">{f}</div>)}
              </div>
              <div className="flex">
                <div className="flex flex-col mr-1">
                  {ranks.map(r => <div key={r} className="h-10 md:h-12 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                </div>
                <div className="grid grid-cols-8 rounded-lg overflow-hidden shadow-xl border-2 border-secondary">
                  {currentBoard.map((row, ri) =>
                    row.map((piece, ci) => {
                      const isLight = (ri + ci) % 2 === 0;
                      const isFromSquare = currentAnalysis && parseNotation(currentAnalysis.move.from).row === ri && parseNotation(currentAnalysis.move.from).col === ci;
                      const isToSquare = currentAnalysis && parseNotation(currentAnalysis.move.to).row === ri && parseNotation(currentAnalysis.move.to).col === ci;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative
                            ${isLight ? "chess-square-light" : "chess-square-dark"}
                            ${isFromSquare ? "ring-2 ring-inset ring-yellow-400/60" : ""}
                            ${isToSquare ? "ring-2 ring-inset ring-primary/60" : ""}
                          `}
                        >
                          {piece && (
                            <span className={`text-2xl md:text-3xl select-none ${piece.color === "white" ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"}`}
                              style={{ WebkitTextStroke: piece.color === "white" ? "1px #333" : "none" }}
                            >
                              {PIECE_SYMBOLS[piece.color][piece.type]}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Move navigation */}
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMoveIndex(-1)} className="p-2 bg-card rounded-lg border border-border hover:bg-secondary" disabled={currentMoveIndex < 0}>
                <ArrowLeft className="w-4 h-4" /><ArrowLeft className="w-4 h-4 -ml-3" />
              </button>
              <button onClick={() => setCurrentMoveIndex(i => Math.max(-1, i - 1))} className="p-2 bg-card rounded-lg border border-border hover:bg-secondary" disabled={currentMoveIndex < 0}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground px-2">
                {currentMoveIndex < 0 ? "Start" : `Move ${currentMoveIndex + 1}/${moves.length}`}
              </span>
              <button onClick={() => setCurrentMoveIndex(i => Math.min(moves.length - 1, i + 1))} className="p-2 bg-card rounded-lg border border-border hover:bg-secondary" disabled={currentMoveIndex >= moves.length - 1}>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentMoveIndex(moves.length - 1)} className="p-2 bg-card rounded-lg border border-border hover:bg-secondary" disabled={currentMoveIndex >= moves.length - 1}>
                <ArrowRight className="w-4 h-4" /><ArrowRight className="w-4 h-4 -ml-3" />
              </button>
            </div>

            {/* Current move feedback */}
            {currentAnalysis && (
              <div className="bg-card rounded-xl border border-border p-4 w-full max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={QUALITY_CONFIG[currentAnalysis.quality].color}>
                    {QUALITY_CONFIG[currentAnalysis.quality].icon}
                  </span>
                  <span className={`font-bold ${QUALITY_CONFIG[currentAnalysis.quality].color}`}>
                    {formatMoveNotation(currentAnalysis.move)} is {QUALITY_CONFIG[currentAnalysis.quality].label.toLowerCase()}
                  </span>
                </div>
                {currentAnalysis.bestMove && currentAnalysis.quality !== "best" && currentAnalysis.quality !== "book" && (
                  <div className="bg-secondary/50 rounded-lg p-3 flex items-start gap-2 mt-2">
                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-primary">Better move</p>
                      <p className="text-sm text-foreground font-mono">{currentAnalysis.bestMove}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Move list with quality indicators */}
          <div className="bg-card rounded-xl border border-border p-3 w-full lg:w-64">
            <h3 className="text-sm font-bold text-foreground mb-2">Moves</h3>
            <ScrollArea className="h-80">
              <div className="space-y-0.5 pr-2">
                {analysis.map((a, i) => {
                  const cfg = QUALITY_CONFIG[a.quality];
                  const isSelected = i === currentMoveIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentMoveIndex(i)}
                      className={`w-full flex items-center gap-2 text-xs font-mono px-2 py-1 rounded transition-colors text-left ${
                        isSelected ? "bg-primary/20 border border-primary/30" : "hover:bg-secondary/50"
                      }`}
                    >
                      {a.move.color === "white" && (
                        <span className="text-muted-foreground w-6 text-right shrink-0">{a.move.moveNumber}.</span>
                      )}
                      {a.move.color === "black" && (
                        <span className="w-6 shrink-0" />
                      )}
                      <span className={`${cfg.color}`}>{cfg.icon}</span>
                      <span className="text-foreground font-semibold">{formatMoveNotation(a.move)}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
