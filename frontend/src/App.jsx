import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Repairs from './pages/Repairs';
import Settings from './pages/Settings';
import Login from './pages/Login'; 
import Returns from './pages/Returns';
import Sales from './pages/Sales';
import MobileShop from './pages/MobileShop';

function App() {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  
  // --- 1. GLOBAL THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- 2. LOAD SAVED THEME ON STARTUP ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('omMobileTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // --- 3. APPLY THEME TO BODY (Global Background) ---
  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = '#111827'; // Dark Gray
      document.body.style.color = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#f3f4f6'; // Light Gray
      document.body.style.color = '#1f2937';
    }
  }, [isDarkMode]);

  // --- 4. TOGGLE FUNCTION (Passed to Settings Page) ---
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('omMobileTheme', newMode ? 'dark' : 'light');
  };

  // IF NO TOKEN: Show Login Screen
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // IF TOKEN EXISTS: Show Full App
  return (
    <Router>
      <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        
        {/* Pass isDarkMode to Sidebar so it turns dark too */}
        <Sidebar isDarkMode={isDarkMode} />
        
        <div className="flex-1 overflow-y-auto">
          <Routes>
            {/* Pass isDarkMode to all pages so they can style their cards */}
            <Route path="/" element={<Dashboard isDarkMode={isDarkMode} />} />
            <Route path="/mobileshop" element={<MobileShop isDarkMode={isDarkMode} />} />
            <Route path="/inventory" element={<Inventory isDarkMode={isDarkMode} />} />
            <Route path="/repairs" element={<Repairs isDarkMode={isDarkMode} />} />
            <Route path="/returns" element={<Returns isDarkMode={isDarkMode} />} />
            <Route path="/sales" element={<Sales isDarkMode={isDarkMode} />} />
            
            {/* Pass toggleTheme to Settings so the button works */}
            <Route path="/settings" element={<Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;