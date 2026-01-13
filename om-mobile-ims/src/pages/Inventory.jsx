import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Edit, Trash2, AlertCircle, CheckCircle, ArrowUpDown, FileSpreadsheet, AlertTriangle } from 'lucide-react';

const Inventory = ({ isDarkMode }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // NEW: Delete Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // Store ID to delete
  
  const [newItem, setNewItem] = useState({ 
    name: '', 
    category: '', 
    stock: '', 
    cost_price: '', 
    price: '' 
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [sortConfig]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchItems = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      let url = 'http://127.0.0.1:8000/api/items/';
      if (sortConfig.key) {
          const prefix = sortConfig.direction === 'asc' ? '' : '-';
          url += `?ordering=${prefix}${sortConfig.key}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (err) {
      setError("Could not load inventory.");
      setLoading(false);
    }
  };

  const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Item Name", "Category", "Stock", "Cost Price", "Selling Price", "Date Added"];
    const rows = items.map(item => [
        item.id,
        `"${item.name}"`, 
        item.category,
        item.stock,
        item.cost_price,
        item.price,
        new Date(item.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Inventory Database Downloaded! 📂");
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const url = isEditing ? `http://127.0.0.1:8000/api/items/${currentId}/` : 'http://127.0.0.1:8000/api/items/';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          stock: parseInt(newItem.stock),
          cost_price: parseFloat(newItem.cost_price),
          price: parseFloat(newItem.price)
        }),
      });

      if (response.ok) {
        fetchItems();
        closeModal();
        showNotification(isEditing ? "Item Updated Successfully! ✏️" : "New Item Added! 🎉");
      } else {
        alert("Failed to save item.");
      }
    } catch (err) {
      alert("Error saving item.");
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
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/items/${deleteId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchItems();
        showNotification("Item Deleted Successfully! 🗑️");
        setIsDeleteModalOpen(false); // Close Modal
        setDeleteId(null);
      }
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  const openEditModal = (item) => {
    setNewItem({ 
      name: item.name, 
      category: item.category, 
      stock: item.stock, 
      cost_price: item.cost_price || '', 
      price: item.price 
    });
    setCurrentId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setNewItem({ name: '', category: '', stock: '', cost_price: '', price: '' });
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STYLES ---
  const tableHeaderClass = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600';
  const rowClass = isDarkMode ? 'hover:bg-gray-700 border-gray-700 text-gray-300' : 'hover:bg-gray-50 border-gray-100 text-gray-800';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800';

  const editBtnClass = isDarkMode 
    ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300' 
    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800';

  const deleteBtnClass = isDarkMode 
    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
    : 'text-red-600 hover:bg-red-50 hover:text-red-800';

  return (
    <div className={`p-8 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        
      {notification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-50">
            <CheckCircle size={24} /> <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:bg-green-700 p-1 rounded"><X size={16}/></button>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold">Inventory Management</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage stock and prices</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handleExportCSV} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-green-400' : 'border-gray-300 hover:bg-gray-50 text-green-700'}`}
            >
                <FileSpreadsheet size={20} /> Export CSV
            </button>

            <button onClick={() => { setIsEditing(false); setIsModalOpen(true); }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} /> Add New Item
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-lg shadow-sm mb-6 flex gap-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-600 outline-none ${inputClass}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="p-8 text-center opacity-50">Loading inventory...</div>
        ) : (
          <table className="w-full text-left">
            <thead className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${tableHeaderClass}`}>
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-opacity-80" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Item Name <ArrowUpDown size={14}/></div>
                </th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-opacity-80" onClick={() => handleSort('stock')}>
                    <div className="flex items-center gap-1">Stock <ArrowUpDown size={14}/></div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold">Buying Price (Cost)</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-opacity-80" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">Selling Price <ArrowUpDown size={14}/></div>
                </th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredItems.map((item) => (
                <tr key={item.id} className={`transition-colors ${rowClass} ${item.stock < 5 ? (isDarkMode ? 'bg-red-900/20 border-l-4 border-l-red-500' : 'bg-red-50 border-l-4 border-l-red-500') : ''}`}>
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    {item.name}
                    {item.stock < 5 && <AlertCircle size={16} className="text-red-500" />}
                  </td>
                  <td className="px-6 py-4 opacity-70">{item.category}</td>
                  <td className={`px-6 py-4 font-bold ${item.stock < 5 ? 'text-red-500' : ''}`}>
                    {item.stock}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono opacity-70">
                      Rs. {item.cost_price}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600">Rs. {item.price}</td>
                  <td className="px-6 py-4 flex gap-3">
                    
                    {/* EDIT BUTTON */}
                    <button 
                        onClick={() => openEditModal(item)} 
                        className={`p-2 rounded-full transition-colors duration-200 ${editBtnClass}`}
                        title="Edit Item"
                    >
                        <Edit size={18} />
                    </button>

                    {/* DELETE BUTTON (OPENS MODAL) */}
                    <button 
                        onClick={() => openDeleteModal(item.id)} 
                        className={`p-2 rounded-full transition-colors duration-200 ${deleteBtnClass}`}
                        title="Delete Item"
                    >
                        <Trash2 size={18} />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={closeModal}><X size={24} className="opacity-50 hover:opacity-100" /></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <input required type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} />
              
              <select className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
                <option value="">Select Category</option>
                <option value="Display">Display</option>
                <option value="Battery">Battery</option>
                <option value="Charger">Charger</option>
                <option value="Glass">Glass</option>
                <option value="Accessories">Accessories</option>
                <option value="Android">Android</option>
                <option value="Keypad">Keypad</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold uppercase opacity-50 mb-1 block">Stock</label>
                    <input required type="number" placeholder="Qty" value={newItem.stock} onChange={(e) => setNewItem({...newItem, stock: e.target.value})} className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase opacity-50 mb-1 block">Selling Price</label>
                    <input required type="number" placeholder="Rs." value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} />
                </div>
              </div>

              <div>
                  <label className="text-xs font-bold uppercase opacity-50 mb-1 block">Buying Price (Cost)</label>
                  <input type="number" placeholder="Cost per unit" value={newItem.cost_price} onChange={(e) => setNewItem({...newItem, cost_price: e.target.value})} className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-gray-800'}`} />
                  <p className="text-[10px] opacity-60 mt-1">Used to calculate your Net Profit.</p>
              </div>

              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg mt-4">
                {isEditing ? 'Update Item' : 'Save Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className={`rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center animate-bounce-in ${cardClass}`}>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete Inventory Item?</h3>
                <p className="opacity-70 mb-6 text-sm">
                    This action cannot be undone. Are you sure you want to permanently delete this item from stock?
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

export default Inventory;