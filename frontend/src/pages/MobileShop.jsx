import React, { useState, useEffect } from 'react';
import { Plus, Search, Smartphone, Phone, AlertCircle, CheckCircle, X } from 'lucide-react';

const MobileShop = ({ isDarkMode }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // New Item Form State (Added Cost Price)
  const [newItem, setNewItem] = useState({ 
    name: '', 
    category: 'Android', 
    stock: '', 
    cost_price: '', // New field
    price: '' 
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(null);
    }, 3000);
  };

  const fetchItems = async () => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch('http://127.0.0.1:8000/api/items/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setItems(data);
        }
    } catch (err) {
        console.error("Error fetching items:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/items/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                name: newItem.name,
                category: newItem.category, 
                stock: parseInt(newItem.stock),
                cost_price: parseFloat(newItem.cost_price), // Save Cost Price
                price: parseFloat(newItem.price)
            }),
        });

        if (response.ok) {
            fetchItems(); 
            setIsModalOpen(false);
            setNewItem({ name: '', category: 'Android', stock: '', cost_price: '', price: '' });
            showNotification("Phone Added Successfully! 📱");
        } else {
            const errorData = await response.json();
            alert("Failed to save: " + JSON.stringify(errorData));
        }
    } catch (err) {
        alert("Network Error: Could not connect to server.");
    }
  };

  const phoneItems = items.filter(item => 
      item.category.toLowerCase() === 'android' || 
      item.category.toLowerCase() === 'keypad'
  );

  // --- STYLES ---
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800';

  return (
    <div className={`p-8 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-50">
            <CheckCircle size={24} /> <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:bg-green-700 p-1 rounded"><X size={16}/></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold">Mobile Shop Stock</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage Android & Keypad Devices</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Add New Phone
        </button>
      </div>

      {/* Grid */}
      {loading ? (
          <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phoneItems.map((phone) => (
            <div key={phone.id} className={`p-6 rounded-xl shadow-sm border relative overflow-hidden ${cardClass}`}>
                <div className="absolute -right-4 -top-4 text-gray-100 opacity-10">
                    {phone.category.toLowerCase() === 'android' ? <Smartphone size={100} /> : <Phone size={100} />}
                </div>

                <div className="relative z-10">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${phone.category.toLowerCase() === 'android' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {phone.category}
                    </span>
                    <h3 className="text-xl font-bold mt-2">{phone.name}</h3>
                    <div className="mt-4 flex justify-between items-end">
                        <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</p>
                            <p className="text-lg font-bold">{phone.stock} units</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
                            <p className="text-xl font-bold text-brand-600">Rs. {phone.price}</p>
                        </div>
                    </div>
                    {/* Only show cost price in a tooltip or small text if needed, usually hidden from plain view */}
                    <div className="mt-2 text-xs opacity-50">Cost: Rs. {phone.cost_price}</div>
                </div>
            </div>
            ))}
            
            {phoneItems.length === 0 && (
                <div className={`col-span-full text-center py-10 rounded-xl border border-dashed flex flex-col items-center ${isDarkMode ? 'border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-400'}`}>
                    <AlertCircle size={48} className="mb-2 opacity-50"/>
                    <p>No phones found.</p>
                </div>
            )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">Add New Phone</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">Phone Model Name</label>
                <input required type="text" placeholder="e.g. Samsung Galaxy A14" className={`w-full p-2 border rounded-lg ${inputClass}`} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">Phone Type</label>
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" 
                        onClick={() => setNewItem({...newItem, category: 'Android'})}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${newItem.category === 'Android' ? 'bg-green-50 border-green-500 text-green-700' : (isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50')}`}
                    >
                        <Smartphone /> Android
                    </button>
                    <button type="button" 
                        onClick={() => setNewItem({...newItem, category: 'Keypad'})}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${newItem.category === 'Keypad' ? 'bg-blue-50 border-blue-500 text-blue-700' : (isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50')}`}
                    >
                        <Phone /> Keypad
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase font-bold opacity-50 mb-1">Stock</label>
                    <input required type="number" placeholder="Qty" className={`w-full p-2 border rounded-lg ${inputClass}`} value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs uppercase font-bold opacity-50 mb-1">Selling Price</label>
                    <input required type="number" placeholder="Rs" className={`w-full p-2 border rounded-lg ${inputClass}`} value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                </div>
              </div>

              <div>
                  <label className="block text-xs uppercase font-bold opacity-50 mb-1">Buying Price (Cost)</label>
                  <input required type="number" placeholder="Rs" className={`w-full p-2 border rounded-lg ${inputClass} ${isDarkMode ? 'border-yellow-600 text-yellow-400' : 'border-yellow-200 bg-yellow-50'}`} value={newItem.cost_price} onChange={e => setNewItem({...newItem, cost_price: e.target.value})} />
                  <p className="text-[10px] opacity-60 mt-1">Used to calculate profit per sale.</p>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save Phone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileShop;