import { ChessBoard } from "@/components/ChessBoard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LocalMatch = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Local Match</h1>
            <p className="text-muted-foreground">Play against a friend on the same device</p>
          </div>
        </div>

        {/* Chess Board */}
        <div className="flex justify-center">
          <ChessBoard />
        </div>

        {/* Rules Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Full chess rules • Castling • En Passant • Pawn Promotion</p>
        </div>
      </div>
    </div>
  );
};

export default LocalMatch;
