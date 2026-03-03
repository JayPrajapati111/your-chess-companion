import { useNavigate } from "react-router-dom";
import { Monitor, Users, Puzzle, BookOpen, Crown, Dumbbell } from "lucide-react";
import { GameModeCard } from "@/components/GameModeCard";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  return (
    <div className="min-h-screen bg-background relative">
      <div className="chess-bg" />
      <div className="chess-bg-vignette" />
      <header className="pt-8 pb-4 text-center relative z-10">
        <p className="text-muted-foreground text-lg">Play, Learn, and Master the Game of Kings</p>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-6">Play Chess</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GameModeCard icon={Monitor} title="Play vs Computer" description="Challenge the AI with adjustable difficulty and time controls" variant="green" onClick={() => navigate("/computer")} />
              <GameModeCard icon={Users} title="Local Match" description="Play against a friend on the same device" variant="blue" onClick={() => navigate("/local-match")} />
              <GameModeCard icon={Puzzle} title="Puzzles" description="Solve tactical puzzles to improve your skills" variant="purple" onClick={() => navigate("/puzzles")} />
              <GameModeCard icon={BookOpen} title="Lessons" description="Learn chess from beginner to advanced strategies" variant="orange" onClick={() => navigate("/lessons")} />
            </div>

            <div onClick={() => navigate("/practice")} className="mt-6 bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Practice</h3>
                <p className="text-sm text-muted-foreground">Sharpen your skills with targeted checkmate, tactics & endgame exercises</p>
              </div>
            </div>

            <div onClick={() => navigate("/players")} className="mt-4 bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Famous Chess Players</h3>
                <p className="text-sm text-muted-foreground">Explore the greatest minds in chess history</p>
              </div>
            </div>
          </div>

          <div className="lg:w-80">
            <ProfileSidebar profile={profile} />
          </div>
        </div>
      </main>

      <footer className="py-8 text-center relative z-10">
        <p className="text-sm text-muted-foreground">Full chess rules • Castling • En Passant • Pawn Promotion</p>
      </footer>
    </div>
  );
};

export default Index;
