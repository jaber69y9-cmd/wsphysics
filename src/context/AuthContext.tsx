import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'moderator';
  roll_number?: string;
  batch_id?: number;
  program_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Fetch user role and details from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Check if student is approved, but bypass for admin email
            if (userData.role === 'student' && (userData as any).status !== 'approved' && (userData as any).status !== 'active' && firebaseUser.email !== 'wsphysics@gmail.com' && firebaseUser.email !== 'abudardmd@gmail.com') {
              throw new Error('Student not approved by admin');
            }
            setUser({ ...userData, id: firebaseUser.uid, email: firebaseUser.email || '' });
            setToken(token);
          } else {
            // Admin bypass or fallback if document doesn't exist yet
            if (firebaseUser.email === 'wsphysics@gmail.com' || firebaseUser.email === 'abudardmd@gmail.com') {
              const adminUser: User = {
                id: firebaseUser.uid,
                name: 'Admin',
                email: firebaseUser.email,
                role: 'admin'
              };
              setUser(adminUser);
              setToken(token);
            } else {
              setUser(null);
              setToken(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!user && !!token, 
      loading 
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
