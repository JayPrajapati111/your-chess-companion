import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileData {
  id: string;
  user_id: string;
  display_name: string | null;
  game_rating: number;
  puzzle_rating: number;
  wins: number;
  losses: number;
  draws: number;
  puzzles_solved: number;
  completed_lessons: string[];
  completed_practices: string[];
}

const DEFAULT_PROFILE: Omit<ProfileData, "id" | "user_id"> = {
  display_name: "Guest",
  game_rating: 800,
  puzzle_rating: 800,
  wins: 0,
  losses: 0,
  draws: 0,
  puzzles_solved: 0,
  completed_lessons: [],
  completed_practices: [],
};

const LOCAL_KEY = "chess_profile";
const LOCAL_GAMES_KEY = "chess_game_history";

function getLocalProfile(): ProfileData {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...{ id: "local", user_id: "local", ...DEFAULT_PROFILE },
        ...parsed,
      };
    }
  } catch {}
  return { id: "local", user_id: "local", ...DEFAULT_PROFILE };
}

function saveLocalProfile(profile: ProfileData) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
}

export interface GameRecord {
  id?: string;
  result: string;
  moves: string[];
  time_control?: string;
  created_at?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(getLocalProfile());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (data) {
          setProfile({
            id: data.id,
            user_id: data.user_id,
            display_name: data.display_name,
            game_rating: data.game_rating ?? 800,
            puzzle_rating: data.puzzle_rating ?? 800,
            wins: data.wins ?? 0,
            losses: data.losses ?? 0,
            draws: data.draws ?? 0,
            puzzles_solved: data.puzzles_solved ?? 0,
            completed_lessons: (data as any).completed_lessons ?? [],
            completed_practices: (data as any).completed_practices ?? [],
          });
        }
        const { data: games } = await supabase
          .from("games")
          .select("*")
          .or(`white_player_id.eq.${session.user.id},black_player_id.eq.${session.user.id}`)
          .order("created_at", { ascending: false })
          .limit(50);
        if (games) setGameHistory(games.map(g => ({ id: g.id, result: g.result, moves: g.moves || [], time_control: g.time_control || undefined, created_at: g.created_at })));
      } else {
        setProfile(getLocalProfile());
        try {
          const stored = localStorage.getItem(LOCAL_GAMES_KEY);
          if (stored) setGameHistory(JSON.parse(stored));
        } catch {}
      }
      setLoading(false);
    };
    init();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    if (isAuthenticated) {
      await supabase
        .from("profiles")
        .update({
          game_rating: newProfile.game_rating,
          puzzle_rating: newProfile.puzzle_rating,
          wins: newProfile.wins,
          losses: newProfile.losses,
          draws: newProfile.draws,
          puzzles_solved: newProfile.puzzles_solved,
          completed_lessons: newProfile.completed_lessons,
          completed_practices: newProfile.completed_practices,
        } as any)
        .eq("user_id", newProfile.user_id);
    } else {
      saveLocalProfile(newProfile);
    }
  }, [profile, isAuthenticated]);

  const saveGame = useCallback(async (game: { result: string; moves: string[]; time_control?: string }) => {
    const record: GameRecord = { ...game, created_at: new Date().toISOString() };
    if (isAuthenticated) {
      await supabase.from("games").insert({
        result: game.result,
        moves: game.moves,
        time_control: game.time_control || null,
        white_player_id: profile.user_id,
      });
    } else {
      const history = [...gameHistory, record].slice(-50);
      localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(history));
    }
    setGameHistory(prev => [record, ...prev].slice(0, 50));
  }, [isAuthenticated, profile.user_id, gameHistory]);

  const completeLesson = useCallback(async (lessonId: string) => {
    if (profile.completed_lessons.includes(lessonId)) return;
    const updated = [...profile.completed_lessons, lessonId];
    await updateProfile({ completed_lessons: updated });
  }, [profile, updateProfile]);

  const completePractice = useCallback(async (practiceId: string) => {
    if (profile.completed_practices.includes(practiceId)) return;
    const updated = [...profile.completed_practices, practiceId];
    await updateProfile({ completed_practices: updated });
  }, [profile, updateProfile]);

  const resetProfile = useCallback(async () => {
    const resetData = { ...DEFAULT_PROFILE };
    const newProfile = { ...profile, ...resetData };
    setProfile(newProfile);
    if (isAuthenticated) {
      await supabase.from("profiles").update(resetData as any).eq("user_id", newProfile.user_id);
    } else {
      saveLocalProfile(newProfile);
    }
  }, [profile, isAuthenticated]);

  return { profile, updateProfile, loading, isAuthenticated, gameHistory, saveGame, resetProfile, completeLesson, completePractice };
}
