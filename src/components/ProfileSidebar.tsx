import { Trophy, Target, Puzzle, TrendingUp, TrendingDown, Minus, Swords } from "lucide-react";
import { ProfileData } from "@/hooks/useProfile";

interface ProfileSidebarProps {
  profile: ProfileData;
}

const getRatingTier = (rating: number) => {
  if (rating < 600) return { label: "Beginner", color: "text-muted-foreground", stars: 1 };
  if (rating < 800) return { label: "Casual", color: "text-green-500", stars: 2 };
  if (rating < 1000) return { label: "Intermediate", color: "text-yellow-500", stars: 3 };
  if (rating < 1200) return { label: "Advanced", color: "text-orange-500", stars: 4 };
  if (rating < 1500) return { label: "Expert", color: "text-red-500", stars: 5 };
  return { label: "Master", color: "text-purple-500", stars: 6 };
};

export const ProfileSidebar = ({ profile }: ProfileSidebarProps) => {
  const totalGames = profile.wins + profile.losses + profile.draws;
  const winRate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0;
  const gameTier = getRatingTier(profile.game_rating);
  const puzzleTier = getRatingTier(profile.puzzle_rating);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl">
            ♔
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{profile.display_name || "Guest"}</h2>
            <p className="text-xs text-muted-foreground">Chess Player</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Game Rating */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Game Rating</span>
            <span className={`text-xs font-bold ${gameTier.color}`}>{gameTier.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <Swords className="w-5 h-5 text-primary" />
            <span className="text-3xl font-extrabold text-primary">{profile.game_rating}</span>
            <span className="text-xs text-muted-foreground">ELO</span>
          </div>
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < gameTier.stars ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-stat-wins" />
            </div>
            <p className="text-xl font-bold text-foreground">{profile.wins}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Minus className="w-3.5 h-3.5 text-stat-draws" />
            </div>
            <p className="text-xl font-bold text-foreground">{profile.draws}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Draws</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingDown className="w-3.5 h-3.5 text-stat-losses" />
            </div>
            <p className="text-xl font-bold text-foreground">{profile.losses}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Losses</p>
          </div>
        </div>

        {/* Win Rate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <span className="text-sm font-bold text-foreground">{winRate}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
            {totalGames > 0 ? (
              <>
                <div className="bg-stat-wins h-full transition-all" style={{ width: `${(profile.wins / totalGames) * 100}%` }} />
                <div className="bg-stat-draws h-full transition-all" style={{ width: `${(profile.draws / totalGames) * 100}%` }} />
                <div className="bg-stat-losses h-full transition-all" style={{ width: `${(profile.losses / totalGames) * 100}%` }} />
              </>
            ) : (
              <div className="bg-muted h-full w-full" />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-stat-wins">{profile.wins}W</span>
            <span className="text-[10px] text-stat-draws">{profile.draws}D</span>
            <span className="text-[10px] text-stat-losses">{profile.losses}L</span>
          </div>
        </div>

        {/* Puzzle Stats */}
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Puzzle className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-foreground">Puzzles</span>
            </div>
            <span className={`text-xs font-bold ${puzzleTier.color}`}>{puzzleTier.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{profile.puzzle_rating}</span>
            <span className="text-xs text-muted-foreground">ELO</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{profile.puzzles_solved} puzzles solved</p>
        </div>

        {/* Total Games */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Total Games Played</p>
          <p className="text-2xl font-bold text-foreground">{totalGames}</p>
        </div>
      </div>
    </div>
  );
};
