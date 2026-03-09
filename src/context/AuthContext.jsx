import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(localStorage.getItem("token"));

  const storedUser = localStorage.getItem("user");
  let parsedUser = null;
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    parsedUser = null;
  }

  const [user, setUser] = useState(parsedUser);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (user?.exp) {
      const currentTime = Date.now() / 1000;
      if (user.exp < currentTime) {
        logout();
      }
    }
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
