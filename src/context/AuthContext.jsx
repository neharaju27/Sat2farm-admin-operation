import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const LOGIN_API_URL = import.meta.env.VITE_LOGIN_API_URL;

// Session expires after 12 hours (matches backend JWT)
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const STORAGE_KEY = 'sat2farm_auth';

/**
 * Check if the stored session is still valid (within 12 hours of login).
 */
function isSessionValid(stored) {
  if (!stored) return false;
  try {
    const data = JSON.parse(stored);
    const hasToken = data.jwt || data.token;
    if (!data || !hasToken || !data.loginTimestamp) return false;
    return Date.now() - data.loginTimestamp < SESSION_DURATION_MS;
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount (if session is still valid)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSessionValid(stored)) {
      try {
        const data = JSON.parse(stored);
        setUser(data);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      // Clear expired or invalid session
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (phone_number, password) => {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    // Store response with login timestamp for 12-hour expiry tracking
    const userData = { ...data, loginTimestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
