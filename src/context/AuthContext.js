import { auth } from "@/config/firebase";
import { logoutUser } from "@/services/authService";
import { updateStreak } from "@/services/streakService";
import { defaultProfile, ensureUserDefaults, getUserProfile } from "@/services/userService";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadProfile(uid, email) {
  // right after registration the profile document can take a moment to appear
  for (let i = 0; i < 5; i++) {
    if (await ensureUserDefaults(uid)) {
      try { await updateStreak(uid); } catch (e) {}
      const p = await getUserProfile(uid);
      if (p) return p;
    }
    await sleep(500);
  }
  return defaultProfile(uid, email);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fb) => {
      setUser(fb);
      if (!fb) { setProfile(null); setLoading(false); return; }
      setLoading(true);
      try { setProfile(await loadProfile(fb.uid, fb.email || "")); }
      catch (e) { setProfile(defaultProfile(fb.uid, fb.email || "")); }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getUserProfile(user.uid);
    if (p) setProfile(p);
  }, [user]);

  const signOut = useCallback(async () => { await logoutUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}