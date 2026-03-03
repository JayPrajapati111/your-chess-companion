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
}

const DEFAULT_PROFILE: Omit<ProfileData, "id" | "user_id"> = {
  display_name: "Guest",
  game_rating: 800,
  puzzle_rating: 800,
  wins: 0,
  losses: 0,
  draws: 0,
  puzzles_solved: 0,
};

// Local storage fallback for unauthenticated users
const LOCAL_KEY = "chess_profile";

function getLocalProfile(): ProfileData {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { id: "local", user_id: "local", ...DEFAULT_PROFILE };
}

function saveLocalProfile(profile: ProfileData) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(getLocalProfile());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
          });
        }
      } else {
        setProfile(getLocalProfile());
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
        })
        .eq("user_id", newProfile.user_id);
    } else {
      saveLocalProfile(newProfile);
    }
  }, [profile, isAuthenticated]);

  return { profile, updateProfile, loading, isAuthenticated };
}
