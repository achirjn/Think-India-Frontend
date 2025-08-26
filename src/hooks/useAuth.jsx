import { useState, useEffect, createContext, useContext } from 'react';
import { getToken, removeToken, isAuthenticated } from '../utils/auth';

// Create a context for authentication
const AuthContext = createContext(null);

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth().
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      // Check if user is admin
      const adminStatus = localStorage.getItem('is_admin') === 'true';
      setIsAdmin(adminStatus);

      // Get user info if authenticated
      if (authenticated) {
        try {
          const token = getToken();
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.id,
            name: payload.name || payload.username || payload.sub || 'User',
            email: payload.email || payload.username || payload.sub || '',
            // Add other user properties as needed
          });
        } catch (error) {
          console.error('Error parsing user data from token:', error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    checkAuth();

    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || e.key === 'is_admin') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Login function
  const login = (token, isAdminUser = false) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('is_admin', isAdminUser);
    setIsLoggedIn(true);
    setIsAdmin(isAdminUser);

    // Parse user data from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.id,
        name: payload.name || payload.username || payload.sub || 'User',
        email: payload.email || payload.username || payload.sub || '',
        // Add other user properties as needed
      });
    } catch (error) {
      console.error('Error parsing user data from token:', error);
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    localStorage.removeItem('is_admin');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
  };

  // Make the auth object available to any component that calls useAuth()
  const value = {
    isLoggedIn,
    isAdmin,
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for components to get the auth object and re-render when it changes
export default function useAuth() {
  return useContext(AuthContext);
}