import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Target, Crown, Shield, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  content: string[];
  diagram?: string; // FEN-like description
}

const LESSONS: Lesson[] = [
  {
    id: "basics",
    title: "How Pieces Move",
    description: "Learn how each chess piece moves across the board",
    category: "Beginner",
    icon: <BookOpen className="w-5 h-5" />,
    content: [
      "♙ Pawns move forward one square, or two squares from their starting position. They capture diagonally.",
      "♖ Rooks move any number of squares horizontally or vertically. They are powerful in open files.",
      "♘ Knights move in an 'L' shape: two squares in one direction and one square perpendicular. They can jump over other pieces.",
      "♗ Bishops move diagonally any number of squares. Each bishop stays on its starting color.",
      "♕ The Queen is the most powerful piece, combining the rook and bishop's movements.",
      "♔ The King moves one square in any direction. Protecting your king is the most important goal.",
    ],
  },
  {
    id: "opening-principles",
    title: "Opening Principles",
    description: "Master the fundamentals of the chess opening",
    category: "Beginner",
    icon: <Zap className="w-5 h-5" />,
    content: [
      "1. Control the center — Place pawns and pieces on or towards e4, d4, e5, d5 to dominate the board.",
      "2. Develop your pieces — Move knights and bishops out early. Don't move the same piece twice without reason.",
      "3. Castle early — Get your king to safety and connect your rooks. Castle within the first 10 moves.",
      "4. Don't bring the queen out too early — She can be chased around by minor pieces, wasting time.",
      "5. Connect your rooks — After developing pieces and castling, your rooks should protect each other on the back rank.",
    ],
  },
  {
    id: "tactics-pins",
    title: "Pins & Skewers",
    description: "Learn these essential tactical motifs",
    category: "Tactics",
    icon: <Target className="w-5 h-5" />,
    content: [
      "A PIN occurs when an attacking piece threatens a less valuable piece that cannot move because a more valuable piece is behind it.",
      "Example: A bishop attacks a knight, and the king is behind the knight. The knight is 'pinned' and cannot move.",
      "An ABSOLUTE PIN is when the piece behind is the king — the pinned piece literally cannot move (it's illegal).",
      "A SKEWER is the reverse of a pin: the more valuable piece is in front. When it moves, the piece behind is captured.",
      "Example: A rook checks the king, and when the king moves, the rook captures the queen behind it.",
      "Practice spotting pins and skewers in every game — they win material more than any other tactic!",
    ],
  },
  {
    id: "tactics-forks",
    title: "Forks & Double Attacks",
    description: "Attack two pieces at once to win material",
    category: "Tactics",
    icon: <Zap className="w-5 h-5" />,
    content: [
      "A FORK is when one piece attacks two or more enemy pieces simultaneously.",
      "Knight forks are the most common — knights can attack pieces that don't threaten them back.",
      "The most devastating fork: a knight attacking both the king and queen ('royal fork').",
      "Pawns can also fork! A pawn advancing to attack two pieces is a powerful and often overlooked tactic.",
      "Queens and bishops can create forks too, but they're harder to execute since opponents can see them coming.",
      "Always check if your knight can jump to a square that attacks multiple high-value pieces.",
    ],
  },
  {
    id: "endgame-king-pawn",
    title: "King & Pawn Endgames",
    description: "Essential endgame knowledge for winning games",
    category: "Endgame",
    icon: <Crown className="w-5 h-5" />,
    content: [
      "In king and pawn endgames, the KING becomes an attacking piece. Activate your king!",
      "The OPPOSITION: When two kings face each other with one square between them, the player NOT to move has the opposition (advantage).",
      "The Rule of the Square: Draw a diagonal from the pawn to the promotion square. If the opposing king can step into this square, it can catch the pawn.",
      "Key squares: For a pawn on the 5th rank, the three squares in front of it on the 6th rank are 'key squares'. If your king reaches any of them, the pawn promotes.",
      "Outside passed pawns are extremely valuable in endgames — they lure the opponent's king away from the other side.",
      "Study basic checkmate patterns: King + Queen vs King, King + Rook vs King.",
    ],
  },
  {
    id: "defense",
    title: "Defensive Techniques",
    description: "How to hold difficult positions and defend accurately",
    category: "Strategy",
    icon: <Shield className="w-5 h-5" />,
    content: [
      "When under attack, consider ALL checks, captures, and threats before making defensive moves.",
      "Blockading: Place a knight in front of an enemy passed pawn — it's the best blocker since it doesn't lose mobility.",
      "Fortress: Sometimes you can create an impenetrable setup even when down material. Look for drawing chances!",
      "Counterattack: The best defense is often a counter-threat. Don't just passively defend.",
      "Prophylaxis: Prevent your opponent's plans before they execute them. Ask 'What does my opponent want to do?'",
      "Exchange pieces when defending with less material — fewer pieces means fewer attacking chances for your opponent.",
    ],
  },
];

const CATEGORIES = ["Beginner", "Tactics", "Endgame", "Strategy"];

const Lessons = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all" ? LESSONS : LESSONS.filter((l) => l.category === activeCategory);

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Lessons
          </button>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {selectedLesson.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-4 mb-2">{selectedLesson.title}</h1>
            <p className="text-muted-foreground mb-8">{selectedLesson.description}</p>

            <div className="space-y-4">
              {selectedLesson.content.map((paragraph, i) => (
                <div key={i} className="flex gap-3 p-4 bg-secondary/50 rounded-xl">
                  <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                  <p className="text-foreground leading-relaxed">{paragraph}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Chess Lessons</h1>
            <p className="text-muted-foreground">Learn chess from beginner to advanced</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {lesson.icon}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{lesson.category}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{lesson.title}</h3>
              <p className="text-sm text-muted-foreground">{lesson.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
