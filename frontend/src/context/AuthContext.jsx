import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check user session validity on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const profileResult = await authService.getProfile();
          if (profileResult.success) {
            setUser(profileResult.data);
            setIsAuthenticated(true);
          } else {
            handleLogoutState();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          handleLogoutState();
        }
      } else {
        handleLogoutState();
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth-expired event from API interceptor
    const handleAuthExpired = () => {
      handleLogoutState();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const handleLogoutState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        const { token: userToken, user: userDataResult } = response.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userDataResult));
        setToken(userToken);
        setUser(userDataResult);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (err) {
      let message = 'Registration failed.';
      if (err.response?.data?.errors) {
        message = err.response.data.errors.map(e => e.message).join(' ');
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout endpoint call failed, proceeding to clear client session:', err);
    } finally {
      handleLogoutState();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
