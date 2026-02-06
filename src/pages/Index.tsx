import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Users, Puzzle, Swords } from "lucide-react";
import { GameModeCard } from "@/components/GameModeCard";
import { ProfileSidebar } from "@/components/ProfileSidebar";

const Index = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    gameRating: 800,
    wins: 0,
    winRate: 0,
    puzzlesSolved: 0,
    puzzleRating: 800,
    winsCount: 0,
    drawsCount: 0,
    lossesCount: 0,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <p className="text-muted-foreground text-lg">Play, Learn, and Master the Game of Kings</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Game Modes */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-6">Play Chess</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GameModeCard
                icon={Monitor}
                title="Play vs Computer"
                description="Challenge the AI with adjustable difficulty and time controls"
                variant="green"
                onClick={() => navigate("/local-match")}
              />
              
              <GameModeCard
                icon={Users}
                title="Local Match"
                description="Play against a friend on the same device"
                variant="blue"
                onClick={() => navigate("/local-match")}
              />
              
              <GameModeCard
                icon={Puzzle}
                title="Puzzles"
                description="Solve tactical puzzles to improve your skills"
                variant="purple"
                onClick={() => navigate("/local-match")}
              />
              
              <GameModeCard
                icon={Swords}
                title="Quick Play"
                description="Jump into a fast game with default settings"
                variant="orange"
                onClick={() => navigate("/local-match")}
              />
            </div>
          </div>

          {/* Right Side - Profile */}
          <div className="lg:w-80">
            <ProfileSidebar stats={stats} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Full chess rules • Castling • En Passant • Pawn Promotion
        </p>
      </footer>
    </div>
  );
};

export default Index;
