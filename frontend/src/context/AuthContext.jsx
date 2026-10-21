import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      if (!localStorage.getItem('token')) {
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      try {
        const data = await api.getSession();
        if (active) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        if (active) setLoading(false);
      }
    };
    restoreSession();
    return () => { active = false; };
  }, []);

  const login = async (credentials) => {
    try {
      const data = await api.login(credentials);
      // Assuming backend returns { user, token } or similar
      // Adjust based on actual API response
      const userData = data.user || data.data?.user || data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const data = await api.signup(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const forgotPassword = async (email) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (userId, resetData) => {
    return await api.resetPassword(userId, resetData);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
