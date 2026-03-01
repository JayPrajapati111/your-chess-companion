import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Star, Medal, Crown } from "lucide-react";

interface ChessPlayer {
  name: string;
  country: string;
  peakRating: number;
  currentRating?: number;
  title: string;
  born: string;
  worldChampion?: string;
  achievements: string[];
  bio: string;
  flag: string;
}

const FAMOUS_PLAYERS: ChessPlayer[] = [
  {
    name: "Magnus Carlsen",
    country: "Norway",
    peakRating: 2882,
    currentRating: 2831,
    title: "GM",
    born: "1990",
    worldChampion: "2013–2023",
    achievements: [
      "Highest FIDE rating in history (2882)",
      "5-time World Chess Champion",
      "Triple Crown (Classical, Rapid, Blitz)",
      "Won World Rapid & Blitz Championships multiple times",
    ],
    bio: "Widely regarded as the greatest chess player of all time, Magnus Carlsen became a grandmaster at 13 and dominated chess for over a decade.",
    flag: "🇳🇴",
  },
  {
    name: "Garry Kasparov",
    country: "Russia",
    peakRating: 2851,
    title: "GM",
    born: "1963",
    worldChampion: "1985–2000",
    achievements: [
      "Youngest ever undisputed World Chess Champion at 22",
      "Held #1 ranking for 255 months",
      "Famous match against IBM's Deep Blue (1997)",
      "Revolutionized chess opening theory",
    ],
    bio: "Kasparov dominated chess from 1985 to 2005 and is considered one of the greatest players ever. His rivalry with Anatoly Karpov is legendary.",
    flag: "🇷🇺",
  },
  {
    name: "Bobby Fischer",
    country: "USA",
    peakRating: 2785,
    title: "GM",
    born: "1943",
    worldChampion: "1972–1975",
    achievements: [
      "11th World Chess Champion",
      "Perfect 6-0 score in US Championship 1963-64",
      "Won 20 consecutive games against top GMs",
      "Created Fischer Random Chess (Chess960)",
    ],
    bio: "Bobby Fischer's meteoric rise and 1972 World Championship match against Boris Spassky captivated the world during the Cold War era.",
    flag: "🇺🇸",
  },
  {
    name: "Viswanathan Anand",
    country: "India",
    peakRating: 2817,
    title: "GM",
    born: "1969",
    worldChampion: "2007–2013",
    achievements: [
      "5-time World Chess Champion",
      "First Asian to win the World Championship",
      "Won World Rapid Championship",
      "Pioneer who inspired a generation of Indian chess players",
    ],
    bio: "Known as 'The Lightning Kid' for his rapid play, Anand is one of the most versatile champions and a beloved figure in world chess.",
    flag: "🇮🇳",
  },
  {
    name: "Ding Liren",
    country: "China",
    peakRating: 2816,
    currentRating: 2734,
    title: "GM",
    born: "1992",
    worldChampion: "2023–2024",
    achievements: [
      "18th World Chess Champion",
      "First Chinese World Chess Champion",
      "100-game unbeaten streak (2017-2018)",
      "Won Candidates Tournament 2023",
    ],
    bio: "Ding Liren made history by becoming the first Chinese player to win the World Chess Championship, defeating Ian Nepomniachtchi in 2023.",
    flag: "🇨🇳",
  },
  {
    name: "Judit Polgár",
    country: "Hungary",
    peakRating: 2735,
    title: "GM",
    born: "1976",
    achievements: [
      "Strongest female chess player in history",
      "Became youngest GM at 15 years old (1991)",
      "Defeated Kasparov, Karpov, Spassky, and other legends",
      "Peak ranking #8 in the world (open category)",
    ],
    bio: "Judit Polgár broke every gender barrier in chess, competing exclusively in open tournaments and defeating nearly every World Champion of her era.",
    flag: "🇭🇺",
  },
  {
    name: "Hikaru Nakamura",
    country: "USA",
    peakRating: 2816,
    currentRating: 2802,
    title: "GM",
    born: "1987",
    achievements: [
      "5-time US Chess Champion",
      "World Fischer Random Chess Champion",
      "Most popular chess streamer globally",
      "Candidates Tournament finalist 2024",
    ],
    bio: "Hikaru Nakamura is known for his exceptional speed chess and has become the most popular chess personality on the internet through streaming.",
    flag: "🇺🇸",
  },
  {
    name: "D. Gukesh",
    country: "India",
    peakRating: 2794,
    currentRating: 2783,
    title: "GM",
    born: "2006",
    worldChampion: "2024–present",
    achievements: [
      "Youngest World Chess Champion in history (18 years old)",
      "Youngest ever Candidates Tournament winner",
      "Became GM at 12 years old",
      "Won gold medal at Chess Olympiad 2024",
    ],
    bio: "Dommaraju Gukesh stunned the chess world by becoming the youngest World Chess Champion ever in 2024, defeating Ding Liren.",
    flag: "🇮🇳",
  },
  {
    name: "Hou Yifan",
    country: "China",
    peakRating: 2686,
    title: "GM",
    born: "1994",
    achievements: [
      "4-time Women's World Chess Champion",
      "Youngest ever female World Champion at 16",
      "Achieved GM title at 14 years old",
      "Professor at Shenzhen University",
    ],
    bio: "Hou Yifan is the strongest active female chess player and one of the youngest GMs in history, known for competing in open tournaments.",
    flag: "🇨🇳",
  },
  {
    name: "Nona Gaprindashvili",
    country: "Georgia",
    peakRating: 2495,
    title: "GM",
    born: "1941",
    worldChampion: "1962–1978 (Women's)",
    achievements: [
      "First woman to earn the GM title (1978)",
      "5-time Women's World Chess Champion",
      "Won 11 Chess Olympiad gold medals for Georgia",
      "Pioneer who broke gender barriers in chess",
    ],
    bio: "Nona Gaprindashvili made history as the first woman to earn the Grandmaster title, paving the way for future generations of female players.",
    flag: "🇬🇪",
  },
  {
    name: "Wenjun Ju",
    country: "China",
    peakRating: 2604,
    title: "GM",
    born: "1991",
    worldChampion: "2018–2023 (Women's)",
    achievements: [
      "Women's World Chess Champion (2018–2023)",
      "Won Women's Grand Prix multiple times",
      "Chess Olympiad gold medalist",
      "Dominated women's chess for half a decade",
    ],
    bio: "Ju Wenjun defended her Women's World Championship title multiple times and is one of the strongest female players in history.",
    flag: "🇨🇳",
  },
  {
    name: "Maia Chiburdanidze",
    country: "Georgia",
    peakRating: 2560,
    title: "GM",
    born: "1961",
    worldChampion: "1978–1991 (Women's)",
    achievements: [
      "Youngest Women's World Champion at 17",
      "Held the Women's title for 13 years",
      "First woman to reach 2560 FIDE rating",
      "Won numerous Chess Olympiad medals",
    ],
    bio: "Maia Chiburdanidze became the youngest Women's World Champion in 1978 and dominated women's chess for over a decade.",
    flag: "🇬🇪",
  },
];

