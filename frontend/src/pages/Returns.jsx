import React, { useState, useEffect } from 'react';
import { PackageX, Plus, X, Edit, Trash2, CheckCircle, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { API_BASE_URL } from '../config'; // <--- Ensure this is imported

const Returns = ({ isDarkMode }) => {
  const [damagedItems, setDamagedItems] = useState([]);
  const [items, setItems] = useState([]); 
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'reported_at', direction: 'desc' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // NEW: Delete Modal State
  const [currentReportId, setCurrentReportId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // Store ID to delete

  // Notification State
  const [notification, setNotification] = useState(null);

  // Form State
  const [newReport, setNewReport] = useState({ item: '', quantity: 1, reason: '' });

  useEffect(() => {
    fetchDamagedItems();
    fetchInventory();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(null);
    }, 3000);
  };

  const fetchDamagedItems = async () => {
    const token = localStorage.getItem('accessToken');
    // ✅ FIXED: Used API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/api/damaged/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) setDamagedItems(await res.json());
  };

  const fetchInventory = async () => {
    const token = localStorage.getItem('accessToken');
    // ✅ FIXED: Used API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/api/items/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) setItems(await res.json());
  };

  // --- SORTING LOGIC ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...damagedItems].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // --- HELPER: Group Items by Category ---
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // --- SAVE REPORT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    // ✅ FIXED: Used API_BASE_URL
    const url = isEditing 
        ? `${API_BASE_URL}/api/damaged/${currentReportId}/` 
        : `${API_BASE_URL}/api/damaged/`;
        
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newReport)
    });
    
    if (res.ok) {
        fetchDamagedItems();
        closeModal();
        showNotification(isEditing ? "Report Updated! ✏️" : "Damage Reported! 📉");
    } else {
        alert("Error saving report.");
    }
  };

  // --- NEW: OPEN DELETE MODAL ---
  const openDeleteModal = (id) => {
      setDeleteId(id);
      setIsDeleteModalOpen(true);
  };

  // --- NEW: CONFIRM DELETE ---
  const confirmDelete = async () => {
      if (!deleteId) return;
      
      const token = localStorage.getItem('accessToken');
      // ✅ FIXED: Used API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/damaged/${deleteId}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
          fetchDamagedItems();
          showNotification("Report Deleted! 🗑️");
          setIsDeleteModalOpen(false); // Close modal
          setDeleteId(null);
      }
  };

  const openEditModal = (report) => {
      setNewReport({
          item: report.item,
          quantity: report.quantity,
          reason: report.reason
      });
      setCurrentReportId(report.id);
      setIsEditing(true);
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setIsEditing(false);
      setNewReport({ item: '', quantity: 1, reason: '' });
  };

  // --- STYLES ---
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800';
  const headerClass = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600';

  const editBtnClass = isDarkMode 
    ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300' 
    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800';

  const deleteBtnClass = isDarkMode 
    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
    : 'text-red-600 hover:bg-red-50 hover:text-red-800';

  return (
    <div className={`p-8 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* --- NOTIFICATION --- */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-50">
            <CheckCircle size={24} />
            <div>
                <h4 className="font-bold text-sm">Success</h4>
                <p className="text-xs">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-2 hover:bg-green-700 p-1 rounded"><X size={16}/></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold">Damaged / Returned Items</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track broken inventory and returns</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <AlertTriangle size={20} /> Report Damage
        </button>
      </div>

      <div className={`rounded-lg shadow-sm overflow-hidden ${cardClass}`}>
        <table className="w-full text-left">
            <thead className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} ${headerClass}`}>
                <tr>
                    <th 
                        className="px-6 py-4 text-sm font-semibold cursor-pointer hover:bg-opacity-80"
                        onClick={() => handleSort('item_name')}
                    >
                        <div className="flex items-center gap-1">Item Name <ArrowUpDown size={14}/></div>
                    </th>
                    <th 
                        className="px-6 py-4 text-sm font-semibold cursor-pointer hover:bg-opacity-80"
                        onClick={() => handleSort('quantity')}
                    >
                        <div className="flex items-center gap-1">Qty Lost <ArrowUpDown size={14}/></div>
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">Reason</th>
                    <th 
                        className="px-6 py-4 text-sm font-semibold cursor-pointer hover:bg-opacity-80"
                        onClick={() => handleSort('reported_at')}
                    >
                        <div className="flex items-center gap-1">Date Reported <ArrowUpDown size={14}/></div>
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {sortedItems.map(d => (
                    <tr key={d.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 font-medium">{d.item_name}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded font-bold ${isDarkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                -{d.quantity}
                            </span>
                        </td>
                        <td className={`px-6 py-4 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>"{d.reason}"</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(d.reported_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 flex gap-3">
                            <button 
                                onClick={() => openEditModal(d)} 
                                className={`p-2 rounded-full transition-colors ${editBtnClass}`}
                                title="Edit"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => openDeleteModal(d.id)} 
                                className={`p-2 rounded-full transition-colors ${deleteBtnClass}`}
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
                {sortedItems.length === 0 && (
                    <tr>
                        <td colSpan="5" className={`text-center py-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <div className="flex flex-col items-center gap-2">
                                <PackageX size={40} className="opacity-50" />
                                <p>No damage reports found.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`p-6 rounded-xl w-full max-w-md shadow-2xl animate-bounce-in ${cardClass}`}>
                <div className={`flex justify-between mb-6 border-b pb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className="text-xl font-bold">
                        {isEditing ? 'Edit Damage Report' : 'Report Damaged Item'}
                    </h3>
                    <button onClick={closeModal} className="opacity-50 hover:opacity-100"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* --- CATEGORIZED DROPDOWN --- */}
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Select Item</label>
                        <select 
                            required 
                            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${inputClass}`} 
                            value={newReport.item} 
                            onChange={e => setNewReport({...newReport, item: e.target.value})}
                        >
                            <option value="">-- Choose Item --</option>
                            
                            {/* Map grouped items */}
                            {Object.keys(groupedItems).map(category => (
                                <optgroup key={category} label={category}>
                                    {groupedItems[category].map(i => (
                                        <option key={i.id} value={i.id}>
                                            {i.name} (Stock: {i.stock})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Quantity Damaged</label>
                        <input required type="number" min="1" placeholder="1" className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${inputClass}`} value={newReport.quantity} onChange={e => setNewReport({...newReport, quantity: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Reason</label>
                        <textarea required placeholder="e.g. Screen cracked during delivery..." rows="3" className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${inputClass}`} value={newReport.reason} onChange={e => setNewReport({...newReport, reason: e.target.value})} />
                    </div>

                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition-colors mt-4 shadow-lg">
                        {isEditing ? 'Update Report' : 'Submit Damage Report'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL (CUSTOM CSS) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className={`rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center animate-bounce-in ${cardClass}`}>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete Report?</h3>
                <p className="opacity-70 mb-6 text-sm">
                    This action cannot be undone. Are you sure you want to permanently delete this damage record?
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)} 
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete} 
                        className="flex-1 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Returns;