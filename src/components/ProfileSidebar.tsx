import { Trophy, Target, Puzzle } from "lucide-react";

interface ProfileStats {
  gameRating: number;
  wins: number;
  winRate: number;
  puzzlesSolved: number;
  puzzleRating: number;
  winsCount: number;
  drawsCount: number;
  lossesCount: number;
}

interface ProfileSidebarProps {
  stats: ProfileStats;
}

export const ProfileSidebar = ({ stats }: ProfileSidebarProps) => {
  return (
    <div className="profile-card h-fit">
      <h2 className="text-xl font-bold text-primary mb-6">Your Profile</h2>
      
      {/* Game Rating */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-2">Game Rating</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary text-lg">★★</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">{stats.gameRating}</span>
          <span className="text-muted-foreground text-sm">Casual</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-border">
        <div className="text-center">
          <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.wins}</p>
          <p className="text-xs text-muted-foreground">Wins</p>
        </div>
        <div className="text-center">
          <Target className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.winRate}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>
        <div className="text-center">
          <Puzzle className="w-5 h-5 text-game-purple mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.puzzlesSolved}</p>
          <p className="text-xs text-muted-foreground">Puzzles</p>
        </div>
      </div>

      {/* Puzzle Rating */}
      <div className="mb-4">
        <p className="text-muted-foreground text-sm mb-2">Puzzle Rating</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary text-lg">★★</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">{stats.puzzleRating}</span>
          <span className="text-muted-foreground text-sm">Casual</span>
        </div>
      </div>

      {/* W/D/L Stats */}
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="text-stat-wins">{stats.winsCount}W</span>
        <span className="text-stat-draws">{stats.drawsCount}D</span>
        <span className="text-stat-losses">{stats.lossesCount}L</span>
      </div>
    </div>
  );
};
