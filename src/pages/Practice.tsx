import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Lightbulb, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import {
  Board,
  Position,
  PieceColor,
  PieceType,
  Piece,
  PIECE_SYMBOLS,
  CastlingRights,
  createInitialCastlingRights,
  getValidMoves,
  makeMove,
  isKingInCheck,
  isCheckmate,
  isValidPosition,
} from "@/lib/chess";

interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  category: "Checkmate" | "Tactics" | "Endgame";
  difficulty: "Easy" | "Medium" | "Hard";
  board: Board;
  playerColor: PieceColor;
  solution: { from: Position; to: Position }[];
  hint: string;
}

const emptyBoard = (): Board => Array(8).fill(null).map(() => Array(8).fill(null));

const placePiece = (board: Board, row: number, col: number, type: PieceType, color: PieceColor): Board => {
  const b = board.map(r => [...r]);
  b[row][col] = { type, color };
  return b;
};

const buildBoard = (pieces: { row: number; col: number; type: PieceType; color: PieceColor }[]): Board => {
  let b = emptyBoard();
  for (const p of pieces) b = placePiece(b, p.row, p.col, p.type, p.color);
  return b;
};

const SCENARIOS: PracticeScenario[] = [
  // === CHECKMATE (multi-step) ===
  {
    id: "mate1-1",
    title: "Back Rank Mate",
    description: "Deliver checkmate with your rook on the back rank",
    category: "Checkmate",
    difficulty: "Easy",
    board: buildBoard([
      { row: 0, col: 6, type: "king", color: "black" },
      { row: 1, col: 5, type: "pawn", color: "black" },
      { row: 1, col: 6, type: "pawn", color: "black" },
      { row: 1, col: 7, type: "pawn", color: "black" },
      { row: 7, col: 4, type: "rook", color: "white" },
      { row: 7, col: 6, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [{ from: { row: 7, col: 4 }, to: { row: 0, col: 4 } }],
    hint: "The black king is trapped behind its own pawns. Use the open file!",
  },
  {
    id: "mate2-step",
    title: "Queen Sacrifice & Back Rank",
    description: "Sacrifice your queen to set up a back rank mate with the rook",
    category: "Checkmate",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 5, type: "rook", color: "black" },
      { row: 0, col: 7, type: "king", color: "black" },
      { row: 1, col: 6, type: "pawn", color: "black" },
      { row: 1, col: 7, type: "pawn", color: "black" },
      { row: 3, col: 3, type: "queen", color: "white" },
      { row: 7, col: 0, type: "rook", color: "white" },
      { row: 7, col: 6, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 3, col: 3 }, to: { row: 0, col: 3 } },
      { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    ],
    hint: "First sacrifice the queen with check to deflect the rook, then deliver mate!",
  },
  {
    id: "mate-ladder",
    title: "Two Rook Ladder Mate",
    description: "Use two rooks to deliver a staircase checkmate in 2 moves",
    category: "Checkmate",
    difficulty: "Easy",
    board: buildBoard([
      { row: 1, col: 4, type: "king", color: "black" },
      { row: 3, col: 0, type: "rook", color: "white" },
      { row: 4, col: 1, type: "rook", color: "white" },
      { row: 7, col: 7, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 4, col: 1 }, to: { row: 0, col: 1 } },
      { from: { row: 3, col: 0 }, to: { row: 1, col: 0 } },
    ],
    hint: "Check with one rook on the 8th rank, then use the other to deliver mate on the 7th!",
  },
  {
    id: "mate-smothered",
    title: "Smothered Mate Setup",
    description: "Force a smothered mate with queen sacrifice",
    category: "Checkmate",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 5, type: "rook", color: "black" },
      { row: 0, col: 6, type: "king", color: "black" },
      { row: 0, col: 7, type: "rook", color: "black" },
      { row: 1, col: 5, type: "pawn", color: "black" },
      { row: 1, col: 6, type: "pawn", color: "black" },
      { row: 1, col: 7, type: "pawn", color: "black" },
      { row: 2, col: 5, type: "knight", color: "white" },
      { row: 3, col: 7, type: "queen", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 2, col: 5 }, to: { row: 0, col: 4 } },
      { from: { row: 3, col: 7 }, to: { row: 1, col: 7 } },
    ],
    hint: "Check with the knight first forcing the king to the corner, then sacrifice the queen!",
  },
  {
    id: "mate-bishop-queen",
    title: "Bishop & Queen Diagonal Mate",
    description: "Coordinate bishop and queen for a 2-move checkmate",
    category: "Checkmate",
    difficulty: "Medium",
    board: buildBoard([
      { row: 0, col: 6, type: "king", color: "black" },
      { row: 1, col: 5, type: "pawn", color: "black" },
      { row: 1, col: 7, type: "pawn", color: "black" },
      { row: 4, col: 3, type: "bishop", color: "white" },
      { row: 5, col: 4, type: "queen", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 5, col: 4 }, to: { row: 2, col: 7 } },
      { from: { row: 2, col: 7 }, to: { row: 1, col: 6 } },
    ],
    hint: "Bring the queen close with check, then deliver mate with bishop support!",
  },
  {
    id: "mate-double-check",
    title: "Double Check Mate",
    description: "Use a discovered double check to deliver mate",
    category: "Checkmate",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 1, col: 3, type: "pawn", color: "black" },
      { row: 1, col: 5, type: "pawn", color: "black" },
      { row: 2, col: 4, type: "knight", color: "white" },
      { row: 7, col: 4, type: "rook", color: "white" },
      { row: 7, col: 7, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 2, col: 4 }, to: { row: 0, col: 3 } },
    ],
    hint: "Move the knight to create a double check from both knight and rook!",
  },

  // === TACTICS (multi-step) ===
  {
    id: "tactics-fork-2step",
    title: "Knight Fork Setup",
    description: "Set up a devastating knight fork in 2 moves",
    category: "Tactics",
    difficulty: "Medium",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 0, col: 7, type: "rook", color: "black" },
      { row: 1, col: 4, type: "pawn", color: "black" },
      { row: 4, col: 3, type: "knight", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
      { row: 7, col: 0, type: "rook", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 4, col: 3 }, to: { row: 2, col: 4 } },
      { from: { row: 2, col: 4 }, to: { row: 0, col: 5 } },
    ],
    hint: "Reposition the knight to attack king and rook simultaneously!",
  },
  {
    id: "tactics-pin-win",
    title: "Pin & Win Material",
    description: "Use a pin to win a piece in 2 moves",
    category: "Tactics",
    difficulty: "Medium",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 2, col: 4, type: "knight", color: "black" },
      { row: 1, col: 3, type: "pawn", color: "black" },
      { row: 1, col: 5, type: "pawn", color: "black" },
      { row: 6, col: 4, type: "rook", color: "white" },
      { row: 6, col: 0, type: "pawn", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 7, col: 4 }, to: { row: 7, col: 3 } },
      { from: { row: 6, col: 4 }, to: { row: 2, col: 4 } },
    ],
    hint: "Move the king off the file first, then capture the pinned knight!",
  },
  {
    id: "tactics-skewer",
    title: "Rook Skewer",
    description: "Skewer the king to win the piece behind it",
    category: "Tactics",
    difficulty: "Medium",
    board: buildBoard([
      { row: 0, col: 3, type: "queen", color: "black" },
      { row: 0, col: 7, type: "king", color: "black" },
      { row: 4, col: 7, type: "rook", color: "white" },
      { row: 7, col: 0, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 4, col: 7 }, to: { row: 0, col: 7 } },
    ],
    hint: "Check the king along the file — when it moves, you win the queen!",
  },
  {
    id: "tactics-discovered",
    title: "Discovered Attack",
    description: "Reveal a hidden attack by moving one piece",
    category: "Tactics",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 0, col: 0, type: "rook", color: "black" },
      { row: 3, col: 4, type: "bishop", color: "white" },
      { row: 7, col: 4, type: "rook", color: "white" },
      { row: 7, col: 7, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 3, col: 4 }, to: { row: 1, col: 2 } },
      { from: { row: 7, col: 4 }, to: { row: 0, col: 4 } },
    ],
    hint: "Move the bishop to reveal the rook's attack, then capture!",
  },
  {
    id: "tactics-double-attack",
    title: "Queen Double Attack",
    description: "Attack two undefended pieces at once",
    category: "Tactics",
    difficulty: "Easy",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 0, col: 0, type: "rook", color: "black" },
      { row: 1, col: 4, type: "pawn", color: "black" },
      { row: 5, col: 0, type: "queen", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 5, col: 0 }, to: { row: 3, col: 2 } },
    ],
    hint: "Find a square for your queen that attacks both the king and the rook!",
  },
  {
    id: "tactics-remove-defender",
    title: "Remove the Defender",
    description: "Capture the defending piece then win material",
    category: "Tactics",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 0, col: 7, type: "rook", color: "black" },
      { row: 1, col: 5, type: "knight", color: "black" },
      { row: 1, col: 6, type: "pawn", color: "black" },
      { row: 3, col: 2, type: "bishop", color: "white" },
      { row: 5, col: 7, type: "rook", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 3, col: 2 }, to: { row: 1, col: 4 } },
      { from: { row: 5, col: 7 }, to: { row: 0, col: 7 } },
    ],
    hint: "The knight defends the rook. Remove it first, then capture!",
  },
  {
    id: "tactics-zwischenzug",
    title: "Intermediate Move",
    description: "Play an in-between move before recapturing",
    category: "Tactics",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 4, type: "king", color: "black" },
      { row: 2, col: 3, type: "bishop", color: "black" },
      { row: 3, col: 5, type: "pawn", color: "black" },
      { row: 4, col: 4, type: "queen", color: "white" },
      { row: 6, col: 4, type: "pawn", color: "white" },
      { row: 7, col: 4, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 4, col: 4 }, to: { row: 0, col: 4 } },
    ],
    hint: "Instead of capturing the bishop, check the king first to win more!",
  },

  // === ENDGAME (multi-step) ===
  {
    id: "endgame-promo-2step",
    title: "Escort the Pawn",
    description: "Use your king to escort the pawn to promotion",
    category: "Endgame",
    difficulty: "Medium",
    board: buildBoard([
      { row: 0, col: 7, type: "king", color: "black" },
      { row: 2, col: 0, type: "pawn", color: "white" },
      { row: 2, col: 1, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 2, col: 1 }, to: { row: 1, col: 0 } },
      { from: { row: 2, col: 0 }, to: { row: 1, col: 0 } },
    ],
    hint: "Move the king to protect the pawn's advance, then push!",
  },
  {
    id: "endgame-rook-cut",
    title: "Rook Cutoff",
    description: "Cut off the enemy king with your rook, then push the pawn",
    category: "Endgame",
    difficulty: "Medium",
    board: buildBoard([
      { row: 2, col: 6, type: "king", color: "black" },
      { row: 5, col: 0, type: "pawn", color: "white" },
      { row: 5, col: 3, type: "king", color: "white" },
      { row: 7, col: 7, type: "rook", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 7, col: 7 }, to: { row: 7, col: 4 } },
      { from: { row: 5, col: 0 }, to: { row: 4, col: 0 } },
    ],
    hint: "Cut off the king with the rook on the e-file, then advance the pawn!",
  },
  {
    id: "endgame-opposition",
    title: "Key Square Opposition",
    description: "Gain the opposition to promote your pawn",
    category: "Endgame",
    difficulty: "Medium",
    board: buildBoard([
      { row: 2, col: 4, type: "king", color: "black" },
      { row: 4, col: 4, type: "king", color: "white" },
      { row: 5, col: 4, type: "pawn", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 4, col: 4 }, to: { row: 3, col: 3 } },
      { from: { row: 5, col: 4 }, to: { row: 4, col: 4 } },
    ],
    hint: "Outflank with your king first, then push the pawn!",
  },
  {
    id: "endgame-rook-behind",
    title: "Rook Behind Passed Pawn",
    description: "Place your rook behind the passed pawn and push",
    category: "Endgame",
    difficulty: "Hard",
    board: buildBoard([
      { row: 0, col: 7, type: "king", color: "black" },
      { row: 2, col: 0, type: "pawn", color: "white" },
      { row: 3, col: 7, type: "rook", color: "black" },
      { row: 7, col: 0, type: "rook", color: "white" },
      { row: 7, col: 6, type: "king", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 2, col: 0 }, to: { row: 1, col: 0 } },
      { from: { row: 1, col: 0 }, to: { row: 0, col: 0 } },
    ],
    hint: "Push the pawn! Your rook supports from behind.",
  },
  {
    id: "endgame-queen-vs-pawn",
    title: "Queen vs Pawn",
    description: "Use your queen to stop the enemy pawn and force mate",
    category: "Endgame",
    difficulty: "Hard",
    board: buildBoard([
      { row: 7, col: 0, type: "king", color: "white" },
      { row: 1, col: 7, type: "pawn", color: "black" },
      { row: 2, col: 7, type: "king", color: "black" },
      { row: 5, col: 3, type: "queen", color: "white" },
    ]),
    playerColor: "white",
    solution: [
      { from: { row: 5, col: 3 }, to: { row: 0, col: 7 } },
      { from: { row: 7, col: 0 }, to: { row: 6, col: 1 } },
    ],
    hint: "Block the pawn with your queen, then bring the king closer!",
  },
];

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const diffColors: Record<string, string> = {
  Easy: "text-green-500 bg-green-500/10",
  Medium: "text-yellow-500 bg-yellow-500/10",
  Hard: "text-red-500 bg-red-500/10",
};

