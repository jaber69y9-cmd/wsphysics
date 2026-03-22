import { showAlert } from '../utils/alert';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { LogIn, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'moderator') {
        navigate('/moderator');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData: any = null;
      
      if (userDoc.exists()) {
        userData = { ...userDoc.data(), id: firebaseUser.uid, email: firebaseUser.email };
        
        // Check if student is approved
        if (userData.role === 'student' && userData.status !== 'approved') {
          await auth.signOut();
          throw new Error('Your account is pending approval from the administrator.');
        }
      } else if (firebaseUser.email === 'wsphysics@gmail.com' || firebaseUser.email === 'abudardmd@gmail.com') {
        // Admin fallback if document doesn't exist yet
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Admin',
          email: firebaseUser.email,
          role: 'admin'
        };
        // Create the admin user document
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        await auth.signOut();
        // Throw an error if the user is not added by the admin
        throw new Error('User profile not found. Please contact admin to create your account.');
      }

      login(token, userData);
      
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'moderator') {
        navigate('/moderator');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Google Login error:", err);
      setError(err.message || 'Google Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData: any = null;
      
      if (userDoc.exists()) {
        userData = { ...userDoc.data(), id: firebaseUser.uid, email: firebaseUser.email };
        
        // Check if student is approved
        if (userData.role === 'student' && userData.status !== 'approved') {
          await auth.signOut();
          throw new Error('Your account is pending approval from the administrator.');
        }
      } else if (firebaseUser.email === 'wsphysics@gmail.com' || firebaseUser.email === 'abudardmd@gmail.com') {
        // Admin fallback if document doesn't exist yet
        userData = {
          id: firebaseUser.uid,
          name: 'Admin',
          email: firebaseUser.email,
          role: 'admin'
        };
      } else {
        await auth.signOut();
        throw new Error('User profile not found. Please contact admin.');
      }

      login(token, userData);
      
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'moderator') {
        navigate('/moderator');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Format Firebase error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please use Google Sign-In or contact the administrator.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-slate-50 to-white relative overflow-hidden">
      {/* Physics-themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-orange-200/40"
        >
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2v20M2 12h20"/>
          </svg>
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[15%] text-orange-300/30"
        >
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </motion.div>

        <div className="absolute top-[40%] right-[5%] w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] shadow-2xl shadow-orange-600/10 border border-white/50">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg shadow-orange-500/30 mb-6"
            >
              <img 
                src="https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj" 
                alt="W'S Physics Logo" 
                className="h-12 w-12 rounded-2xl object-cover brightness-110"
              />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 mt-2 font-medium">Log in to your W'S Physics student portal</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-600 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <button 
                  type="button" 
                  onClick={async () => {
                    if (!identifier) {
                      setError('Please enter your email address to reset password');
                      return;
                    }
                    try {
                      const { sendPasswordResetEmail } = await import('firebase/auth');
                      const { auth } = await import('../firebase');
                      await sendPasswordResetEmail(auth, identifier);
                      showAlert('Password reset email sent! Please check your inbox.');
                    } catch (err: any) {
                      setError(err.message || 'Failed to send password reset email');
                    }
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-4 rounded-2xl text-lg font-black shadow-xl shadow-orange-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50/30 text-slate-700 py-4 rounded-2xl text-base font-bold shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Account
          </button>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Don't have an account? <span className="text-orange-600 font-bold cursor-pointer hover:underline">Contact Admin</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
