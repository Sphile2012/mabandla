import React, { createContext, useState, useContext, useEffect } from 'react';
import { prince } from '@/api/princeClient';

const AuthContext = createContext();

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({});
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    checkAppState();
    setupActivityTracker();
  }, []);

  const setupActivityTracker = () => {
    const updateActivity = () => setLastActivity(Date.now());

    // Track user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSession);
  }, [isAuthenticated, lastActivity]);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      // First, try to get user from API
      try {
        const currentUser = await prince.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
        setLastActivity(Date.now());
      } catch (apiError) {
        // If API fails, check for bypass user in localStorage
        const bypassUserStr = localStorage.getItem('user');
        if (bypassUserStr) {
          try {
            const bypassUser = JSON.parse(bypassUserStr);
            setUser(bypassUser);
            setIsAuthenticated(true);
            setLastActivity(Date.now());
          } catch (parseError) {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setLastActivity(0);
    localStorage.removeItem('user'); // Clear bypass user data
    prince.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    prince.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
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
