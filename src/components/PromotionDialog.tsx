import { PieceColor, PieceType, PIECE_SYMBOLS } from "@/lib/chess";

interface PromotionDialogProps {
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
}

const PROMOTION_PIECES: PieceType[] = ["queen", "rook", "bishop", "knight"];

export const PromotionDialog = ({ color, onSelect }: PromotionDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-foreground text-center mb-4">Promote Pawn</h3>
        <div className="flex gap-3">
          {PROMOTION_PIECES.map((type) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-secondary hover:bg-primary/20 hover:border-primary border-2 border-border transition-all cursor-pointer"
            >
              <span
                className={`text-4xl md:text-5xl select-none ${
                  color === "white"
                    ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
                    : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                }`}
                style={{ WebkitTextStroke: color === "white" ? "1px #333" : "none" }}
              >
                {PIECE_SYMBOLS[color][type]}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">Choose a piece for your pawn</p>
      </div>
    </div>
  );
};
