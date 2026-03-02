import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Attach token automatically
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${parsedUser.token}`;
    }

    setLoading(false);
  }, []);

  const login = ({ id, role, token, name }) => {
    const userData = { id, role, token, name };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Attach token to all future requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};