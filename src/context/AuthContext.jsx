import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "freshroot_auth";
const API_BASE = "http://localhost:3000/api/auth";

export const AuthProvider = ({ children }) => {
  // Read initial session from localStorage
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate session structure and expiry
      if (!parsed || !parsed.token || !parsed.user) return null;
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn("Failed to parse stored auth session:", e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync legacy keys for backward compatibility
  const syncStorage = (newSession) => {
    if (newSession && newSession.token && newSession.user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
        localStorage.setItem("freshroot_token", newSession.token);
        localStorage.setItem("token", newSession.token);
        localStorage.setItem("freshroot_user", JSON.stringify(newSession.user));
        localStorage.setItem("user", JSON.stringify(newSession.user));
      } catch (e) {
        console.error("Error storing session:", e);
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("freshroot_token");
        localStorage.removeItem("token");
        localStorage.removeItem("freshroot_user");
        localStorage.removeItem("user");
      } catch (e) {
        console.error("Error clearing session:", e);
      }
    }
  };

  // Helper to verify session with backend
  const verifySessionWithBackend = useCallback(async (tokenToVerify) => {
    if (!tokenToVerify) return null;
    try {
      const res = await fetch(`${API_BASE}/verify`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenToVerify}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      } else {
        return null;
      }
    } catch (err) {
      console.warn("Backend verification check unavailable (backend might be starting):", err.message);
      // If network error, allow local token if unexpired
      return "NETWORK_ERROR";
    }
  }, []);

  // Verify on initial mount
  useEffect(() => {
    const initAuth = async () => {
      if (session && session.token) {
        // Check local expiration
        if (session.expiresAt && Date.now() > session.expiresAt) {
          setSession(null);
          syncStorage(null);
          setLoading(false);
          return;
        }

        // Verify with backend
        const verifiedUser = await verifySessionWithBackend(session.token);
        if (verifiedUser === null) {
          // Token rejected by backend
          setSession(null);
          syncStorage(null);
        } else if (verifiedUser && verifiedUser !== "NETWORK_ERROR") {
          // Update user details if refreshed
          const updated = { ...session, user: verifiedUser };
          setSession(updated);
          syncStorage(updated);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [verifySessionWithBackend]);

  // Login handler
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Invalid email or password.");
    }

    const token = data.token || `fallback-token-${Date.now()}`;
    const expiresAt = data.expiresAt || (Date.now() + 24 * 60 * 60 * 1000);

    const newSession = {
      token,
      expiresAt,
      user: data.user
    };

    setSession(newSession);
    syncStorage(newSession);
    return data;
  };

  // Register handler
  const register = async (fullName, email, password) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim(),
        password
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Registration failed. Please try again.");
    }

    const token = data.token || `fallback-token-${Date.now()}`;
    const expiresAt = data.expiresAt || (Date.now() + 24 * 60 * 60 * 1000);

    const newSession = {
      token,
      expiresAt,
      user: data.user
    };

    setSession(newSession);
    syncStorage(newSession);
    return data;
  };

  // Logout handler
  const logout = () => {
    setSession(null);
    syncStorage(null);
  };

  // Validation helper: strictly requires valid token and unexpired timestamp
  const isAuthenticated = Boolean(
    session &&
    session.token &&
    session.user &&
    (!session.expiresAt || Date.now() < session.expiresAt)
  );

  const currentUser = session?.user || null;
  const token = session?.token || null;

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        setSessionFromAuth: (user, userToken) => {
          const newSession = {
            token: userToken || `token-${Date.now()}`,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            user
          };
          setSession(newSession);
          syncStorage(newSession);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
