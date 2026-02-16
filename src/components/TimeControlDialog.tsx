import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { TimeControl, TIME_CONTROLS } from "./ChessTimer";

interface TimeControlDialogProps {
  open: boolean;
  onSelect: (tc: TimeControl) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "bullet": return "bg-game-orange/20 text-game-orange border-game-orange/30";
    case "blitz": return "bg-game-blue/20 text-game-blue border-game-blue/30";
    case "rapid": return "bg-game-green/20 text-game-green border-game-green/30";
    default: return "bg-secondary text-muted-foreground border-border";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "bullet": return "⚡ Bullet";
    case "blitz": return "🔥 Blitz";
    case "rapid": return "⏱️ Rapid";
    default: return "♟️ Classical";
  }
};

export const TimeControlDialog = ({ open, onSelect }: TimeControlDialogProps) => {
  const grouped = {
    bullet: TIME_CONTROLS.filter(tc => tc.type === "bullet"),
    blitz: TIME_CONTROLS.filter(tc => tc.type === "blitz"),
    rapid: TIME_CONTROLS.filter(tc => tc.type === "rapid"),
    classical: TIME_CONTROLS.filter(tc => tc.type === "classical"),
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Choose Time Control</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {(["bullet", "blitz", "rapid", "classical"] as const).map(type => (
            <div key={type}>
              <p className="text-sm font-semibold text-muted-foreground mb-2">{getTypeLabel(type)}</p>
              <div className="flex flex-wrap gap-2">
                {grouped[type].map(tc => (
                  <button
                    key={tc.name}
                    onClick={() => onSelect(tc)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:ring-2 hover:ring-primary ${getTypeColor(tc.type)}`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