const Practice = () => {
  const [selectedScenario, setSelectedScenario] = useState<PracticeScenario | null>(null);
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const castlingRights = createInitialCastlingRights();

  const startScenario = (scenario: PracticeScenario) => {
    setSelectedScenario(scenario);
    setBoard(scenario.board.map(r => [...r]));
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveIndex(0);
    setResult(null);
    setShowHint(false);
  };

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!selectedScenario || result === "correct") return;

    const piece = board[row][col];

    if (piece && piece.color === selectedScenario.playerColor) {
      setSelectedSquare({ row, col });
      const moves = getValidMoves(board, { row, col }, selectedScenario.playerColor, castlingRights);
      const legal = moves.filter(m => {
        const tb = makeMove(board, { row, col }, m);
        return !isKingInCheck(tb, selectedScenario.playerColor);
      });
      setValidMoves(legal);
      setResult(null);
      return;
    }

    if (selectedSquare) {
      const isValid = validMoves.some(m => m.row === row && m.col === col);
      if (isValid) {
        const expected = selectedScenario.solution[moveIndex];
        if (
          expected &&
          selectedSquare.row === expected.from.row &&
          selectedSquare.col === expected.from.col &&
          row === expected.to.row &&
          col === expected.to.col
        ) {
          const newBoard = makeMove(board, selectedSquare, { row, col });
          setBoard(newBoard);
          setSelectedSquare(null);
          setValidMoves([]);

          if (moveIndex + 1 >= selectedScenario.solution.length) {
            setResult("correct");
            setSolved(prev => new Set(prev).add(selectedScenario.id));
          } else {
            setMoveIndex(i => i + 1);
          }
        } else {
          setResult("wrong");
          setSelectedSquare(null);
          setValidMoves([]);
        }
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  }, [board, selectedSquare, validMoves, selectedScenario, moveIndex, result, castlingRights]);

  const isHighlighted = (r: number, c: number) => validMoves.some(m => m.row === r && m.col === c);
  const isSelected = (r: number, c: number) => selectedSquare?.row === r && selectedSquare?.col === c;

  const filtered = activeCategory === "all" ? SCENARIOS : SCENARIOS.filter(s => s.category === activeCategory);

  if (selectedScenario) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 relative">
        <div className="chess-bg" />
        <div className="chess-bg-vignette" />
        <div className="max-w-4xl mx-auto relative z-10">
          <button onClick={() => setSelectedScenario(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Scenarios
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Board */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="flex ml-8 mb-1">
                  {FILES.map(f => <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>)}
                </div>
                <div className="flex">
                  <div className="flex flex-col mr-1">
                    {RANKS.map(r => <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>)}
                  </div>
                  <div className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl border-4 border-secondary">
                    {board.map((row, ri) =>
                      row.map((piece, ci) => {
                        const isLight = (ri + ci) % 2 === 0;
                        return (
                          <div
                            key={`${ri}-${ci}`}
                            className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 relative
                              ${isLight ? "chess-square-light" : "chess-square-dark"}
                              ${isSelected(ri, ci) ? "chess-square-selected" : ""}
                              ${isHighlighted(ri, ci) ? "chess-square-highlight" : ""}
                            `}
                            onClick={() => handleSquareClick(ri, ci)}
                          >
                            {piece && (
                              <span className={`text-3xl md:text-5xl select-none ${piece.color === "white" ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"}`}
                                style={{ WebkitTextStroke: piece.color === "white" ? "1px #333" : "none" }}>
                                {PIECE_SYMBOLS[piece.color][piece.type]}
                              </span>
                            )}
                            {isHighlighted(ri, ci) && !piece && <div className="absolute w-3 h-3 rounded-full bg-primary/60" />}
                            {isHighlighted(ri, ci) && piece && <div className="absolute inset-0 border-4 border-primary/60 rounded-sm" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div className="flex-1 space-y-4">
              <div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${diffColors[selectedScenario.difficulty]}`}>{selectedScenario.difficulty}</span>
                <span className="text-xs text-muted-foreground ml-2">{selectedScenario.category}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{selectedScenario.title}</h2>
              <p className="text-muted-foreground">{selectedScenario.description}</p>
              <p className="text-sm text-foreground">Play as <span className="font-bold capitalize text-primary">{selectedScenario.playerColor}</span> — find the best move!</p>

              {result === "correct" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-semibold">
                  <CheckCircle2 className="w-5 h-5" /> Correct! Well done!
                </div>
              )}
              {result === "wrong" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-semibold">
                  <XCircle className="w-5 h-5" /> Not quite — try again!
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors">
                  <Lightbulb className="w-4 h-4" /> {showHint ? "Hide Hint" : "Show Hint"}
                </button>
                <button onClick={() => startScenario(selectedScenario)} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>

              {showHint && (
                <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-foreground">
                  💡 {selectedScenario.hint}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="chess-bg" />
      <div className="chess-bg-vignette" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Practice</h1>
            <p className="text-muted-foreground">Sharpen your skills with targeted exercises</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "Checkmate", "Tactics", "Endgame"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(scenario => (
            <div
              key={scenario.id}
              onClick={() => startScenario(scenario)}
              className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${diffColors[scenario.difficulty]}`}>{scenario.difficulty}</span>
                <span className="text-xs text-muted-foreground">{scenario.category}</span>
                {solved.has(scenario.id) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{scenario.title}</h3>
              <p className="text-sm text-muted-foreground">{scenario.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-primary font-semibold">
                Start <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;
