import { PIECE_SYMBOLS, PieceType } from "@/lib/chess";
import { ScrollArea } from "./ui/scroll-area";

export interface MoveRecord {
  moveNumber: number;
  color: "white" | "black";
  piece: PieceType;
  from: string;
  to: string;
  captured?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: "kingside" | "queenside";
  isPromotion?: PieceType;
}

const PIECE_LETTERS: Record<PieceType, string> = {
  king: "K",
  queen: "Q",
  rook: "R",
  bishop: "B",
  knight: "N",
  pawn: "",
};

function formatMove(move: MoveRecord): string {
  if (move.isCastling === "kingside") return "O-O";
  if (move.isCastling === "queenside") return "O-O-O";

  let notation = PIECE_LETTERS[move.piece];
  if (move.captured) {
    if (move.piece === "pawn") notation += move.from[0];
    notation += "x";
  }
  notation += move.to;
  if (move.isPromotion) notation += "=" + PIECE_LETTERS[move.isPromotion];
  if (move.isCheckmate) notation += "#";
  else if (move.isCheck) notation += "+";
  return notation;
}

interface MoveHistoryProps {
  moves: MoveRecord[];
}

export const MoveHistory = ({ moves }: MoveHistoryProps) => {
  // Group moves into pairs (white + black)
  const pairs: { number: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (const move of moves) {
    if (move.color === "white") {
      pairs.push({ number: move.moveNumber, white: move });
    } else {
      const last = pairs[pairs.length - 1];
      if (last && !last.black) {
        last.black = move;
      } else {
        pairs.push({ number: move.moveNumber, black: move });
      }
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-3 w-full lg:w-56">
      <h3 className="text-sm font-bold text-foreground mb-2">Move History</h3>
      <ScrollArea className="h-64">
        {pairs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No moves yet</p>
        ) : (
          <div className="space-y-0.5 pr-2">
            {pairs.map((pair, i) => (
              <div key={i} className="flex text-xs font-mono gap-1">
                <span className="text-muted-foreground w-6 text-right shrink-0">{pair.number}.</span>
                <span className="w-14 text-foreground font-semibold">
                  {pair.white ? formatMove(pair.white) : ""}
                </span>
                <span className="w-14 text-foreground">
                  {pair.black ? formatMove(pair.black) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
