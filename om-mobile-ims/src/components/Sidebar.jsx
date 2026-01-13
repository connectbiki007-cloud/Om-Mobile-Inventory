import React from 'react';
import { LayoutDashboard, Smartphone, Wrench, Settings, LogOut, PackageX, ShoppingBag } from 'lucide-react'; 
import { Link, useLocation } from 'react-router-dom';

// 1. Accept isDarkMode prop
const Sidebar = ({ isDarkMode }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Mobile Shop', icon: ShoppingBag, path: '/mobileshop' },
    { name: 'Inventory', icon: Smartphone, path: '/inventory' },
    { name: 'Repairs', icon: Wrench, path: '/repairs' },
    { name: 'Returns', icon: PackageX, path: '/returns' },
    { name: 'Sales Record', icon: Smartphone, path: '/sales' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.reload();
  };

  // --- STYLES ---
  const containerClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDarkMode ? 'text-white' : 'text-brand-600';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  
  // Link Styles
  const activeClass = isDarkMode ? 'bg-gray-700 text-white' : 'bg-brand-50 text-brand-600';
  const inactiveClass = isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50';
  
  // Logout Button Style
  const logoutClass = isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50';

  return (
    <div className={`h-screen w-64 border-r flex flex-col transition-colors duration-300 ${containerClass}`}>
      <div className="p-6">
        <h1 className={`text-2xl font-bold ${textClass}`}>Om Mobile</h1>
        <p className={`text-xs ${subTextClass}`}>Repair & Inventory System</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path ? activeClass : inactiveClass
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          onClick={handleLogout}
          className={`flex items-center space-x-3 px-4 py-3 w-full rounded-lg transition-colors ${logoutClass}`}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;