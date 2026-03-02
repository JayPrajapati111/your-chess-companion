import { PieceColor } from "@/lib/chess";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface GameEndDialogProps {
  open: boolean;
  status: "checkmate" | "stalemate" | "timeout" | "repetition" | "fifty-move" | null;
  winner: PieceColor | null;
  playerLabel?: { white: string; black: string };
  onNewGame: () => void;
  onClose: () => void;
  onAnalyze?: () => void;
}

export const GameEndDialog = ({
  open,
  status,
  winner,
  playerLabel = { white: "White", black: "Black" },
  onNewGame,
  onClose,
  onAnalyze,
}: GameEndDialogProps) => {
  const isDraw = status === "stalemate" || status === "repetition" || status === "fifty-move";
  const winnerName = winner ? playerLabel[winner] : null;
  const loserName = winner ? playerLabel[winner === "white" ? "black" : "white"] : null;

  const getEmoji = () => {
    if (isDraw) return "🤝";
    if (status === "timeout") return "⏰";
    return "👑";
  };

  const getTitle = () => {
    if (status === "repetition") return "Draw by Repetition!";
    if (status === "fifty-move") return "Draw by 50-Move Rule!";
    if (status === "stalemate") return "Draw by Stalemate!";
    if (status === "timeout") return "Time's Up!";
    return "Checkmate!";
  };

  const getDescription = () => {
    if (status === "repetition") return "The same position occurred three times — it's a draw!";
    if (status === "fifty-move") return "50 moves without a capture or pawn move — it's a draw!";
    if (status === "stalemate") return "Neither player wins — it's a draw!";
    if (status === "timeout") return `${loserName} ran out of time.`;
    return `${loserName} has been checkmated.`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="text-6xl mb-2">{getEmoji()}</div>
          <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
          <DialogDescription className="text-base">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {!isDraw && winner && (
          <div className="py-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-3xl">{winner === "white" ? "♔" : "♚"}</span>
              <div className="text-left">
                <p className="font-bold text-foreground text-lg">{winnerName}</p>
                <p className="text-sm text-primary font-semibold">Winner!</p>
              </div>
            </div>
          </div>
        )}

        {isDraw && (
          <div className="py-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-muted border border-border">
              <span className="text-2xl">♔</span>
              <span className="text-muted-foreground font-semibold">½ – ½</span>
              <span className="text-2xl">♚</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 justify-center pt-2">
          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              📊 Game Review
            </button>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onNewGame}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              New Game
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              Review Board
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
