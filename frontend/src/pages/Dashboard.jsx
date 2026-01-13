import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wrench, 
  AlertCircle, 
  BarChart2, 
  X, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Plus, 
  RefreshCw,
  Smartphone, 
  SignalIcon,
  Asterisk,
  Coins,
  Banknote
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Dashboard = ({ isDarkMode }) => {
  const [stats, setStats] = useState({
    total_sales: 0,
    inventory_value: 0,
    active_repairs: 0,
    low_stock_count: 0,
    net_profit: 0,
    chart_data: [],
    recent_repairs: [],
    low_stock_items: []
  });

  const [activeMetric, setActiveMetric] = useState('sales'); 
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);

        // Show alert if low stock found (Logic <= 2 handled in backend)
        if (data.low_stock_count > 0) {
            setShowLowStockModal(true);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setLoading(false);
    }
  };

  // --- STYLES ---
  const cardBase = `p-6 rounded-xl shadow-sm border cursor-pointer transition-all hover:scale-105 ${
    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'
  }`;
  
  const activeBorder = isDarkMode ? "ring-2 ring-blue-500 border-transparent" : "ring-2 ring-brand-600 border-transparent";
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`p-8 space-y-8 relative min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* --- HEADER & QUICK ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold">Store Performance</h2>
            <p className={`text-sm ${subText}`}>Overview of your business today</p>
        </div>
        
        {/* Quick Actions Bar */}
        <div className="flex gap-3">
            <Link to="/sales" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium">
                <Plus size={16} /> New Sale
            </Link>
            <Link to="/repairs" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium">
                <Wrench size={16} /> Add Repair
            </Link>
            <button onClick={fetchDashboardData} className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                <RefreshCw size={20} />
            </button>
        </div>
      </div>

      {loading ? (
          <div className="text-center py-20 opacity-50 flex flex-col items-center">
              <RefreshCw size={40} className="animate-spin mb-4 text-brand-600" />
              <p>Loading analytics...</p>
          </div>
      ) : (
        <>
          {/* --- TOP CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* 1. Total Sales */}
            <div onClick={() => setActiveMetric('sales')} className={`${cardBase} ${activeMetric === 'sales' ? activeBorder : ''}`}>
              <div className="flex justify-between">
                <div>
                  <p className={`text-sm font-medium ${subText}`}>Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">Rs. {stats.total_sales.toLocaleString()}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><TrendingUp size={24} /></div>
              </div>
            </div>

            {/* 2. Inventory Value */}
            <div onClick={() => setActiveMetric('inventory')} className={`${cardBase} ${activeMetric === 'inventory' ? activeBorder : ''}`}>
              <div className="flex justify-between">
                <div>
                  <p className={`text-sm font-medium ${subText}`}>Inventory Asset</p>
                  <h3 className="text-2xl font-bold mt-1">Rs. {stats.inventory_value.toLocaleString()}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Coins size={24} /></div>
              </div>
            </div>

            {/* 3. Active Repairs */}
            <div onClick={() => setActiveMetric('repairs')} className={`${cardBase} ${activeMetric === 'repairs' ? activeBorder : ''}`}>
              <div className="flex justify-between">
                <div>
                  <p className={`text-sm font-medium ${subText}`}>Active Repairs</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.active_repairs}</h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><Wrench size={24} /></div>
              </div>
            </div>

            {/* 4. Net Profit */}
            <div onClick={() => setActiveMetric('profit')} className={`${cardBase} ${activeMetric === 'profit' ? activeBorder : ''}`}>
                <div className="flex justify-between">
                    <div>
                        <p className={`text-sm font-medium ${subText}`}>Net Profit</p>
                        <h3 className="text-2xl font-bold text-green-500 mt-1">Rs. {stats.net_profit.toLocaleString()}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-green-600"><BarChart2 size={24} /></div>
                </div>
            </div>
          </div>

          {/* --- MAIN CONTENT GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Bar Chart */}
            <div className={`lg:col-span-2 p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className="text-lg font-bold mb-6">Top Selling Items (Revenue)</h3>
              
              <div className="h-80 w-full">
                {stats.chart_data && stats.chart_data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chart_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                        <XAxis dataKey="item__name" stroke={isDarkMode ? '#9ca3af' : '#4b5563'} tick={{fontSize: 12}} />
                        <YAxis stroke={isDarkMode ? '#9ca3af' : '#4b5563'} tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: isDarkMode ? '#1f2937' : '#fff', 
                                borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                                color: isDarkMode ? '#fff' : '#000',
                                borderRadius: '8px'
                            }} 
                            formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {stats.chart_data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#4f46e5" : "#818cf8"} />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <BarChart2 size={48} className="opacity-20 mb-2"/>
                        <p>No sales data available yet.</p>
                    </div>
                )}
              </div>
            </div>

            {/* RIGHT: Quick Lists */}
            <div className="space-y-6">
                
                {/* Low Stock Alert Box */}
                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                            <AlertCircle size={20}/> Low Stock
                        </h3>
                        {stats.low_stock_count > 0 && (
                            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                {stats.low_stock_count} Items
                            </span>
                        )}
                    </div>
                    <div className="space-y-3">
                        {stats.low_stock_items && stats.low_stock_items.length > 0 ? (
                            stats.low_stock_items.map((item, index) => (
                                <div key={index} className={`flex justify-between items-center p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-red-50 border border-red-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <Package size={14} className="opacity-50"/>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-red-500">{item.stock} Left</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <AlertCircle size={30} className="text-green-500 mx-auto mb-2 opacity-80"/>
                                <p className="text-sm text-green-500">All stock levels healthy!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Repairs */}
                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Recent Repairs</h3>
                        <Link to="/repairs" className="text-xs text-brand-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recent_repairs && stats.recent_repairs.length > 0 ? (
                            stats.recent_repairs.map(t => (
                                <div key={t.id} className={`flex justify-between items-center p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                            <Smartphone size={16} className="opacity-50"/>
                                        </div>
                                        <div>
                                            <p className="font-medium">{t.customer_name}</p>
                                            <p className={`text-[10px] ${subText}`}>{t.device_model}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {t.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className={`text-sm text-center py-4 ${subText}`}>No recent repairs.</p>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* --- LOW STOCK POP-UP MODAL --- */}
          {showLowStockModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[99] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className={`rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-bounce-in ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                    <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AlertTriangle className="text-yellow-300" />
                            Critical Stock Alert
                        </h3>
                        <button onClick={() => setShowLowStockModal(false)} className="hover:bg-red-700 p-1 rounded transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            You have <strong>{stats.low_stock_count} items</strong> with stock <strong>2 or less</strong>. Immediate restocking recommended.
                        </p>

                        <div className={`rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-red-50 border border-red-100'}`}>
                            {stats.low_stock_items.map((item, index) => (
                                <div key={index} className={`flex justify-between text-sm pb-2 ${isDarkMode ? 'border-b border-gray-600 last:border-0' : 'border-b border-red-200 last:border-0'}`}>
                                    <span className="font-medium">{item.name}</span>
                                    <span className="font-bold text-red-600">{item.stock} Left</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLowStockModal(false)}
                                className={`flex-1 py-2.5 border rounded-lg font-medium hover:opacity-80 transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                            >
                                Dismiss
                            </button>
                            <Link 
                                to="/inventory" 
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-center font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:scale-105"
                            >
                                Go to Inventory
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;