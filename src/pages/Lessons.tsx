import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Target, Crown, Shield, Zap, ChevronRight, Swords, Eye, Flag, Puzzle, GraduationCap, TrendingUp, Check, Lightbulb, Brain, Crosshair, Castle, Layers } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { PIECE_SYMBOLS } from "@/lib/chess";

// Mini board renderer for lesson visuals
const MiniBoard = ({ pieces, size = 6 }: { pieces: { row: number; col: number; symbol: string }[]; size?: number }) => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(null));
  pieces.forEach(p => { if (p.row < size && p.col < size) grid[p.row][p.col] = p.symbol; });
  return (
    <div className="inline-grid rounded-lg overflow-hidden border-2 border-border my-3" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {grid.map((row, ri) =>
        row.map((cell, ci) => (
          <div key={`${ri}-${ci}`} className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-xl ${(ri + ci) % 2 === 0 ? "chess-square-light" : "chess-square-dark"}`}>
            {cell}
          </div>
        ))
      )}
    </div>
  );
};

interface LessonStep {
  title: string;
  text: string;
  tip?: string;
  board?: { pieces: { row: number; col: number; symbol: string }[]; size?: number };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  content: LessonStep[];
}

const W = PIECE_SYMBOLS.white;
const B = PIECE_SYMBOLS.black;

const LESSONS: Lesson[] = [
  {
    id: "basics",
    title: "How Pieces Move",
    description: "Learn how each chess piece moves across the board",
    category: "Basics",
    icon: <BookOpen className="w-5 h-5" />,
    difficulty: "Beginner",
    estimatedTime: "5 min",
    content: [
      { title: "The Pawn", text: "Pawns move forward one square, or two from their starting position. They capture diagonally one square forward.", tip: "Pawns that reach the 8th rank promote to any piece — usually a queen!", board: { pieces: [{ row: 3, col: 2, symbol: W.pawn }, { row: 4, col: 2, symbol: "·" }, { row: 2, col: 3, symbol: B.pawn }], size: 6 } },
      { title: "The Rook", text: "Rooks move any number of squares horizontally or vertically. They are powerful in open files and on the 7th rank.", tip: "Two rooks on the 7th rank is called 'pigs on the 7th' — it's devastating!", board: { pieces: [{ row: 3, col: 3, symbol: W.rook }], size: 6 } },
      { title: "The Knight", text: "Knights move in an 'L' shape: two squares in one direction and one perpendicular. They jump over other pieces.", tip: "A knight on the rim is dim! Keep knights centralized for maximum power.", board: { pieces: [{ row: 3, col: 3, symbol: W.knight }, { row: 1, col: 2, symbol: "·" }, { row: 1, col: 4, symbol: "·" }, { row: 2, col: 1, symbol: "·" }, { row: 2, col: 5, symbol: "·" }, { row: 4, col: 1, symbol: "·" }, { row: 4, col: 5, symbol: "·" }, { row: 5, col: 2, symbol: "·" }, { row: 5, col: 4, symbol: "·" }], size: 6 } },
      { title: "The Bishop", text: "Bishops move diagonally any number of squares. Each bishop stays on its starting color for the entire game.", tip: "The bishop pair (both bishops) is very strong in open positions.", board: { pieces: [{ row: 3, col: 3, symbol: W.bishop }], size: 6 } },
      { title: "The Queen", text: "The Queen combines the rook and bishop's movements — she can move any number of squares in any direction.", tip: "Don't bring your queen out too early! She can be chased by minor pieces.", board: { pieces: [{ row: 3, col: 3, symbol: W.queen }], size: 6 } },
      { title: "The King", text: "The King moves one square in any direction. Protecting your king is the ultimate goal of chess.", tip: "In the endgame, the king becomes an attacking piece. Activate it!", board: { pieces: [{ row: 3, col: 3, symbol: W.king }, { row: 2, col: 2, symbol: "·" }, { row: 2, col: 3, symbol: "·" }, { row: 2, col: 4, symbol: "·" }, { row: 3, col: 2, symbol: "·" }, { row: 3, col: 4, symbol: "·" }, { row: 4, col: 2, symbol: "·" }, { row: 4, col: 3, symbol: "·" }, { row: 4, col: 4, symbol: "·" }], size: 6 } },
    ],
  },
  {
    id: "opening-principles",
    title: "Opening Principles",
    description: "Master the fundamentals of the chess opening",
    category: "Openings",
    icon: <Flag className="w-5 h-5" />,
    difficulty: "Beginner",
    estimatedTime: "8 min",
    content: [
      { title: "Control the Center", text: "Place pawns on e4/d4 (or e5/d5 as black) to dominate the board. Central control gives your pieces more mobility.", tip: "The center squares (e4, d4, e5, d5) are the most important real estate on the board.", board: { pieces: [{ row: 4, col: 3, symbol: W.pawn }, { row: 4, col: 4, symbol: W.pawn }, { row: 3, col: 3, symbol: "·" }, { row: 3, col: 4, symbol: "·" }], size: 8 } },
      { title: "Develop Your Pieces", text: "Move knights and bishops out early. Each move should contribute to development — don't move the same piece twice.", tip: "Aim to develop all minor pieces before move 10. Knights before bishops is usually best." },
      { title: "Castle Early", text: "Castle within the first 10 moves to get your king to safety and connect your rooks.", tip: "Castling kingside (O-O) is generally safer than queenside (O-O-O).", board: { pieces: [{ row: 7, col: 5, symbol: W.rook }, { row: 7, col: 6, symbol: W.king }], size: 8 } },
      { title: "Don't Move Pawns Unnecessarily", text: "Every pawn move creates a weakness. Only advance pawns with a clear purpose.", tip: "Pawn moves can't be undone! Think twice before pushing them." },
      { title: "Connect Your Rooks", text: "After castling and developing pieces, your rooks should see each other on the back rank.", tip: "Rooks are strongest on open and semi-open files." },
    ],
  },
  {
    id: "italian-game",
    title: "The Italian Game",
    description: "Learn one of the oldest and most popular chess openings",
    category: "Openings",
    icon: <Swords className="w-5 h-5" />,
    difficulty: "Beginner",
    estimatedTime: "10 min",
    content: [
      { title: "1. e4 e5", text: "Both sides open by advancing the king's pawn two squares, fighting for the center immediately.", tip: "This is the most common start in chess history!", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 3, col: 4, symbol: B.pawn }], size: 8 } },
      { title: "2. Nf3 Nc6", text: "Both knights develop to their natural squares, attacking the center pawns and preparing for castling.", tip: "Nf3 attacks the e5 pawn — Black must defend it.", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 3, col: 4, symbol: B.pawn }, { row: 5, col: 5, symbol: W.knight }, { row: 0, col: 2, symbol: B.knight }], size: 8 } },
      { title: "3. Bc4 — The Italian!", text: "The bishop comes to c4, eyeing the weak f7 square near Black's king. This is the Italian Game.", tip: "f7 is the weakest point in Black's position early on — only the king defends it.", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 3, col: 4, symbol: B.pawn }, { row: 5, col: 5, symbol: W.knight }, { row: 0, col: 2, symbol: B.knight }, { row: 4, col: 2, symbol: W.bishop }], size: 8 } },
      { title: "Main Ideas for White", text: "White wants to develop quickly, castle kingside, and potentially launch an attack on the kingside.", tip: "Common plans include d3, O-O, c3, then d4 to open the center." },
      { title: "Black's Best Responses", text: "Black can play Bc5 (Giuoco Piano) for equal play, or Nf6 (Two Knights Defense) for a sharper game.", tip: "Both responses are solid — pick based on your style!" },
    ],
  },
  {
    id: "sicilian-defense",
    title: "The Sicilian Defense",
    description: "The most popular response to 1. e4",
    category: "Openings",
    icon: <Swords className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    content: [
      { title: "1. e4 c5 — The Sicilian", text: "Black plays c5 to fight for the center asymmetrically. This leads to sharp, unbalanced positions.", tip: "The Sicilian is the most popular defense at the top level!", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 3, col: 2, symbol: B.pawn }], size: 8 } },
      { title: "The Open Sicilian (2. Nf3 d6 3. d4)", text: "White opens the center with d4, leading to the main lines. Black gets a half-open c-file for counterplay.", tip: "Black's counterplay on the queenside vs White's kingside attack is the classic battle." },
      { title: "The Najdorf Variation", text: "After 5...a6, Black prepares ...e5 or ...b5 expansions. Played by Fischer, Kasparov, and many World Champions.", tip: "The Najdorf is the most theoretically dense opening in all of chess." },
      { title: "Key Pawn Structures", text: "Black often has pawns on d6 and e6 (or e5), White on e4. The d5 break is a key theme for both sides.", tip: "Understanding pawn structures helps you find the right plans automatically.", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 2, col: 3, symbol: B.pawn }, { row: 2, col: 4, symbol: B.pawn }], size: 8 } },
    ],
  },
  {
    id: "queens-gambit",
    title: "The Queen's Gambit",
    description: "A classical opening for strategic players",
    category: "Openings",
    icon: <Crown className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    content: [
      { title: "1. d4 d5 2. c4 — The Gambit", text: "White offers the c4 pawn to divert Black's d5 pawn from the center. It's not a true gambit — White usually regains the pawn.", tip: "The Queen's Gambit is one of the oldest openings, played since the 15th century!", board: { pieces: [{ row: 4, col: 3, symbol: W.pawn }, { row: 3, col: 3, symbol: B.pawn }, { row: 4, col: 2, symbol: W.pawn }], size: 8 } },
      { title: "Queen's Gambit Declined", text: "Black plays ...e6 to solidify d5. This leads to solid, strategic positions.", tip: "The QGD is considered one of the most solid openings for Black." },
      { title: "Queen's Gambit Accepted", text: "Black takes on c4 with ...dxc4. White gets a central majority but Black develops quickly.", tip: "After accepting, don't try to hold the pawn — develop instead!" },
      { title: "The Minority Attack", text: "A key strategic concept: White pushes b4-b5 on the queenside to create weaknesses in Black's pawn structure.", tip: "The minority attack (fewer pawns attacking more) is a fundamental strategic motif.", board: { pieces: [{ row: 5, col: 1, symbol: W.pawn }, { row: 4, col: 0, symbol: W.pawn }, { row: 3, col: 1, symbol: B.pawn }, { row: 3, col: 2, symbol: B.pawn }, { row: 3, col: 3, symbol: B.pawn }], size: 8 } },
    ],
  },
  {
    id: "tactics-pins",
    title: "Pins & Skewers",
    description: "Learn these essential tactical motifs",
    category: "Tactics",
    icon: <Target className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "8 min",
    content: [
      { title: "What is a Pin?", text: "A pin occurs when an attacking piece threatens a less valuable piece that cannot move because a more valuable piece is behind it.", tip: "Bishops and rooks are the best pinning pieces.", board: { pieces: [{ row: 0, col: 4, symbol: B.king }, { row: 3, col: 4, symbol: B.knight }, { row: 5, col: 4, symbol: W.rook }], size: 6 } },
      { title: "Absolute vs Relative Pins", text: "An absolute pin is when the piece behind is the king (illegal to move). A relative pin is when the piece behind is valuable but can legally move.", tip: "Absolute pins are stronger — the pinned piece literally cannot move!" },
      { title: "Exploiting Pins", text: "Once a piece is pinned, pile up pressure on it. Add more attackers to the pinned piece to win material.", tip: "A common tactic: pin a knight with a bishop, then attack it with a pawn." },
      { title: "What is a Skewer?", text: "A skewer is the reverse: the more valuable piece is in front. When it moves, you capture the piece behind.", tip: "Rook skewers along ranks and files are very common in endgames.", board: { pieces: [{ row: 1, col: 2, symbol: B.king }, { row: 1, col: 5, symbol: B.rook }, { row: 1, col: 0, symbol: W.rook }], size: 6 } },
      { title: "Practice Spotting Them", text: "In every position, look for pieces lined up on the same diagonal, rank, or file. These are potential pin/skewer opportunities!", tip: "Ask yourself: 'Are any of my opponent's pieces lined up?'" },
    ],
  },
  {
    id: "tactics-forks",
    title: "Forks & Double Attacks",
    description: "Attack two pieces at once to win material",
    category: "Tactics",
    icon: <Zap className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "7 min",
    content: [
      { title: "The Knight Fork", text: "Knights are the best forking pieces because they attack pieces that can't attack them back. The 'royal fork' (king + queen) is devastating.", tip: "Always check if your knight can land on a square attacking two valuable pieces.", board: { pieces: [{ row: 0, col: 2, symbol: B.king }, { row: 0, col: 4, symbol: B.queen }, { row: 1, col: 3, symbol: W.knight }], size: 6 } },
      { title: "Pawn Forks", text: "Pawns can fork two pieces by advancing diagonally. These are often overlooked because pawns seem harmless.", tip: "A pawn fork is extra strong because pawns are worth the least — any capture is a win!", board: { pieces: [{ row: 2, col: 1, symbol: B.knight }, { row: 2, col: 3, symbol: B.bishop }, { row: 3, col: 2, symbol: W.pawn }], size: 6 } },
      { title: "Queen Forks", text: "The queen can fork along ranks, files, and diagonals. She's versatile but opponents often see queen forks coming.", tip: "Queen forks with check are the most forcing — your opponent must deal with the check first." },
      { title: "Discovery Attacks", text: "Moving one piece to reveal an attack from another piece behind it. If the moving piece also attacks something, it's a double attack.", tip: "Discovered checks are especially powerful — the piece that moves can do almost anything!" },
    ],
  },
  {
    id: "tactics-sacrifices",
    title: "Sacrifices & Combinations",
    description: "When giving up material leads to a bigger gain",
    category: "Tactics",
    icon: <Puzzle className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "12 min",
    content: [
      { title: "What is a Sacrifice?", text: "A sacrifice is intentionally giving up material (a piece or pawn) for a greater positional or tactical advantage.", tip: "The best sacrifices are those your opponent can't refuse!" },
      { title: "The Greek Gift (Bxh7+)", text: "One of the most famous sacrifices: the bishop captures on h7 with check, followed by Ng5+ and Qh5 for a devastating kingside attack.", tip: "Look for this pattern when your opponent has castled kingside and the h-pawn is unprotected.", board: { pieces: [{ row: 0, col: 5, symbol: B.rook }, { row: 0, col: 6, symbol: B.king }, { row: 1, col: 5, symbol: B.pawn }, { row: 1, col: 7, symbol: B.pawn }, { row: 1, col: 6, symbol: W.bishop }], size: 8 } },
      { title: "Exchange Sacrifices", text: "Giving up a rook for a bishop or knight. This is common when the minor piece controls key squares or supports a pawn chain.", tip: "Positional exchange sacrifices are a hallmark of advanced play." },
      { title: "Calculating Sacrifices", text: "Before sacrificing, calculate all forcing moves (checks, captures, threats) to make sure you get enough compensation.", tip: "If you can't see a clear follow-up, the sacrifice is probably unsound." },
    ],
  },
  {
    id: "pattern-recognition",
    title: "Pattern Recognition",
    description: "Train your eye to spot common tactical patterns",
    category: "Tactics",
    icon: <Eye className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    content: [
      { title: "Back Rank Mate", text: "When a king is trapped on the back rank by its own pawns and a rook or queen delivers checkmate along that rank.", tip: "Always give your king a 'luft' (escape square) by pushing h3 or a3.", board: { pieces: [{ row: 0, col: 6, symbol: B.king }, { row: 1, col: 5, symbol: B.pawn }, { row: 1, col: 6, symbol: B.pawn }, { row: 1, col: 7, symbol: B.pawn }, { row: 0, col: 3, symbol: W.rook }], size: 8 } },
      { title: "Smothered Mate", text: "A knight delivers checkmate when the king is surrounded by its own pieces and has no escape squares.", tip: "The classic: Qg8+! Rxg8, Nf7# — sacrifice the queen to smother the king!", board: { pieces: [{ row: 0, col: 6, symbol: B.king }, { row: 0, col: 7, symbol: B.rook }, { row: 1, col: 5, symbol: B.pawn }, { row: 1, col: 6, symbol: B.pawn }, { row: 0, col: 5, symbol: W.knight }], size: 8 } },
      { title: "Deflection", text: "Forcing a defensive piece away from its duty, leaving something unprotected.", tip: "Ask: 'What is this piece defending?' Then find a way to lure it away." },
      { title: "Decoy", text: "Luring an enemy piece to a specific square where it becomes vulnerable to a tactic.", tip: "Decoys often involve sacrifices that the opponent must accept." },
      { title: "Zwischenzug (In-Between Move)", text: "Instead of making the expected move, inserting an unexpected intermediate move (often a check) that improves your position.", tip: "In every sequence, ask: 'Is there an in-between move I can play first?'" },
    ],
  },
  {
    id: "calculation",
    title: "Calculation & Visualization",
    description: "Train your mind to see moves ahead",
    category: "Tactics",
    icon: <Brain className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "12 min",
    content: [
      { title: "Candidate Moves", text: "Before calculating, identify 2-3 candidate moves worth considering. This focuses your thinking and saves time.", tip: "Kotov's method: find candidates first, then calculate each line only once." },
      { title: "Checks, Captures, Threats", text: "Always start your calculation with forcing moves: checks first, then captures, then threats. These narrow the opponent's options.", tip: "CCT is the backbone of tactical calculation — make it automatic!" },
      { title: "Visualization Training", text: "Practice seeing positions 3-5 moves deep without moving pieces. Start with simple positions and increase complexity.", tip: "Blindfold chess exercises dramatically improve visualization." },
      { title: "When to Stop Calculating", text: "Stop when you reach a 'quiescent' position — one with no immediate tactics. Evaluate it using positional factors.", tip: "Don't calculate forever. If a position looks clearly better, play it!" },
    ],
  },
  {
    id: "endgame-king-pawn",
    title: "King & Pawn Endgames",
    description: "Essential endgame knowledge for winning close games",
    category: "Endgame",
    icon: <Crown className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    content: [
      { title: "Activate Your King!", text: "In endgames, the king becomes a fighting piece. March it towards the center and active squares.", tip: "The king can escort a passed pawn to promotion — don't keep it hiding!" },
      { title: "The Opposition", text: "When two kings face each other with one square between them, whoever does NOT have to move has the opposition (advantage).", tip: "Opposition is the single most important concept in king and pawn endgames.", board: { pieces: [{ row: 2, col: 2, symbol: B.king }, { row: 4, col: 2, symbol: W.king }], size: 6 } },
      { title: "The Rule of the Square", text: "Draw a diagonal from the pawn to the promotion square. If the defending king can step into this square, it catches the pawn.", tip: "Count squares quickly in time pressure instead of calculating move by move." },
      { title: "Key Squares", text: "Every pawn has 'key squares' — if your king reaches them, the pawn will promote regardless of the opponent's king.", tip: "For a pawn on the 5th rank, the key squares are the three squares on the 6th rank in front." },
      { title: "Outside Passed Pawns", text: "A passed pawn on the side of the board lures the opponent's king away, allowing your king to capture on the other side.", tip: "This is the most common winning technique in king and pawn endgames." },
    ],
  },
  {
    id: "endgame-rook",
    title: "Rook Endgames",
    description: "The most common endgame type — master it!",
    category: "Endgame",
    icon: <TrendingUp className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "12 min",
    content: [
      { title: "Rooks Belong Behind Passed Pawns", text: "Place your rook behind your own passed pawn (or behind the opponent's) — it gains more squares as the pawn advances.", tip: "Tarrasch's rule: rooks belong behind passed pawns, whether your own or your opponent's!", board: { pieces: [{ row: 2, col: 3, symbol: W.pawn }, { row: 5, col: 3, symbol: W.rook }], size: 6 } },
      { title: "The Lucena Position", text: "With your king on the queening square and rook nearby, use the 'bridge' technique to promote the pawn.", tip: "Learn the Lucena — it's the most important winning position in rook endgames." },
      { title: "The Philidor Position", text: "The key defensive technique: keep your rook on the 6th rank until the pawn advances, then check from behind.", tip: "This draw technique saves countless games. Know it by heart!" },
      { title: "Active Rook vs Passive Rook", text: "An active rook (cutting off the enemy king, attacking pawns) is worth much more than a passive rook stuck defending.", tip: "Sometimes giving up a pawn for rook activity is the right strategy." },
    ],
  },
  {
    id: "endgame-minor",
    title: "Minor Piece Endgames",
    description: "Bishop vs knight and other piece endings",
    category: "Endgame",
    icon: <Layers className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "10 min",
    content: [
      { title: "Bishop vs Knight", text: "Bishops prefer open positions; knights prefer closed ones. In endgames with pawns on both sides, bishops are usually better.", tip: "A bishop can control both sides of the board simultaneously — a knight can't!", board: { pieces: [{ row: 2, col: 2, symbol: W.bishop }, { row: 2, col: 4, symbol: B.knight }], size: 6 } },
      { title: "Good Bishop vs Bad Bishop", text: "A 'good' bishop operates on the opposite color of its own pawns. A 'bad' bishop is blocked by its own pawns.", tip: "Place your pawns on the opposite color of your bishop!" },
      { title: "The Wrong-Colored Bishop", text: "If your promotion square is the opposite color of your bishop, you may not be able to win even with an extra pawn.", tip: "This is a common drawing technique — learn when it applies." },
      { title: "Knight Outposts", text: "A knight firmly planted on an outpost (supported by a pawn, can't be chased by enemy pawns) is incredibly powerful.", tip: "A knight on d5 or e5 can dominate the entire board." },
    ],
  },
  {
    id: "positional-play",
    title: "Positional Chess",
    description: "Strategic concepts that separate good from great players",
    category: "Strategy",
    icon: <GraduationCap className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "15 min",
    content: [
      { title: "Weak Squares", text: "A weak square is one that can no longer be defended by pawns. Knights thrive on weak squares — plant them there!", tip: "Creating weak squares in your opponent's camp is a fundamental strategic goal." },
      { title: "Pawn Structure", text: "Doubled, isolated, and backward pawns are structural weaknesses. Avoid creating them unless you gain compensation.", tip: "The pawn structure often determines the plans for both sides.", board: { pieces: [{ row: 3, col: 3, symbol: W.pawn }, { row: 4, col: 3, symbol: W.pawn }, { row: 3, col: 1, symbol: W.pawn }], size: 6 } },
      { title: "Open Files", text: "Control open files with your rooks. An open file is one with no pawns — rooks dominate these lines.", tip: "Double your rooks on an open file for maximum pressure." },
      { title: "Piece Activity", text: "The most important positional concept: keep all your pieces active and coordinated. A passive piece is almost like being a piece down.", tip: "Before making a plan, ask: 'Are all my pieces active?'" },
      { title: "Prophylaxis", text: "Preventing your opponent's plans before they execute them. Ask 'What does my opponent want to do?' every move.", tip: "Karpov was the master of prophylaxis — study his games!" },
    ],
  },
  {
    id: "defense",
    title: "Defensive Techniques",
    description: "How to hold difficult positions and fight back",
    category: "Strategy",
    icon: <Shield className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "8 min",
    content: [
      { title: "Checks, Captures, Threats", text: "When under attack, consider ALL checks, captures, and threats (for both sides) before making defensive moves.", tip: "This 'CCT' method helps you find tactical resources in difficult positions." },
      { title: "Blockading", text: "Place a knight in front of an enemy passed pawn — it's the ideal blocker since it doesn't lose mobility.", tip: "A blockading knight on d5 or e5 is often worth as much as a rook!" },
      { title: "Counterattack", text: "The best defense is often a counter-threat. Don't just passively defend — create problems for your opponent too.", tip: "A counterattack on the other wing can force your opponent to stop their own attack." },
      { title: "Fortress", text: "Sometimes you can create an impenetrable setup even when down material. Look for drawing chances in seemingly lost positions!", tip: "Famous example: a bishop on the wrong color can't win even with an extra pawn." },
      { title: "Exchanging Pieces", text: "When defending with less material, exchange pieces — fewer pieces means fewer attacking chances for your opponent.", tip: "Trade queens when you're under attack — it usually relieves the pressure." },
    ],
  },
  {
    id: "attacking-play",
    title: "The Art of Attack",
    description: "How to launch and sustain a winning attack",
    category: "Strategy",
    icon: <Crosshair className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "12 min",
    content: [
      { title: "Prerequisites for Attack", text: "Before attacking, ensure: better development, center control, and a weakness in the enemy king's position.", tip: "Attacking without these elements usually backfires!" },
      { title: "Piece Coordination", text: "Bring multiple pieces to the attacking zone. A lone queen attack rarely works — you need supporters.", tip: "Aim to have at least 3 pieces involved in a kingside attack.", board: { pieces: [{ row: 0, col: 6, symbol: B.king }, { row: 1, col: 5, symbol: B.pawn }, { row: 1, col: 7, symbol: B.pawn }, { row: 3, col: 5, symbol: W.knight }, { row: 3, col: 6, symbol: W.bishop }, { row: 2, col: 7, symbol: W.queen }], size: 8 } },
      { title: "Pawn Storms", text: "Push pawns toward the enemy king to open lines. h4-h5 against a fianchettoed king is a classic theme.", tip: "Only storm when your own king is safe — usually on the opposite side." },
      { title: "The Sacrifice to Open Lines", text: "Sometimes a sacrifice is needed to crack open the enemy king's shelter. Look for Bxh7+, Rxf7, or Nxf7 themes.", tip: "If two pieces are pointing at the enemy king, look for a breakthrough sacrifice!" },
    ],
  },
  {
    id: "chess-psychology",
    title: "Chess Psychology",
    description: "The mental side of chess — mindset and decision-making",
    category: "Strategy",
    icon: <Lightbulb className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "6 min",
    content: [
      { title: "Time Management", text: "Don't spend all your time on one move. Budget your clock — spend more in critical moments, less in familiar positions.", tip: "In blitz, trust your instincts. In classical, verify with calculation." },
      { title: "Handling Mistakes", text: "Everyone blunders. The key is to stay focused after a mistake — don't compound it with another one.", tip: "Take a deep breath, assess the new position objectively, and fight on." },
      { title: "Playing on the Opponent's Time", text: "When your opponent is thinking, use that time to calculate your responses to their likely moves.", tip: "Good time management is often the difference between winning and losing." },
      { title: "Confidence vs Complacency", text: "Stay alert even in winning positions. Many games are lost because the winner relaxed too early.", tip: "Treat every position as a puzzle to solve — never assume the win is automatic." },
    ],
  },
  {
    id: "london-system",
    title: "The London System",
    description: "A solid and reliable opening for White",
    category: "Openings",
    icon: <Castle className="w-5 h-5" />,
    difficulty: "Beginner",
    estimatedTime: "8 min",
    content: [
      { title: "1. d4 and 2. Bf4", text: "White develops the dark-squared bishop before playing e3, keeping it active outside the pawn chain.", tip: "The London is great because you can play it against almost anything!", board: { pieces: [{ row: 4, col: 3, symbol: W.pawn }, { row: 4, col: 5, symbol: W.bishop }], size: 8 } },
      { title: "The Pyramid Structure", text: "Pawns on d4, e3, c3 form a solid pyramid. This structure is very hard to break down.", tip: "Set up your pyramid first, then develop knights to d2 and f3." },
      { title: "When to Play e4", text: "After completing development, push e4 to seize the center. This is the typical London breakthrough.", tip: "Prepare e4 with pieces, don't rush it — timing is everything." },
      { title: "Handling the King's Indian", text: "Against ...g6 and ...Bg7, maintain your bishop on f4 and build solidly. Don't let Black's bishop dominate.", tip: "Keep pawns off the g7-bishop's diagonal when possible." },
    ],
  },
  {
    id: "caro-kann",
    title: "The Caro-Kann Defense",
    description: "A rock-solid defense against 1. e4",
    category: "Openings",
    icon: <Shield className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    content: [
      { title: "1. e4 c6", text: "Black prepares ...d5 to challenge the center with pawn support. The Caro-Kann is known for solid pawn structures.", tip: "Unlike 1...e5, Black's queen and light-squared bishop stay flexible.", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 2, col: 2, symbol: B.pawn }], size: 8 } },
      { title: "The Advance Variation (3. e5)", text: "White gains space but Black gets a clear plan: undermine with ...c5 and develop naturally.", tip: "Against the Advance, play ...Bf5 before ...e6 to keep the bishop active." },
      { title: "The Classical (4. Nf3 Nf6)", text: "Both sides develop naturally. Black aims for a solid position with long-term equality.", tip: "Black's extra center pawn after the exchange gives targets to attack." },
      { title: "Endgame Strength", text: "The Caro-Kann often leads to positions where Black has slightly better endgames thanks to the pawn structure.", tip: "If you like strategic chess and endgames, the Caro-Kann is perfect for you." },
    ],
  },
  {
    id: "french-defense",
    title: "The French Defense",
    description: "A counterattacking weapon against 1. e4",
    category: "Openings",
    icon: <Swords className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    content: [
      { title: "1. e4 e6", text: "Black aims for ...d5 next, creating immediate central tension. The French is a fighting defense.", tip: "The French leads to rich middlegame positions with clear plans for both sides.", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 2, col: 4, symbol: B.pawn }], size: 8 } },
      { title: "The Winawer (3...Bb4)", text: "Black pins the knight and creates immediate imbalances. Sharp and tactical.", tip: "The Winawer is the most aggressive line — be ready for complications!", board: { pieces: [{ row: 4, col: 4, symbol: W.pawn }, { row: 3, col: 3, symbol: B.pawn }, { row: 0, col: 2, symbol: B.knight }, { row: 5, col: 1, symbol: B.bishop }], size: 8 } },
      { title: "Breaking with ...c5", text: "The key French move: ...c5 attacks White's d4 pawn and opens the position for Black's pieces.", tip: "...c5 is almost always the first move to consider in the French." },
      { title: "The Bad Bishop Problem", text: "Black's light-squared bishop is often blocked by the e6 pawn. Trade it or play around it!", tip: "Exchange the bad bishop early with ...b6 and ...Ba6, or play ...Bd7-Bc6." },
    ],
  },
  {
    id: "trapped-pieces",
    title: "Trapped Pieces",
    description: "Win material by trapping your opponent's pieces",
    category: "Tactics",
    icon: <Target className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "8 min",
    content: [
      { title: "The Wayward Bishop", text: "Bishops that venture too far into enemy territory can become trapped. Surround them with pawns!", tip: "A common trap: Bg4 gets trapped after h3, g4, and the bishop has no retreat.", board: { pieces: [{ row: 4, col: 6, symbol: B.bishop }, { row: 5, col: 5, symbol: W.pawn }, { row: 5, col: 7, symbol: W.pawn }], size: 8 } },
      { title: "Knight Traps", text: "Knights in the corner or edge are easy to trap. Use pawns to take away their escape squares.", tip: "Remember: a knight on the rim is dim — and sometimes trapped!" },
      { title: "Rook Traps", text: "Rooks can get trapped in the corner, especially when the king hasn't castled yet.", tip: "The most common rook trap: Ra1/Rh1 can't escape because the king blocks castling." },
      { title: "Queen Traps", text: "Even the queen can be trapped! If it ventures deep into enemy territory, pieces can surround it.", tip: "A trapped queen is usually game over — always leave your queen an escape route." },
    ],
  },
  {
    id: "opposite-colored-bishops",
    title: "Opposite-Colored Bishops",
    description: "Understanding this unique endgame and middlegame feature",
    category: "Endgame",
    icon: <Layers className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "10 min",
    content: [
      { title: "Drawing Tendencies", text: "In endgames, opposite-colored bishops strongly favor draws — the defending bishop controls squares the attacking one can't reach.", tip: "Even two extra pawns may not be enough to win with opposite-colored bishops!" },
      { title: "Middlegame Attacks", text: "Paradoxically, in middlegames, opposite-colored bishops favor the attacker! The defender's bishop can't contest the attacker's squares.", tip: "With opposite-colored bishops in the middlegame, launch a kingside attack — the defender's bishop is on the wrong color!", board: { pieces: [{ row: 0, col: 6, symbol: B.king }, { row: 3, col: 5, symbol: W.bishop }, { row: 3, col: 2, symbol: B.bishop }], size: 8 } },
      { title: "The Fortress", text: "Set up your pawns on the same color as your bishop, creating an impenetrable fortress on those squares.", tip: "In defense: pawns on your bishop's color. In attack: pawns on the opposite color." },
      { title: "Practical Tips", text: "Trade into opposite-colored bishops when you need a draw. Avoid them when you're trying to win!", tip: "This is one of the most important practical decisions in chess." },
    ],
  },
  {
    id: "pawn-structures-advanced",
    title: "Advanced Pawn Structures",
    description: "Deep dive into pawn formations and their plans",
    category: "Strategy",
    icon: <Layers className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "12 min",
    content: [
      { title: "The Isolani (Isolated Queen's Pawn)", text: "An isolated d-pawn gives piece activity but is a long-term weakness. Play actively before the endgame!", tip: "With an isolani: attack! Without one: simplify to an endgame.", board: { pieces: [{ row: 4, col: 3, symbol: W.pawn }, { row: 5, col: 2, symbol: "·" }, { row: 5, col: 4, symbol: "·" }], size: 8 } },
      { title: "Hanging Pawns", text: "Pawns on c4 and d4 without pawn support are 'hanging.' They control space but can become targets.", tip: "Push one of them at the right moment to break through!" },
      { title: "The Carlsbad Structure", text: "Arises from cxd5 in the Queen's Gambit. White gets a minority attack, Black gets a kingside attack.", tip: "This structure defines the plans for both sides — learn it well!" },
      { title: "The Maroczy Bind", text: "Pawns on c4 and e4 control d5 and restrict Black's pieces. A powerful space advantage.", tip: "Against the Maroczy, try ...b5 or ...d5 breaks to free your position.", board: { pieces: [{ row: 4, col: 2, symbol: W.pawn }, { row: 4, col: 4, symbol: W.pawn }], size: 8 } },
      { title: "Pawn Chains", text: "A chain of connected pawns (e.g., d4-e5-f4) should be attacked at the base, not the tip.", tip: "Nimzowitsch's rule: attack the pawn chain at its base!" },
    ],
  },
  {
    id: "exchange-sacrifices",
    title: "The Exchange Sacrifice",
    description: "When giving up a rook for a minor piece is strong",
    category: "Tactics",
    icon: <Puzzle className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "10 min",
    content: [
      { title: "Why Sacrifice the Exchange?", text: "Giving up a rook for a bishop or knight sounds crazy, but the compensation can be enormous: better pawn structure, dominant minor piece, or attacking chances.", tip: "Petrosian was the king of exchange sacrifices — study his games!" },
      { title: "Positional Exchange Sacs", text: "Sometimes you sacrifice to eliminate a key defensive piece or to plant an unassailable knight on a perfect square.", tip: "If your knight on d5 is worth more than their rook on a1, the exchange sacrifice makes sense!", board: { pieces: [{ row: 3, col: 3, symbol: W.knight }, { row: 0, col: 0, symbol: B.rook }], size: 6 } },
      { title: "Tactical Exchange Sacs", text: "Sometimes the rook sacrifice leads to a forced tactical sequence — checkmate or winning back material.", tip: "Look for Rxc3 or Rxe3 patterns where the pawn structure gets shattered." },
      { title: "Evaluating Compensation", text: "After an exchange sacrifice, assess: piece activity, pawn structure, king safety, and passed pawns.", tip: "If you have 2+ of these factors in your favor, the sacrifice is likely sound." },
    ],
  },
  {
    id: "endgame-queen",
    title: "Queen Endgames",
    description: "The trickiest endgame type — full of surprises",
    category: "Endgame",
    icon: <Crown className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "10 min",
    content: [
      { title: "Perpetual Check", text: "Queens can often force a draw by perpetual check. This is the main defensive resource in queen endgames.", tip: "Always check if perpetual check is possible before entering a queen endgame." },
      { title: "Queen vs Pawn on 7th", text: "A queen usually wins against a pawn on the 7th rank — but not always! The position of the kings matters hugely.", tip: "Against a c-pawn or f-pawn on the 7th, the queen may not be able to win due to stalemate tricks!" },
      { title: "Centralization", text: "The queen is strongest in the center. Centralize your queen and push passed pawns with king support.", tip: "A centralized queen + passed pawn is usually decisive.", board: { pieces: [{ row: 3, col: 3, symbol: W.queen }, { row: 5, col: 3, symbol: W.pawn }], size: 8 } },
      { title: "Checking Distance", text: "Keep your queen far from the enemy king for maximum checking potential. Close queens are less dangerous.", tip: "Long-range checks from the other side of the board are hardest to escape." },
    ],
  },
  {
    id: "english-opening",
    title: "The English Opening",
    description: "A flexible opening starting with 1. c4",
    category: "Openings",
    icon: <Flag className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "10 min",
    content: [
      { title: "1. c4 — The English", text: "White controls d5 from the flank, often transposing into other openings. Highly flexible and strategic.", tip: "The English can transpose into Queen's Gambit, King's Indian, or stay unique!", board: { pieces: [{ row: 4, col: 2, symbol: W.pawn }], size: 8 } },
      { title: "Symmetrical Variation (1...c5)", text: "Black mirrors White's approach. Both sides fight for central control from the wings.", tip: "In symmetrical English, the player who controls d5 usually gets the advantage." },
      { title: "Reversed Sicilian", text: "After 1...e5, White has a Sicilian Defense with an extra tempo. This gives White flexible plans.", tip: "Play it like a Sicilian, but with an extra move — that tempo matters!" },
      { title: "Plans and Ideas", text: "White typically fianchettoes the king's bishop (g3, Bg2), develops flexibly, and chooses a plan based on Black's setup.", tip: "The English is a thinking person's opening — adapt to your opponent." },
    ],
  },
  {
    id: "king-safety",
    title: "King Safety Fundamentals",
    description: "Keep your king safe while attacking your opponent's",
    category: "Strategy",
    icon: <Shield className="w-5 h-5" />,
    difficulty: "Beginner",
    estimatedTime: "7 min",
    content: [
      { title: "Castle Early", text: "Don't leave your king in the center. Castle within the first 10 moves to tuck it away safely.", tip: "An uncastled king is the #1 reason beginners lose games!", board: { pieces: [{ row: 7, col: 5, symbol: W.rook }, { row: 7, col: 6, symbol: W.king }, { row: 6, col: 5, symbol: W.pawn }, { row: 6, col: 6, symbol: W.pawn }, { row: 6, col: 7, symbol: W.pawn }], size: 8 } },
      { title: "Don't Move Kingside Pawns", text: "After castling kingside, avoid pushing f2, g2, or h2 pawns. Each push creates weaknesses around your king.", tip: "Every pawn move near your king is a potential entry point for the opponent." },
      { title: "Keep Defenders Nearby", text: "Don't send all your pieces to attack if your king is exposed. Leave at least one minor piece for defense.", tip: "A knight on f1 or f8 is often the best king defender." },
      { title: "Opposite-Side Castling", text: "When both sides castle on opposite wings, it becomes a race — whoever attacks faster wins!", tip: "In opposite-side castling, push pawns toward the enemy king aggressively." },
    ],
  },
  {
    id: "piece-coordination",
    title: "Piece Coordination & Harmony",
    description: "How to make your pieces work together",
    category: "Strategy",
    icon: <GraduationCap className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "9 min",
    content: [
      { title: "What is Coordination?", text: "Coordinated pieces support each other, control the same area, and work toward a common goal.", tip: "Uncoordinated pieces = scattered army. Coordinated pieces = unstoppable force." },
      { title: "Bishop & Knight Teamwork", text: "A bishop and knight complement each other perfectly — one controls light squares, the other dark squares.", tip: "Place the knight where it controls squares your bishop can't reach.", board: { pieces: [{ row: 3, col: 2, symbol: W.bishop }, { row: 3, col: 4, symbol: W.knight }], size: 6 } },
      { title: "Rook Coordination", text: "Double your rooks on an open file or the 7th rank. Two connected rooks are one of the strongest forces in chess.", tip: "Doubled rooks on the 7th rank are called 'pigs' — they devour everything!" },
      { title: "Piece Overloading", text: "If one of your opponent's pieces is defending two things, you can exploit this by attacking both targets.", tip: "Look for defenders that are doing double duty — they're ready to collapse!" },
      { title: "The Ideal Piece Placement", text: "Every piece has an ideal square. Knights: central outposts. Bishops: long diagonals. Rooks: open files. Queen: flexible central position.", tip: "Before making a plan, ask: where does each of my pieces want to be?" },
    ],
  },
  {
    id: "time-trouble",
    title: "Playing in Time Trouble",
    description: "How to handle low clock situations",
    category: "Strategy",
    icon: <Zap className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "6 min",
    content: [
      { title: "Prevention is Best", text: "The best way to handle time trouble is to avoid it. Budget your clock — spend more time on critical positions.", tip: "A good rule: use 50% of your time in the first 20 moves, 50% for the rest." },
      { title: "Simple Moves First", text: "In time trouble, play simple, solid moves. Avoid complications and tactical minefields.", tip: "A slightly inferior but safe move is better than a brilliant but risky one when short on time." },
      { title: "Create Practical Problems", text: "If your opponent is in time trouble, play complex moves that require deep thought. Make them spend time!", tip: "Objectively second-best moves that create confusion can be practically strongest." },
      { title: "Pre-move Planning", text: "While your opponent thinks, plan your next 2-3 moves. Have a backup plan ready for different responses.", tip: "In online chess, use pre-moves for obvious responses to save precious seconds." },
    ],
  },
  {
    id: "middlegame-planning",
    title: "Middlegame Planning",
    description: "How to find the right plan in any position",
    category: "Strategy",
    icon: <Brain className="w-5 h-5" />,
    difficulty: "Advanced",
    estimatedTime: "12 min",
    content: [
      { title: "Assess the Position", text: "Before making a plan, evaluate: material, king safety, piece activity, pawn structure, and space.", tip: "Silman's 'imbalances' method: identify what's different between the two sides." },
      { title: "Identify Weaknesses", text: "Find targets in your opponent's position: weak pawns, exposed king, bad pieces, vulnerable squares.", tip: "The weakest point in your opponent's camp should guide your plan." },
      { title: "Improve Your Worst Piece", text: "Find your least active piece and improve it. This single concept can transform your game!", tip: "Karpov's secret: always improve your worst piece before attacking.", board: { pieces: [{ row: 5, col: 0, symbol: W.bishop }, { row: 5, col: 1, symbol: W.pawn }], size: 8 } },
      { title: "Choose the Right Side", text: "Attack where you're stronger. If you have a queenside majority, play there. Kingside majority? Attack the king!", tip: "Playing on your strong side while defending the weak side is the essence of chess strategy." },
      { title: "When to Change Plans", text: "If your opponent neutralizes your plan, don't stubbornly continue. Reassess and find a new direction.", tip: "Flexibility is key — the best players constantly adjust their plans." },
    ],
  },
];

const CATEGORIES = ["Basics", "Openings", "Tactics", "Endgame", "Strategy"];

const difficultyColors: Record<string, string> = {
  Beginner: "text-green-500 bg-green-500/10",
  Intermediate: "text-yellow-500 bg-yellow-500/10",
  Advanced: "text-red-500 bg-red-500/10",
};

const Lessons = () => {
  const { profile, completeLesson } = useProfile();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentStep, setCurrentStep] = useState(0);

  const completedLessons = new Set(profile.completed_lessons);
  const filtered = activeCategory === "all" ? LESSONS : LESSONS.filter((l) => l.category === activeCategory);

  const handleComplete = () => {
    if (selectedLesson) {
      completeLesson(selectedLesson.id);
    }
  };

  if (selectedLesson) {
    const step = selectedLesson.content[currentStep];
    const isLastStep = currentStep === selectedLesson.content.length - 1;
    const progressPercent = ((currentStep + 1) / selectedLesson.content.length) * 100;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 relative">
        <div className="chess-bg" />
        <div className="chess-bg-vignette" />
        <div className="max-w-3xl mx-auto relative z-10">
          <button
            onClick={() => { setSelectedLesson(null); setCurrentStep(0); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Lessons
          </button>

          <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[selectedLesson.difficulty]}`}>
                {selectedLesson.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">{selectedLesson.category}</span>
              <span className="text-xs text-muted-foreground">• {selectedLesson.estimatedTime}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{selectedLesson.title}</h1>
            <p className="text-muted-foreground mb-6">{selectedLesson.description}</p>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Step {currentStep + 1} of {selectedLesson.content.length}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Current Step */}
            <div className="bg-secondary/50 rounded-xl p-6 mb-6 min-h-[200px]">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {currentStep + 1}
                </span>
                {step.title}
              </h3>
              <p className="text-foreground leading-relaxed mb-4">{step.text}</p>

              {/* Board Visual */}
              {step.board && (
                <div className="flex justify-center">
                  <MiniBoard pieces={step.board.pieces} size={step.board.size} />
                </div>
              )}

              {step.tip && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3 mt-4">
                  <span className="text-lg">💡</span>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Pro Tip</span>
                    <p className="text-sm text-foreground mt-1">{step.tip}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
              >
                ← Previous
              </button>

              <div className="flex gap-1.5">
                {selectedLesson.content.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentStep ? "bg-primary scale-125" : i < currentStep ? "bg-primary/40" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              {isLastStep ? (
                <button
                  onClick={() => {
                    handleComplete();
                    setSelectedLesson(null);
                    setCurrentStep(0);
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Complete ✓
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Next →
                </button>
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
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Chess Lessons</h1>
            <p className="text-muted-foreground">
              {completedLessons.size}/{LESSONS.length} completed • Learn from beginner to advanced
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-card/90 backdrop-blur-sm rounded-xl border border-border p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-semibold text-foreground">{Math.round((completedLessons.size / LESSONS.length) * 100)}%</span>
          </div>
          <Progress value={(completedLessons.size / LESSONS.length) * 100} className="h-2" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
            }`}
          >
            All ({LESSONS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = LESSONS.filter((l) => l.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((lesson) => {
            const isCompleted = completedLessons.has(lesson.id);
            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`bg-card/90 backdrop-blur-sm rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer group ${
                  isCompleted ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCompleted ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : lesson.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[lesson.difficulty]}`}>
                          {lesson.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">{lesson.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{lesson.content.length} steps</span>
                  <span>•</span>
                  <span>{lesson.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
