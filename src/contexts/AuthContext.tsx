import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User, College } from '../types';
import { db } from '../utils/database';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: 'admin' | 'student') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    college: null,
    isAuthenticated: false
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('eventManagementAuth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.user && parsed.college) {
          setAuthState({
            user: parsed.user,
            college: parsed.college,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('eventManagementAuth');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would validate against backend
    const user = db.getUserByEmail(email);
    
    if (!user) {
      return false;
    }

    const college = db.getCollegeById(user.collegeId);
    if (!college) {
      return false;
    }

    const newAuthState = {
      user,
      college,
      isAuthenticated: true
    };

    setAuthState(newAuthState);
    
    // Save to localStorage
    localStorage.setItem('eventManagementAuth', JSON.stringify(newAuthState));
    
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      college: null,
      isAuthenticated: false
    });
    localStorage.removeItem('eventManagementAuth');
  };

  const switchRole = (newRole: 'admin' | 'student') => {
    if (!authState.user || !authState.college) return;

    // Create a mock user with the new role for demonstration
    const newUser: User = {
      ...authState.user,
      role: newRole,
      id: newRole === 'admin' ? 'admin-demo' : 'student-demo'
    };

    const newAuthState = {
      ...authState,
      user: newUser
    };

    setAuthState(newAuthState);
    localStorage.setItem('eventManagementAuth', JSON.stringify(newAuthState));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};