import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type firebase from 'firebase/compat/app';
import { firebaseAuth } from '../lib/firebase';

type AuthContextValue = {
  user: firebase.User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setHydrated(true);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      async login(email: string, password: string) {
        await firebaseAuth.signInWithEmailAndPassword(email, password);
      },
      async register(email: string, password: string) {
        await firebaseAuth.createUserWithEmailAndPassword(email, password);
      },
      async logout() {
        await firebaseAuth.signOut();
      },
    }),
    [hydrated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
