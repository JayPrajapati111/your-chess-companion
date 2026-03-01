import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Lightbulb, Check, X, Trophy, Star, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Board,
  PieceColor,
  Position,
  PIECE_SYMBOLS,
  getValidMoves,
  makeMove,
} from "@/lib/chess";
import { Progress } from "@/components/ui/progress";

const SAMPLE_PUZZLES = [
  // Beginner (600-800)
  {
    id: "1",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    moves: ["h5f7"],
    rating: 600,
    theme: "Checkmate in 1",
    description: "Scholar's Mate! Capture on f7 for checkmate.",
  },
  {
    id: "2",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
    moves: ["d8h4"],
    rating: 500,
    theme: "Checkmate in 1",
    description: "Fool's Mate! White left the king exposed.",
  },
  {
    id: "3",
    fen: "r1b1kb1r/pppp1ppp/5n2/4p3/2B1n2q/3P4/PPP2PPP/RNBQK1NR w KQkq - 0 5",
    moves: ["g2g3"],
    rating: 800,
    theme: "Win the Queen",
    description: "Trap the queen with a pawn move!",
  },
  {
    id: "4",
    fen: "r2qkb1r/ppp2ppp/2n1bn2/3pp3/4P3/1B3N2/PPPP1PPP/RNBQK2R w KQkq - 4 5",
    moves: ["b3d5"],
    rating: 700,
    theme: "Win Material",
    description: "Capture the undefended center pawn.",
  },
  // Intermediate (900-1200)
  {
    id: "5",
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["f3g5"],
    rating: 900,
    theme: "Attack f7",
    description: "The knight eyes the weak f7 square.",
  },
  {
    id: "6",
    fen: "r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
    moves: ["d2d4"],
    rating: 650,
    theme: "Center Control",
    description: "Grab the center with d4!",
  },
  {
    id: "7",
    fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
    moves: ["e7e6"],
    rating: 750,
    theme: "Solid Defense",
    description: "Establish a solid pawn structure.",
  },
  {
    id: "8",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["f1b5"],
    rating: 850,
    theme: "Pin the Knight",
    description: "The Ruy Lopez! Pin the knight to the king.",
  },
  // Advanced (1000-1400)
  {
    id: "9",
    fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: ["c3d5"],
    rating: 1100,
    theme: "Central Knight",
    description: "Plant the knight on the powerful d5 outpost.",
  },
  {
    id: "10",
    fen: "r2qk2r/ppp1bppp/2n1bn2/3pp3/4P3/1BN2N2/PPPP1PPP/R1BQK2R w KQkq - 4 6",
    moves: ["e4d5"],
    rating: 1000,
    theme: "Open the Center",
    description: "Open lines for your pieces by capturing in the center.",
  },
  {
    id: "11",
    fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    moves: ["a4a2"],
    rating: 1200,
    theme: "Retreat & Reposition",
    description: "The bishop retreats to maintain pressure on the diagonal.",
  },
  {
    id: "12",
    fen: "rnb1kb1r/pp1ppppp/1q3n2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
    moves: ["d4d5"],
    rating: 1050,
    theme: "Space Advantage",
    description: "Push d5 to gain space and restrict the opponent.",
  },
  // Expert (1300-1600)
  {
    id: "13",
    fen: "r2q1rk1/pppbbppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: ["c3e2"],
    rating: 1400,
    theme: "Knight Maneuver",
    description: "Reroute the knight to a better square via e2.",
  },
  {
    id: "14",
    fen: "r1bq1rk1/pp2ppbp/2np1np1/2p5/4P3/2NP1NP1/PPP2PBP/R1BQ1RK1 w - - 0 7",
    moves: ["c1e3"],
    rating: 1300,
    theme: "Develop with Purpose",
    description: "Complete development and prepare for action.",
  },
  {
    id: "15",
    fen: "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 0 8",
    moves: ["f6h5"],
    rating: 1500,
    theme: "Kingside Attack",
    description: "The knight heads to f4 via h5 to pressure the king.",
  },
  // --- 15 NEW PUZZLES ---
  {
    id: "16",
    fen: "r1bqk2r/pppp1Npp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: ["d8e7"],
    rating: 600,
    theme: "Defend the King",
    description: "Block the check while keeping your pieces safe.",
  },
  {
    id: "17",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3",
    moves: ["f3f7"],
    rating: 650,
    theme: "Checkmate in 1",
    description: "The queen delivers checkmate on f7!",
  },
  {
    id: "18",
    fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: ["f6e4"],
    rating: 750,
    theme: "Win a Pawn",
    description: "Capture the undefended e4 pawn with your knight.",
  },
  {
    id: "19",
    fen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    moves: ["e4d5"],
    rating: 700,
    theme: "Center Exchange",
    description: "Capture the center pawn to open lines.",
  },
  {
    id: "20",
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4",
    moves: ["d2d3"],
    rating: 800,
    theme: "Solid Development",
    description: "Develop solidly and prepare castling.",
  },
  {
    id: "21",
    fen: "r2qkbnr/ppp1pppp/2n5/3pPb2/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 1 4",
    moves: ["c2c4"],
    rating: 900,
    theme: "Pawn Break",
    description: "Challenge the center with c4!",
  },
  {
    id: "22",
    fen: "r1bqk2r/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 5",
    moves: ["a2a3"],
    rating: 950,
    theme: "Bishop Chase",
    description: "Kick the bishop and gain tempo.",
  },
  {
    id: "23",
    fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/4P3/3P1N2/PPP1BPPP/RNBQ1RK1 w - - 5 5",
    moves: ["b2b4"],
    rating: 1000,
    theme: "Wing Attack",
    description: "Launch a wing attack to gain space on the queenside.",
  },
  {
    id: "24",
    fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 0 6",
    moves: ["e1g1"],
    rating: 850,
    theme: "Castle for Safety",
    description: "Castle kingside to secure your king.",
  },
  {
    id: "25",
    fen: "r1bqk2r/ppp2ppp/2n5/3np3/2B5/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6",
    moves: ["c4d5"],
    rating: 1100,
    theme: "Win Material",
    description: "Capture the knight that just jumped to d5.",
  },
  {
    id: "26",
    fen: "r1b1kbnr/ppppqppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["d2d4"],
    rating: 1150,
    theme: "Open the Center",
    description: "Strike in the center while the queen blocks development.",
  },
  {
    id: "27",
    fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    moves: ["b1c3"],
    rating: 1200,
    theme: "Develop Knights",
    description: "Develop the knight to its most natural square.",
  },
  {
    id: "28",
    fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: ["d7d6"],
    rating: 1250,
    theme: "Solid Defense",
    description: "Reinforce the center and prepare to castle.",
  },
  {
    id: "29",
    fen: "r2qkbnr/pppb1ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4",
    moves: ["d2d4"],
    rating: 1350,
    theme: "Central Breakthrough",
    description: "Open the center to exploit your superior development.",
  },
  {
    id: "30",
    fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/4P3/2NP1N2/PPP1BPPP/R1BQ1RK1 w - - 0 7",
    moves: ["c1e3"],
    rating: 1450,
    theme: "Bishop Development",
    description: "Develop the last minor piece and eye the dark squares.",
  },
  // --- 20 MORE PUZZLES ---
  {
    id: "31",
    fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
    moves: ["e1g1"],
    rating: 700,
    theme: "Castle for Safety",
    description: "Castle kingside to secure your king early.",
  },
  {
    id: "32",
    fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["d2d3"],
    rating: 750,
    theme: "Solid Development",
    description: "Support the center pawn and prepare to develop the bishop.",
  },
  {
    id: "33",
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["f3d4"],
    rating: 800,
    theme: "Recapture",
    description: "Recapture the knight with your own knight for central control.",
  },
  {
    id: "34",
    fen: "r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    moves: ["b4c3"],
    rating: 900,
    theme: "Bishop Retreat",
    description: "Retreat the bishop to maintain the pin on the knight.",
  },
  {
    id: "35",
    fen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    moves: ["c4d5"],
    rating: 950,
    theme: "Exchange Variation",
    description: "Capture to open the position and create central tension.",
  },
  {
    id: "36",
    fen: "r2qkb1r/pp1bpppp/2np1n2/1B6/3NP3/2N5/PPP2PPP/R1BQK2R w KQkq - 4 6",
    moves: ["b5c6"],
    rating: 1000,
    theme: "Double Pawns",
    description: "Capture on c6 to damage Black's pawn structure.",
  },
  {
    id: "37",
    fen: "r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 2 6",
    moves: ["a2a3"],
    rating: 1050,
    theme: "Nimzo-Indian",
    description: "Force the bishop to make a decision — capture or retreat.",
  },
  {
    id: "38",
    fen: "rnbq1rk1/pp2ppbp/6p1/2pp4/3P4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 0 7",
    moves: ["e1g1"],
    rating: 850,
    theme: "Fianchetto Castle",
    description: "Complete the fianchetto setup by castling.",
  },
  {
    id: "39",
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: ["a7a6"],
    rating: 800,
    theme: "Morphy Defense",
    description: "Challenge the bishop with a6 — the Morphy Defense of the Ruy Lopez.",
  },
  {
    id: "40",
    fen: "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6",
    moves: ["d2d4"],
    rating: 1100,
    theme: "Central Strike",
    description: "Strike in the center while your pieces are well developed.",
  },
  {
    id: "41",
    fen: "r2q1rk1/pp2ppbp/2npbnp1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 4 8",
    moves: ["e1c1"],
    rating: 1200,
    theme: "Queenside Castle",
    description: "Castle queenside to prepare a kingside pawn storm.",
  },
  {
    id: "42",
    fen: "rnbqkb1r/pp2pppp/5n2/2ppP3/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4",
    moves: ["f6d7"],
    rating: 1000,
    theme: "Retreat & Regroup",
    description: "The knight retreats to support the center and prepare counterplay.",
  },
  {
    id: "43",
    fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 4 5",
    moves: ["c1g5"],
    rating: 1150,
    theme: "Pin the Knight",
    description: "Pin the knight to the queen — a key idea in the Queen's Gambit.",
  },
  {
    id: "44",
    fen: "r1bq1rk1/pppn1pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 8",
    moves: ["d4d5"],
    rating: 1250,
    theme: "Space Grab",
    description: "Close the center with d5 to seize space advantage.",
  },
  {
    id: "45",
    fen: "r1bqr1k1/ppp2pbp/2np1np1/4p3/2P1P3/2NP1NP1/PP3PBP/R1BQ1RK1 w - - 0 9",
    moves: ["a2a3"],
    rating: 1100,
    theme: "Prepare Expansion",
    description: "Prepare b4 to expand on the queenside.",
  },
  {
    id: "46",
    fen: "r2qk2r/pppbbppp/2n1pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 4 6",
    moves: ["e1g1"],
    rating: 900,
    theme: "Develop & Castle",
    description: "Castle to safety and connect the rooks.",
  },
  {
    id: "47",
    fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQ - 0 6",
    moves: ["f2f3"],
    rating: 1300,
    theme: "Sämisch System",
    description: "Play f3 to build a massive pawn center — the Sämisch King's Indian.",
  },
  {
    id: "48",
    fen: "r1bq1rk1/pp1nppbp/2np2p1/2p5/2P1P3/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 8",
    moves: ["d2d4"],
    rating: 1350,
    theme: "Central Break",
    description: "Break in the center with d4 while pieces are optimally placed.",
  },
  {
    id: "49",
    fen: "r2qk2r/pp1nbppp/2p1pn2/3p4/2PP4/1PN2NP1/P3PP1P/R1BQKB1R w KQkq - 0 7",
    moves: ["f1g2"],
    rating: 1400,
    theme: "Catalan Setup",
    description: "Complete the Catalan fianchetto to pressure the long diagonal.",
  },
  {
    id: "50",
    fen: "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq - 0 3",
    moves: ["g7g6"],
    rating: 1500,
    theme: "Hypermodern",
    description: "Fianchetto the bishop to control the center from a distance.",
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
        for (let i = 0; i < parseInt(char); i++) boardRow.push(null);
      } else if (pieceMap[char]) {
        boardRow.push(pieceMap[char]);
      }
    }
    board.push(boardRow);
  }
  return { board, turn };
};