const Players = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="chess-bg" />
      <div className="chess-bg-vignette" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Famous Chess Players</h1>
            <p className="text-muted-foreground">The greatest minds in chess history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAMOUS_PLAYERS.map((player) => (
            <div
              key={player.name}
              className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border p-6 hover:border-primary/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-4xl shadow-inner border border-border">
                    {player.flag}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{player.name}</h2>
                    <p className="text-sm text-muted-foreground">{player.flag} {player.country} • Born {player.born}</p>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full shrink-0">
                  {player.title}
                </span>
              </div>

              {/* Rating */}
              <div className="flex gap-4 mb-4">
                <div className="bg-secondary rounded-xl px-4 py-2 flex-1">
                  <p className="text-xs text-muted-foreground">Peak Rating</p>
                  <p className="text-lg font-bold text-foreground flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary" /> {player.peakRating}
                  </p>
                </div>
                {player.currentRating && (
                  <div className="bg-secondary rounded-xl px-4 py-2 flex-1">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-lg font-bold text-foreground">{player.currentRating}</p>
                  </div>
                )}
                {player.worldChampion && (
                  <div className="bg-secondary rounded-xl px-4 py-2 flex-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Crown className="w-3 h-3" /> Champion</p>
                    <p className="text-sm font-bold text-foreground">{player.worldChampion}</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{player.bio}</p>

              {/* Achievements */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-primary" /> Key Achievements
                </p>
                <ul className="space-y-1">
                  {player.achievements.map((a, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Medal className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Players;
