import React, { useState, useEffect } from 'react';
import { Lock, User, CheckCircle, X, Smartphone, Wrench, Cpu, Battery, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config'; // <--- Ensure this is imported

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('omMobileTheme');
    if (savedTheme === 'dark') {
        setIsDarkMode(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    
    try {
      // ✅ FIXED: Used backticks (`) instead of single quotes (')
      const response = await fetch(`${API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.access);
        setNotification("Login Successful! Welcome back. 👋");
        setTimeout(() => {
            setToken(data.access);
        }, 1500);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Server connection failed. Is Django running?');
    }
  };

  // --- STYLES ---
  const cardClass = isDarkMode 
    ? 'bg-gray-800/90 border-gray-700 text-white shadow-2xl backdrop-blur-md' 
    : 'bg-white/90 border-gray-200 text-gray-800 shadow-2xl backdrop-blur-md';
    
  const inputClass = isDarkMode 
    ? 'bg-gray-900/50 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-brand-600 focus:border-brand-600';

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      
      {/* --- CUSTOM CSS FOR ANIMATION --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-reverse 8s ease-in-out infinite; }
        .animate-float-fast { animation: float 5s ease-in-out infinite; }
        
        /* Tech Grid Background */
        .tech-grid {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px);
        }
      `}</style>

      {/* --- BACKGROUND ANIMATION LAYER --- */}
      <div className="absolute inset-0 tech-grid pointer-events-none"></div>
      
      {/* Floating Repair Icons */}
      <div className={`absolute top-20 left-20 opacity-10 animate-float ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        <Smartphone size={120} />
      </div>
      <div className={`absolute bottom-20 right-20 opacity-10 animate-float-slow ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
        <Cpu size={140} />
      </div>
      <div className={`absolute top-40 right-40 opacity-10 animate-float-fast ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
        <Wrench size={100} />
      </div>
      <div className={`absolute bottom-40 left-40 opacity-10 animate-float ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
        <Battery size={90} />
      </div>
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <Zap size={400} />
      </div>

      {/* --- NOTIFICATION --- */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-50">
            <CheckCircle size={24} />
            <div>
                <h4 className="font-bold text-sm">Success</h4>
                <p className="text-xs">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-2 hover:bg-green-700 p-1 rounded">
                <X size={16}/>
            </button>
        </div>
      )}

      {/* --- LOGIN CARD --- */}
      <div className={`p-8 rounded-2xl w-full max-w-md border relative z-10 ${cardClass}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center p-3 rounded-full mb-3 ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-brand-600'}`}>
                <Wrench size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Om Mobile</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Repair Center Management System</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                <X size={16} /> {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username</label>
            <div className="relative group">
              <User className={`absolute left-3 top-2.5 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-brand-600'}`} size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-all ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Password</label>
            <div className="relative group">
              <Lock className={`absolute left-3 top-2.5 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-brand-600'}`} size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-all ${inputClass}`}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/30"
          >
            Access Dashboard
          </button>
        </form>

        <div className={`mt-6 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            &copy; 2026 Om Mobile Center. Secure Login.
        </div>
      </div>
    </div>
  );
};

export default Login;