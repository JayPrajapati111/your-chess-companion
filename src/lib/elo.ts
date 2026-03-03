// ELO Rating System
const K_FACTOR = 32;

export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: "win" | "loss" | "draw"
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actual = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
  return Math.round(K_FACTOR * (actual - expected));
}

export function getNewRating(
  playerRating: number,
  opponentRating: number,
  result: "win" | "loss" | "draw"
): number {
  return Math.max(100, playerRating + calculateEloChange(playerRating, opponentRating, result));
}

// AI difficulty rating estimates
export const AI_RATINGS: Record<string, number> = {
  easy: 600,
  medium: 1000,
  hard: 1500,
};
