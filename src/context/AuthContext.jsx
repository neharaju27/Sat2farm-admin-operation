import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const LOGIN_API_URL = import.meta.env.VITE_LOGIN_API_URL;
const GET_ADMIN_KEY_API_URL = import.meta.env.VITE_GET_ADMIN_KEY_API_URL;

async function fetchAdminKey(mobileNo) {
  if (!GET_ADMIN_KEY_API_URL || !mobileNo) return null;

  const response = await fetch(
    `${GET_ADMIN_KEY_API_URL}?mobile_no=${encodeURIComponent(mobileNo)}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch admin key (status: ${response.status})`);
  }

  const result = await response.json();
  return (
    result?.api_key ||
    result?.admin_key ||
    result?.key ||
    result?.data?.api_key ||
    null
  );
}

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

  const loadAdminKeyForUser = useCallback(async (userData) => {
    const mobileNo = userData?.phone_number || userData?.username;
    if (!mobileNo) return userData;

    try {
      const adminApiKey = await fetchAdminKey(mobileNo);
      return { ...userData, phone_number: mobileNo, admin_api_key: adminApiKey };
    } catch (error) {
      console.error('Error fetching admin key on session load:', error);
      return userData;
    }
  }, []);

  // Load user from localStorage on mount (if session is still valid)
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isSessionValid(stored)) {
        try {
          const data = JSON.parse(stored);
          const withAdminKey = await loadAdminKeyForUser(data);
          if (!cancelled) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(withAdminKey));
            setUser(withAdminKey);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (!cancelled) setLoading(false);
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [loadAdminKeyForUser]);

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

    // Store response with login timestamp and admin API key
    let userData = { ...data, phone_number, loginTimestamp: Date.now() };
    try {
      const adminApiKey = await fetchAdminKey(phone_number);
      userData = { ...userData, admin_api_key: adminApiKey };
    } catch (error) {
      console.error('Error fetching admin key after login:', error);
    }

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
