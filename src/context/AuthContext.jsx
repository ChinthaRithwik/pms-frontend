import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const checkExpiry = () => {
      if (user?.exp && user.exp < Date.now() / 1000) {
        logout();
      }
    };
    checkExpiry(); // immediate check on mount / user change
    // FIX M1: poll every 60 s to catch mid-session token expiry
    const timer = setInterval(checkExpiry, 60_000);
    return () => clearInterval(timer);
  }, [user]);

  const login = (jwtToken) => {
    const decoded = jwtDecode(jwtToken);

    const userData = {
      email: decoded.sub,
      role: decoded.role ?? "USER",
      exp: decoded.exp,
    };

    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
