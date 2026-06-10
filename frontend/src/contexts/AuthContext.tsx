import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
  id: number;
  name: string;
  username: string;
  role: "ADMIN" | "MANAGER";
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
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("@hsl-cleaning:token")
  );
  const [loading, setLoading] = useState(true);

  function signOut() {
    localStorage.removeItem("@hsl-cleaning:token");
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common.Authorization;
  }

  async function signIn(username: string, password: string) {
    const response = await api.post("/login", {
      username,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("@hsl-cleaning:token", token);

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
  }, [token]);

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
