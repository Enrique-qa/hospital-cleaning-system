import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import type { UserRole } from "../utils/userRole";

const TOKEN_KEY = "@hsl-cleaning:token";

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // A sessão ainda funciona enquanto a página estiver aberta.
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Mantém o logout funcional mesmo se o armazenamento estiver indisponível.
  }
}

type User = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
};

type AuthContextData = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setToken(null);
    setLoading(false);
    delete api.defaults.headers.common.Authorization;
  }, []);

  async function signIn(username: string, password: string) {
    const response = await api.post("/login", {
      username,
      password,
    });

    const { token, user } = response.data;

    storeToken(token);

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    setToken(token);
    setUser(user);
  }

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        const response = await api.get("/profile");

        setUser(response.data);
      } catch {
        signOut();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [signOut, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The provider and its companion hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
