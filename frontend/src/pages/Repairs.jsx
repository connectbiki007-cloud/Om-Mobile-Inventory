import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config'; // <--- Ensure this is imported

const Repairs = ({ isDarkMode }) => {
  const [tickets, setTickets] = useState([]);
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false); // For Add/Edit
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // For Delete Confirmation
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // Store ID to delete

  // Notification State
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ 
    customer_id: '',
    customer_name: '', 
    device_model: '', 
    issue_description: '', 
    estimated_cost: '',
    status: 'Received',
    payment_method: 'Cash'
  });

  const [selectedPart, setSelectedPart] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchItems();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(null);
    }, 3000);
  };

  const fetchTickets = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      // ✅ Corrected URL
      const response = await fetch(`${API_BASE_URL}/api/repairs/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching repairs:", err);
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      // ✅ FIXED: Changed from localhost to API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/items/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    const url = isEditing 
      ? `${API_BASE_URL}/api/repairs/${currentId}/` 
      : `${API_BASE_URL}/api/repairs/`;
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            customer_id: formData.customer_id,
            customer_name: formData.customer_name,
            device_model: formData.device_model,
            issue_description: formData.issue_description,
            estimated_cost: parseInt(formData.estimated_cost),
            status: formData.status,
            payment_method: formData.payment_method
        }),
      });

      if (response.ok) {
        const savedTicket = await response.json();
        
        if (selectedPart) {
            const ticketId = isEditing ? currentId : savedTicket.id;
            // ✅ Corrected URL
            await fetch(`${API_BASE_URL}/api/repairs/parts/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    repair_id: ticketId, 
                    item: selectedPart, 
                    quantity: 1 
                })
            });
        }

        fetchTickets(); 
        closeModal();
        showNotification(isEditing ? "Repair Updated Successfully! 🔧" : "New Ticket Created! 📝");
      } else {
        alert("Failed to save ticket.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  // --- NEW: OPEN DELETE CONFIRMATION ---
  const openDeleteModal = (id) => {
      setDeleteId(id);
      setIsDeleteModalOpen(true);
  };

  // --- NEW: ACTUAL DELETE ACTION ---
  const confirmDelete = async () => {
    if (!deleteId) return;

    const token = localStorage.getItem('accessToken');
    try {
      // ✅ Corrected URL
      const response = await fetch(`${API_BASE_URL}/api/repairs/${deleteId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchTickets();
        showNotification("Ticket Deleted Successfully! 🗑️");
        setIsDeleteModalOpen(false); // Close Modal
        setDeleteId(null);
      }
    } catch (err) {
      alert("Error deleting ticket.");
    }
  };

  const openEditModal = (ticket) => {
    setFormData({
      customer_id: ticket.customer_id || '',
      customer_name: ticket.customer_name,
      device_model: ticket.device_model,
      issue_description: ticket.issue_description,
      estimated_cost: ticket.estimated_cost,
      status: ticket.status,
      payment_method: ticket.payment_method || 'Cash'
    });
    setSelectedPart(''); 
    setCurrentId(ticket.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ customer_id: '', customer_name: '', device_model: '', issue_description: '', estimated_cost: '', status: 'Received', payment_method: 'Cash' });
    setSelectedPart('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  // --- STYLES ---
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800';
  const headerClass = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600';
  const editBtnClass = isDarkMode ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800';
  const deleteBtnClass = isDarkMode ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-800';

  return (
    <div className={`p-8 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* SUCCESS NOTIFICATION */}
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
        <h2 className="text-2xl font-bold">Repair Tickets</h2>
        <button onClick={() => { setIsEditing(false); setIsModalOpen(true); }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> New Ticket
        </button>
      </div>

      <div className={`rounded-lg shadow-sm overflow-hidden ${cardClass}`}>
        {loading ? (
            <div className="p-8 text-center opacity-50">Loading repairs...</div>
        ) : (
            <table className="w-full text-left">
            <thead className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} ${headerClass}`}>
                <tr>
                <th className="px-6 py-4 text-sm font-semibold">Cust ID</th>
                <th className="px-6 py-4 text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold">Device</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-sm font-semibold">Cost</th>
                <th className="px-6 py-4 text-sm font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {tickets.map((ticket) => (
                <tr key={ticket.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 text-sm opacity-70">{ticket.customer_id || '-'}</td>
                    <td className="px-6 py-4 font-medium">{ticket.customer_name}</td>
                    <td className="px-6 py-4 opacity-80 flex items-center gap-2">
                        <Wrench size={16} className="opacity-50"/>
                        {ticket.device_model}
                    </td>
                    <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-600">Rs. {ticket.estimated_cost}</td>
                    <td className="px-6 py-4 flex gap-3">
                        <button 
                            onClick={() => openEditModal(ticket)} 
                            className={`p-2 rounded-full transition-colors ${editBtnClass}`}
                            title="Edit"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => openDeleteModal(ticket.id)} 
                            className={`p-2 rounded-full transition-colors ${deleteBtnClass}`}
                            title="Delete"
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
          <div className={`rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[90vh] ${cardClass}`}>
            <div className={`flex justify-between items-center p-6 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">
                  {isEditing ? 'Update Repair Status' : 'New Repair Ticket'}
              </h3>
              <button onClick={closeModal}><X size={24} className="opacity-50 hover:opacity-100" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSaveTicket} className="space-y-4">
                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Current Status</label>
                        <select className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="Received">Received (Pending)</option>
                            <option value="In Progress">In Progress (Working)</option>
                            <option value="Done">Done (Ready)</option>
                            <option value="Delivered">Delivered (Paid)</option>
                        </select>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Customer ID</label>
                        <input placeholder="Optional" className={`w-full p-2 border rounded-lg ${inputClass}`} value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Customer Name</label>
                        <input required placeholder="Ram Sharma" className={`w-full p-2 border rounded-lg ${inputClass}`} value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Device Model</label>
                        <input required placeholder="iPhone 11" className={`w-full p-2 border rounded-lg ${inputClass}`} value={formData.device_model} onChange={e => setFormData({...formData, device_model: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-50">Est. Cost (Rs)</label>
                        <input required type="number" placeholder="0" className={`w-full p-2 border rounded-lg ${inputClass}`} value={formData.estimated_cost} onChange={e => setFormData({...formData, estimated_cost: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase mb-1 opacity-50">Issue Description</label>
                    <textarea required rows="2" placeholder="e.g. Screen broken..." className={`w-full p-2 border rounded-lg ${inputClass}`} value={formData.issue_description} onChange={e => setFormData({...formData, issue_description: e.target.value})} />
                </div>
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="text-xs font-bold uppercase mb-1 opacity-70 flex items-center gap-1">
                        <Wrench size={12}/> Add Part Used (Deducts Stock)
                    </label>
                    <select className={`w-full p-2 border rounded-lg text-sm ${inputClass}`} value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)}>
                        <option value="">-- No Part Used --</option>
                        {Object.keys(groupedItems).map(category => (
                            <optgroup key={category} label={category}>
                                {groupedItems[category].map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} (Stock: {item.stock}) - Rs. {item.price}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <p className="text-[10px] mt-1 opacity-50">Select item to remove from inventory when saved.</p>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase mb-1 opacity-50">Payment Method</label>
                    <select className={`w-full p-2 border rounded-lg ${inputClass}`} value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                        <option value="Cash">Cash</option><option value="Fonepay">Fonepay</option><option value="Bank">Bank Transfer</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-medium mt-2 flex justify-center items-center gap-2">
                    {isEditing ? 'Update Repair' : 'Create Ticket'}
                </button>
                </form>
            </div>
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
                <h3 className="text-xl font-bold mb-2">Delete Repair Ticket?</h3>
                <p className="opacity-70 mb-6 text-sm">
                    This action cannot be undone. Are you sure you want to permanently delete this record?
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

export default Repairs;