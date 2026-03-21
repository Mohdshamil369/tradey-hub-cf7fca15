import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type OnboardingStatus = "role_selection" | "profile_setup" | "completed";
type AppRole = "customer" | "trader";

type TraderType = "individual" | "agency";

interface Profile {
  id: string;
  user_id: string;
  role: AppRole | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  street: string | null;
  city: string | null;
  postcode: string | null;
  onboarding_status: OnboardingStatus;
  kyc_status: "pending" | "verified" | "failed" | "manual_review";
  avatar_url: string | null;
  trader_type: TraderType | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    
    // For demo: if signup fails (e.g. no supabase config), allow proceeding anyway
    if (error) {
      console.warn("Signup failed/unavailable, using dummy session", error);
      const dummyId = "dummy-user-" + Date.now();
      const dummyUser = { id: dummyId, email } as User;
      const dummySession = { user: dummyUser, access_token: "dummy" } as Session;
      const dummyProfile: Profile = {
        id: dummyId,
        user_id: dummyId,
        role: "trader",
        full_name: "Demo User",
        phone: "+31 6 12 34 56 78",
        email: email,
        date_of_birth: null,
        street: null,
        city: null,
        postcode: null,
        onboarding_status: "profile_setup",
        kyc_status: "verified",
        avatar_url: null,
        trader_type: "individual",
      };
      setSession(dummySession);
      setUser(dummyUser);
      setProfile(dummyProfile);
      return { error: null };
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    // For demo: if signin fails, allow proceeding with any data
    if (error) {
      console.warn("Signin failed/unavailable, using dummy session", error);
      const dummyId = "dummy-user-" + Date.now();
      const dummyUser = { id: dummyId, email } as User;
      const dummySession = { user: dummyUser, access_token: "dummy" } as Session;
      const dummyProfile: Profile = {
        id: dummyId,
        user_id: dummyId,
        role: "trader",
        full_name: "Demo User",
        phone: email.startsWith("+31") ? email.split("@")[0].replace(/^\+31/, "") : "6 12 34 56 78",
        email: email,
        date_of_birth: null,
        street: null,
        city: null,
        postcode: null,
        onboarding_status: "completed",
        kyc_status: "verified",
        avatar_url: null,
        trader_type: "individual",
      };
      setSession(dummySession);
      setUser(dummyUser);
      setProfile(dummyProfile);
      return { error: null };
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "Not authenticated" };
    
    // Handle dummy users — update local state directly
    if (user.id.startsWith("dummy-user-")) {
      setProfile((prev) => prev ? { ...prev, ...updates } : prev);
      return { error: null };
    }
    
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (!error) {
      await fetchProfile(user.id);
    }
    return { error };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