const parseMove = (move: string): { from: Position; to: Position } => {
  const files = "abcdefgh";
  return {
    from: { row: 8 - parseInt(move[1]), col: files.indexOf(move[0]) },
    to: { row: 8 - parseInt(move[3]), col: files.indexOf(move[2]) },
  };
};

const getDifficultyLabel = (rating: number) => {
  if (rating <= 700) return { label: "Beginner", color: "text-green-500" };
  if (rating <= 1000) return { label: "Intermediate", color: "text-yellow-500" };
  if (rating <= 1300) return { label: "Advanced", color: "text-orange-500" };
  return { label: "Expert", color: "text-red-500" };
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
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const currentPuzzle = SAMPLE_PUZZLES[currentPuzzleIndex];
  const difficulty = getDifficultyLabel(currentPuzzle.rating);
  const progressPercent = ((currentPuzzleIndex + 1) / SAMPLE_PUZZLES.length) * 100;

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

      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare({ row, col });
        const moves = getValidMoves(board, { row, col }, turn);
        setValidMoves(moves);
        return;
      }

      if (selectedSquare) {
        const isValid = validMoves.some((m) => m.row === row && m.col === col);
        if (isValid) {
          const correctMove = parseMove(currentPuzzle.moves[0]);
          if (
            selectedSquare.row === correctMove.from.row &&
            selectedSquare.col === correctMove.from.col &&
            row === correctMove.to.row &&
            col === correctMove.to.col
          ) {
            const newBoard = makeMove(board, selectedSquare, { row, col });
            setBoard(newBoard);
            setPuzzleState("correct");
            setPuzzlesSolved((prev) => prev + 1);
            setStreak((s) => {
              const newStreak = s + 1;
              setBestStreak((b) => Math.max(b, newStreak));
              return newStreak;
            });
          } else {
            setPuzzleState("wrong");
            setStreak(0);
          }
        }
        setSelectedSquare(null);
        setValidMoves([]);
      }
    },
    [board, selectedSquare, validMoves, turn, puzzleState, currentPuzzle.moves]
  );

  const nextPuzzle = () => setCurrentPuzzleIndex((prev) => (prev + 1) % SAMPLE_PUZZLES.length);
  const retryPuzzle = () => {
    const { board: newBoard, turn: newTurn } = parseFEN(currentPuzzle.fen);
    setBoard(newBoard);
    setTurn(newTurn);
    setPuzzleState("solving");
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
  };

  const isSquareHighlighted = (row: number, col: number) => validMoves.some((m) => m.row === row && m.col === col);
  const isSquareSelected = (row: number, col: number) => selectedSquare?.row === row && selectedSquare?.col === col;

  const getHintSquare = () => {
    if (!showHint || !currentPuzzle.moves[0]) return null;
    return parseMove(currentPuzzle.moves[0]).from;
  };
  const hintSquare = getHintSquare();

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="chess-bg" />
      <div className="chess-bg-vignette" />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Puzzles</h1>
              <p className="text-muted-foreground">Solve tactical puzzles to sharpen your skills</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Solved</span>
            </div>
            <p className="text-xl font-bold text-foreground">{puzzlesSolved}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-xl font-bold text-foreground">{streak}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Best</span>
            </div>
            <p className="text-xl font-bold text-foreground">{bestStreak}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Puzzle {currentPuzzleIndex + 1} of {SAMPLE_PUZZLES.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Puzzle Info */}
        <div className="mb-4 bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                ⭐ {currentPuzzle.rating}
              </span>
              <span className={`text-sm font-semibold ${difficulty.color}`}>{difficulty.label}</span>
              <span className="text-sm text-muted-foreground">• {currentPuzzle.theme}</span>
            </div>
            <span className={`font-semibold text-sm ${turn === "white" ? "text-foreground" : "text-muted-foreground"}`}>
              {turn === "white" ? "⚪ White" : "⚫ Black"} to move
            </span>
          </div>
          {puzzleState === "solving" && (
            <p className="text-sm text-muted-foreground italic">{currentPuzzle.description}</p>
          )}
        </div>

        {/* Board */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="flex ml-8 mb-1">
              {files.map((f) => (
                <div key={f} className="w-12 md:w-16 text-center text-xs text-muted-foreground">{f}</div>
              ))}
            </div>
            <div className="flex">
              <div className="flex flex-col mr-1">
                {ranks.map((r) => (
                  <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>
                ))}
              </div>
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
                        className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 relative
                          ${isLight ? "chess-square-light" : "chess-square-dark"}
                          ${selected ? "chess-square-selected" : ""}
                          ${highlighted ? "chess-square-highlight" : ""}
                          ${isHint ? "ring-4 ring-yellow-400 ring-inset animate-pulse" : ""}
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {piece && (
                          <span
                            className={`text-3xl md:text-5xl select-none ${
                              piece.color === "white"
                                ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
                                : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                            }`}
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
                {ranks.map((r) => (
                  <div key={r} className="h-12 md:h-16 flex items-center justify-center w-6 text-xs text-muted-foreground">{r}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Controls */}
        <div className="flex flex-col items-center gap-4">
          {puzzleState === "correct" && (
            <div className="flex items-center gap-2 text-primary font-bold text-xl animate-bounce">
              <Check className="w-6 h-6" />
              Correct! 🎉 {streak > 1 && `${streak} in a row!`}
            </div>
          )}
          {puzzleState === "wrong" && (
            <div className="flex items-center gap-2 text-destructive font-bold text-xl">
              <X className="w-6 h-6" />
              Wrong move. Try again!
            </div>
          )}

          <div className="flex items-center gap-3">
            {puzzleState === "solving" && (
              <button
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-600 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 transition-colors font-medium"
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
                Next Puzzle →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Puzzles;
