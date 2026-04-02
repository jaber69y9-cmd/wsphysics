import { showAlert } from '../utils/alert';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';
import { LogIn, User, Lock, Eye, EyeOff, Loader2, ArrowRight, Star } from 'lucide-react';
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
  const { settings } = useSettings();
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
    try {
      // Initialize provider and call popup IMMEDIATELY to preserve user gesture
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Set loading state AFTER the popup is successfully opened/completed
      setError('');
      setIsLoading(true);
      
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData: any = null;
      
      if (userDoc.exists()) {
        userData = { ...userDoc.data(), id: firebaseUser.uid, email: firebaseUser.email };
        
        // Check if student is approved
        if (userData.role === 'student' && userData.status !== 'approved' && userData.status !== 'active') {
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
      // If the popup was blocked, provide a helpful message
      if (err.code === 'auth/popup-blocked') {
        setError('Login popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Login failed');
      }
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
      const userCredential = await signInWithEmailAndPassword(auth, identifier.trim(), password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData: any = null;
      
      if (userDoc.exists()) {
        userData = { ...userDoc.data(), id: firebaseUser.uid, email: firebaseUser.email };
        
        // Check if student is approved
        if (userData.role === 'student' && userData.status !== 'approved' && userData.status !== 'active') {
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
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      
      if (errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/invalid-credential' || 
          errorCode === 'auth/invalid-login-credentials' ||
          errorMessage.includes('invalid-credential')) {
        
        setError('Invalid email or password. Please check your credentials.');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Invalid email format. Please enter a valid email address.');
      } else if (errorCode === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please use Google Sign-In or contact the administrator.');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-slate-50 to-white relative overflow-hidden">
      {/* Physics-themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="newton-glow top-0 right-0 w-[500px] h-[500px]" />
        <div className="newton-glow bottom-0 left-0 w-[600px] h-[600px]" />
        
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

        {/* Newton's Apple Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ 
                y: ['0vh', '110vh'],
                opacity: [0, 0.2, 0.2, 0],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear"
              }}
              className="absolute text-orange-500/20"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C10.5 2 9.5 3 9.5 3C9.5 3 8.5 2 7 2C4.5 2 2.5 4 2.5 6.5C2.5 9.5 5.5 12.5 12 19C18.5 12.5 21.5 9.5 21.5 6.5C21.5 4 19.5 2 17 2C15.5 2 14.5 3 14.5 3C14.5 3 13.5 2 12 2Z" />
              </svg>
            </motion.div>
          ))}
        </div>

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
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="glass-form">
          {/* Decorative background elements inside the form */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/10 blur-3xl rounded-full -ml-20 -mb-20" />
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg shadow-orange-500/30 mb-6"
              >
                <img 
                  src={settings.logo_url || "https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"} 
                  alt={`${settings.site_name || "W'S Physics"} Logo`} 
                  className="h-12 w-12 rounded-2xl object-cover brightness-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                  }}
                />
              </motion.div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Login</h1>
              <p className="text-slate-500 mt-2 font-medium">Enter your credentials to continue</p>
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
                      className="glass-input pl-12"
                      placeholder="Enter your email address"
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
                        const email = identifier.trim();
                        if (!email) {
                          setError('Please enter your email address to reset password');
                          return;
                        }
                        try {
                          const { sendPasswordResetEmail } = await import('firebase/auth');
                          const { auth } = await import('../firebase');
                          await sendPasswordResetEmail(auth, email);
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
                      className="glass-input pl-12 pr-12"
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="glass-btn w-full mt-4"
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
                </motion.button>
              </form>

              <div className="relative flex items-center py-8">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white/60 backdrop-blur-md border border-white/80 hover:border-orange-200 hover:bg-orange-50/30 text-slate-700 py-4 rounded-2xl text-base font-bold shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google Account
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
};

export default Login;
