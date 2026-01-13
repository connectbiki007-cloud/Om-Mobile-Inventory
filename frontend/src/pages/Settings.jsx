import React, { useState, useEffect } from 'react';
import { Save, Store, User, Phone, MapPin, Bell, Shield, Moon, Sun } from 'lucide-react';

// 1. Accept global props from App.jsx
const Settings = ({ isDarkMode, toggleTheme }) => {
  
  // 2. Form State (Local)
  const [formData, setFormData] = useState({
    shopName: 'Om Mobile Repairing Center',
    ownerName: 'Your Name',
    contact: '9800000000',
    address: 'Kathmandu, Nepal',
    notifications: true
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // 3. Load saved Form Data on startup
  useEffect(() => {
    const savedSettings = localStorage.getItem('omMobileSettings');
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings));
    }
  }, []);

  // 4. Handle Form Save
  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('omMobileSettings', JSON.stringify(formData));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // --- STYLES (Based on Global isDarkMode) ---
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-brand-600';
  const labelClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`p-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>

      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 animate-bounce">
          <Shield size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: General Form --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-xl shadow-sm border ${cardClass}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Store size={20} className="text-brand-600" />
              Store Information
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Shop Name</label>
                  <input 
                    type="text" 
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Owner Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Contact Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${inputClass}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Preferences --- */}
        <div className="space-y-6">
          
          <div className={`p-6 rounded-xl shadow-sm border ${cardClass}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell size={20} className="text-brand-600" />
              Preferences
            </h3>
            
            {/* Email Notification Toggle */}
            <div className={`flex items-center justify-between py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className={`text-xs ${labelClass}`}>Receive daily stock reports</p>
              </div>
              <button 
                onClick={() => setFormData({...formData, notifications: !formData.notifications})}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.notifications ? 'bg-brand-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.notifications ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* --- THEME TOGGLE (Uses Global Function) --- */}
            <div className="flex items-center justify-between py-3 mt-2">
              <div>
                <p className="font-medium">App Theme</p>
                <p className={`text-xs ${labelClass}`}>Switch between Light & Dark mode</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-yellow-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
              >
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm font-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-bold text-blue-800 mb-1">Pro Tip</h4>
              <p className="text-xs text-blue-600">
                You can back up your inventory database by going to the backend admin panel at localhost:8000/admin.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;