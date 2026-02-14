import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Target, Crown, Shield, Zap, ChevronRight, Swords, Eye, Flag, Puzzle, GraduationCap, TrendingUp, Check } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  content: { title: string; text: string; tip?: string }[];
}

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
      { title: "The Pawn", text: "Pawns move forward one square, or two from their starting position. They capture diagonally one square forward.", tip: "Pawns that reach the 8th rank promote to any piece — usually a queen!" },
      { title: "The Rook", text: "Rooks move any number of squares horizontally or vertically. They are powerful in open files and on the 7th rank.", tip: "Two rooks on the 7th rank is called 'pigs on the 7th' — it's devastating!" },
      { title: "The Knight", text: "Knights move in an 'L' shape: two squares in one direction and one perpendicular. They jump over other pieces.", tip: "A knight on the rim is dim! Keep knights centralized for maximum power." },
      { title: "The Bishop", text: "Bishops move diagonally any number of squares. Each bishop stays on its starting color for the entire game.", tip: "The bishop pair (both bishops) is very strong in open positions." },
      { title: "The Queen", text: "The Queen combines the rook and bishop's movements — she can move any number of squares in any direction.", tip: "Don't bring your queen out too early! She can be chased by minor pieces." },
      { title: "The King", text: "The King moves one square in any direction. Protecting your king is the ultimate goal of chess.", tip: "In the endgame, the king becomes an attacking piece. Activate it!" },
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
      { title: "Control the Center", text: "Place pawns on e4/d4 (or e5/d5 as black) to dominate the board. Central control gives your pieces more mobility.", tip: "The center squares (e4, d4, e5, d5) are the most important real estate on the board." },
      { title: "Develop Your Pieces", text: "Move knights and bishops out early. Each move should contribute to development — don't move the same piece twice.", tip: "Aim to develop all minor pieces before move 10. Knights before bishops is usually best." },
      { title: "Castle Early", text: "Castle within the first 10 moves to get your king to safety and connect your rooks.", tip: "Castling kingside (O-O) is generally safer than queenside (O-O-O)." },
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
      { title: "1. e4 e5", text: "Both sides open by advancing the king's pawn two squares, fighting for the center immediately.", tip: "This is the most common start in chess history!" },
      { title: "2. Nf3 Nc6", text: "Both knights develop to their natural squares, attacking the center pawns and preparing for castling.", tip: "Nf3 attacks the e5 pawn — Black must defend it." },
      { title: "3. Bc4 — The Italian!", text: "The bishop comes to c4, eyeing the weak f7 square near Black's king. This is the Italian Game.", tip: "f7 is the weakest point in Black's position early on — only the king defends it." },
      { title: "Main Ideas for White", text: "White wants to develop quickly, castle kingside, and potentially launch an attack on the kingside.", tip: "Common plans include d3, O-O, c3, then d4 to open the center." },
      { title: "Black's Best Responses", text: "Black can play Bc5 (Giuoco Piano) for equal play, or Nf6 (Two Knights Defense) for a sharper game.", tip: "Both responses are solid — pick based on your style!" },
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
      { title: "What is a Pin?", text: "A pin occurs when an attacking piece threatens a less valuable piece that cannot move because a more valuable piece is behind it.", tip: "Bishops and rooks are the best pinning pieces." },
      { title: "Absolute vs Relative Pins", text: "An absolute pin is when the piece behind is the king (illegal to move). A relative pin is when the piece behind is valuable but can legally move.", tip: "Absolute pins are stronger — the pinned piece literally cannot move!" },
      { title: "Exploiting Pins", text: "Once a piece is pinned, pile up pressure on it. Add more attackers to the pinned piece to win material.", tip: "A common tactic: pin a knight with a bishop, then attack it with a pawn." },
      { title: "What is a Skewer?", text: "A skewer is the reverse: the more valuable piece is in front. When it moves, you capture the piece behind.", tip: "Rook skewers along ranks and files are very common in endgames." },
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
      { title: "The Knight Fork", text: "Knights are the best forking pieces because they attack pieces that can't attack them back. The 'royal fork' (king + queen) is devastating.", tip: "Always check if your knight can land on a square attacking two valuable pieces." },
      { title: "Pawn Forks", text: "Pawns can fork two pieces by advancing diagonally. These are often overlooked because pawns seem harmless.", tip: "A pawn fork is extra strong because pawns are worth the least — any capture is a win!" },
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
      { title: "The Greek Gift (Bxh7+)", text: "One of the most famous sacrifices: the bishop captures on h7 with check, followed by Ng5+ and Qh5 for a devastating kingside attack.", tip: "Look for this pattern when your opponent has castled kingside and the h-pawn is unprotected." },
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
      { title: "Back Rank Mate", text: "When a king is trapped on the back rank by its own pawns and a rook or queen delivers checkmate along that rank.", tip: "Always give your king a 'luft' (escape square) by pushing h3 or a3." },
      { title: "Smothered Mate", text: "A knight delivers checkmate when the king is surrounded by its own pieces and has no escape squares.", tip: "The classic: Qg8+! Rxg8, Nf7# — sacrifice the queen to smother the king!" },
      { title: "Deflection", text: "Forcing a defensive piece away from its duty, leaving something unprotected.", tip: "Ask: 'What is this piece defending?' Then find a way to lure it away." },
      { title: "Decoy", text: "Luring an enemy piece to a specific square where it becomes vulnerable to a tactic.", tip: "Decoys often involve sacrifices that the opponent must accept." },
      { title: "Zwischenzug (In-Between Move)", text: "Instead of making the expected move, inserting an unexpected intermediate move (often a check) that improves your position.", tip: "In every sequence, ask: 'Is there an in-between move I can play first?'" },
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
      { title: "The Opposition", text: "When two kings face each other with one square between them, whoever does NOT have to move has the opposition (advantage).", tip: "Opposition is the single most important concept in king and pawn endgames." },
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
      { title: "Rooks Belong Behind Passed Pawns", text: "Place your rook behind your own passed pawn (or behind the opponent's) — it gains more squares as the pawn advances.", tip: "Tarrasch's rule: rooks belong behind passed pawns, whether your own or your opponent's!" },
      { title: "The Lucena Position", text: "With your king on the queening square and rook nearby, use the 'bridge' technique to promote the pawn.", tip: "Learn the Lucena — it's the most important winning position in rook endgames." },
      { title: "The Philidor Position", text: "The key defensive technique: keep your rook on the 6th rank until the pawn advances, then check from behind.", tip: "This draw technique saves countless games. Know it by heart!" },
      { title: "Active Rook vs Passive Rook", text: "An active rook (cutting off the enemy king, attacking pawns) is worth much more than a passive rook stuck defending.", tip: "Sometimes giving up a pawn for rook activity is the right strategy." },
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
      { title: "Pawn Structure", text: "Doubled, isolated, and backward pawns are structural weaknesses. Avoid creating them unless you gain compensation.", tip: "The pawn structure often determines the plans for both sides." },
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
    id: "chess-psychology",
    title: "Chess Psychology",
    description: "The mental side of chess — mindset and decision-making",
    category: "Strategy",
    icon: <Eye className="w-5 h-5" />,
    difficulty: "Intermediate",
    estimatedTime: "6 min",
    content: [
      { title: "Time Management", text: "Don't spend all your time on one move. Budget your clock — spend more in critical moments, less in familiar positions.", tip: "In blitz, trust your instincts. In classical, verify with calculation." },
      { title: "Handling Mistakes", text: "Everyone blunders. The key is to stay focused after a mistake — don't compound it with another one.", tip: "Take a deep breath, assess the new position objectively, and fight on." },
      { title: "Playing on the Opponent's Time", text: "When your opponent is thinking, use that time to calculate your responses to their likely moves.", tip: "Good time management is often the difference between winning and losing." },
      { title: "Confidence vs Complacency", text: "Stay alert even in winning positions. Many games are lost because the winner relaxed too early.", tip: "Treat every position as a puzzle to solve — never assume the win is automatic." },
    ],
  },
];

const CATEGORIES = ["Basics", "Openings", "Tactics", "Endgame", "Strategy"];

const difficultyColors = {
  Beginner: "text-green-500 bg-green-500/10",
  Intermediate: "text-yellow-500 bg-yellow-500/10",
  Advanced: "text-red-500 bg-red-500/10",
};

const Lessons = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const filtered = activeCategory === "all" ? LESSONS : LESSONS.filter((l) => l.category === activeCategory);

  const handleComplete = () => {
    if (selectedLesson) {
      setCompletedLessons((prev) => new Set(prev).add(selectedLesson.id));
    }
  };

  if (selectedLesson) {
    const step = selectedLesson.content[currentStep];
    const isLastStep = currentStep === selectedLesson.content.length - 1;
    const progressPercent = ((currentStep + 1) / selectedLesson.content.length) * 100;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setSelectedLesson(null); setCurrentStep(0); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Lessons
          </button>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
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
              {step.tip && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
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
                className={`bg-card rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer group ${
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
