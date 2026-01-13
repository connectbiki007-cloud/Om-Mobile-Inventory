import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Printer, Edit, Trash2, CheckCircle, Users, User, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { API_BASE_URL } from '../config'; // <--- Ensure this is imported

const Sales = ({ isDarkMode }) => {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]); 
  
  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // NEW: Delete Modal State
  
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // Store ID to delete
  const [notification, setNotification] = useState(null);

  const [customerType, setCustomerType] = useState('Retail'); 

  // --- Form State ---
  const [newSale, setNewSale] = useState({ 
    item_id: '', 
    quantity: 1, 
    payment_method: 'Cash',
    imei_number: '',
    unit_price: '',
    customer_name: '',  
    customer_phone: ''  
  });
  
  const [isPhone, setIsPhone] = useState(false);

  // --- PRINTING STATE ---
  const componentRef = useRef();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);

  const handlePrint = useReactToPrint({ 
    content: () => componentRef.current, 
    onAfterPrint: () => setIsReadyToPrint(false) 
  });

  useEffect(() => { 
    if (isReadyToPrint && selectedInvoice) {
        handlePrint();
    }
  }, [isReadyToPrint, selectedInvoice]);

  useEffect(() => { fetchSales(); fetchItems(); }, []);

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const fetchSales = async () => {
    const token = localStorage.getItem('accessToken');
    // ✅ FIXED: Used API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/api/sales/`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setSales(await res.json());
  };
  
  const fetchItems = async () => {
    const token = localStorage.getItem('accessToken');
    // ✅ FIXED: Used API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/api/items/`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setItems(await res.json());
  };

  // --- CRM LOGIC: Auto-fill Name by Phone ---
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setNewSale(prev => ({ ...prev, customer_phone: phone }));

    if (phone.length > 5) {
        const existingCustomer = sales.find(s => s.customer_phone === phone);
        if (existingCustomer && existingCustomer.customer_name) {
            setNewSale(prev => ({ ...prev, customer_name: existingCustomer.customer_name }));
        }
    }
  };

  // --- EXPORT CSV ---
  const handleExportCSV = () => {
    const headers = ["Date", "Customer Name", "Phone", "Item Name", "Category", "Sale Type", "IMEI", "Unit Price", "Quantity", "Total Price", "Payment Method"];
    const rows = sales.map(sale => [
        new Date(sale.sale_date).toLocaleDateString(),
        sale.customer_name || 'Guest',
        sale.customer_phone || '-',
        sale.item_name,
        sale.item_category || '-',
        sale.sale_type,
        sale.imei_number || '-',
        sale.unit_price,
        sale.quantity,
        sale.total_price,
        sale.payment_method
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Record_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Database Downloaded! 📂");
  };

  const handleItemSelect = (e) => {
    const id = e.target.value;
    const item = items.find(i => i.id == id);
    
    let defaultPrice = 0;
    if (item) defaultPrice = item.price;

    setNewSale(prev => ({ 
        ...prev, 
        item_id: id,
        unit_price: defaultPrice 
    }));

    if (item && (item.category.toLowerCase().includes('android') || item.category.toLowerCase().includes('keypad'))) { 
        setIsPhone(true); 
    } else { 
        setIsPhone(false); 
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    // ✅ FIXED: Used backticks (`) and API_BASE_URL
    const url = isEditing 
        ? `${API_BASE_URL}/api/sales/${currentSaleId}/` 
        : `${API_BASE_URL}/api/sales/`;
        
    const method = isEditing ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
          item: newSale.item_id, 
          quantity: parseInt(newSale.quantity), 
          payment_method: newSale.payment_method, 
          imei_number: isPhone ? newSale.imei_number : '',
          sale_type: customerType, 
          unit_price: newSale.unit_price,
          customer_name: newSale.customer_name,
          customer_phone: newSale.customer_phone
      }),
    });

    if (res.ok) { 
        fetchSales(); fetchItems(); setIsModalOpen(false); setIsEditing(false); 
        setNewSale({ item_id: '', quantity: 1, payment_method: 'Cash', imei_number: '', unit_price: '', customer_name: '', customer_phone: '' }); 
        showNotification(isEditing ? "Updated Successfully!" : "Sale Recorded!");
    } else { alert("Error saving."); }
  };

  // --- NEW: DELETE LOGIC ---
  const openDeleteModal = (id) => {
      setDeleteId(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('accessToken');
    
    // ✅ FIXED: Used backticks (`) and API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/api/sales/${deleteId}/`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    
    if (res.ok) { 
        fetchSales(); 
        fetchItems(); 
        showNotification("Sale Deleted! 🗑️");
        setIsDeleteModalOpen(false); // Close Modal
        setDeleteId(null);
    }
  };

  const handleEdit = (sale) => {
      setNewSale({ 
          item_id: sale.item, 
          quantity: sale.quantity, 
          payment_method: sale.payment_method, 
          imei_number: sale.imei_number || '',
          unit_price: sale.unit_price,
          customer_name: sale.customer_name || '',
          customer_phone: sale.customer_phone || ''
      });
      setCustomerType(sale.sale_type || 'Retail');
      const item = items.find(i => i.id === sale.item);
      if (item && (item.category.toLowerCase().includes('android') || item.category.toLowerCase().includes('keypad'))) { setIsPhone(true); } else { setIsPhone(false); }
      setIsEditing(true); setCurrentSaleId(sale.id); setIsModalOpen(true);
  };

  const openInvoice = (sale) => { setSelectedInvoice(sale); setIsReadyToPrint(true); };

  // --- STYLES ---
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800';
  const headerClass = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600';
  
  const editBtnClass = isDarkMode ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800';
  const deleteBtnClass = isDarkMode ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-800';

  return (
    <div className={`p-8 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-50">
            <CheckCircle size={24} /> <div><h4 className="font-bold text-sm">Success</h4><p className="text-xs">{notification}</p></div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold">Sales Record</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track and export your sales history</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handleExportCSV} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-green-400' : 'border-gray-300 hover:bg-gray-50 text-green-700'}`}
            >
                <FileSpreadsheet size={20} /> Export CSV
            </button>

            <button onClick={() => { setIsEditing(false); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={20} /> New Sale
            </button>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-lg shadow-sm overflow-hidden ${cardClass}`}>
        <table className="w-full text-left">
           <thead className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} ${headerClass}`}>
            <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Item</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Actions</th></tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {sales.map((sale) => (
              <tr key={sale.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(sale.sale_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                    <div className="font-medium">{sale.customer_name || 'Guest'}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{sale.customer_phone}</div>
                </td>
                <td className="px-6 py-4 font-medium">
                    {sale.item_name}
                    {sale.imei_number && <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>IMEI: {sale.imei_number}</div>}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sale.sale_type === 'Wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sale.sale_type || 'Retail'}
                    </span>
                </td>
                <td className="px-6 py-4 font-bold text-green-600">Rs. {sale.total_price}</td>
                <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openInvoice(sale)} className="text-gray-500 hover:text-gray-700 p-2"><Printer size={16} /></button>
                    <button 
                        onClick={() => handleEdit(sale)} 
                        className={`p-2 rounded-full transition-colors ${editBtnClass}`}
                        title="Edit Sale"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={() => openDeleteModal(sale.id)} 
                        className={`p-2 rounded-full transition-colors ${deleteBtnClass}`}
                        title="Delete Sale"
                    >
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[90vh] ${cardClass}`}>
            <div className={`flex justify-between items-center p-6 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className="text-xl font-bold">{isEditing ? 'Edit Sale' : 'New Sale'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="opacity-50 hover:opacity-100"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSaleSubmit} className="space-y-4">
                    
                    {/* CUSTOMER SECTION */}
                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                        <label className="text-xs font-bold opacity-70 mb-2 block items-center gap-1"><Users size={14}/> Customer Details</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input placeholder="Phone (Auto-fill)" className={`w-full p-2 border rounded ${inputClass}`} value={newSale.customer_phone} onChange={handlePhoneChange} />
                            </div>
                            <div>
                                <input placeholder="Name" className={`w-full p-2 border rounded ${inputClass}`} value={newSale.customer_name} onChange={e => setNewSale({...newSale, customer_name: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <button type="button" onClick={() => setCustomerType('Retail')} className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${customerType === 'Retail' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><User size={16} /> Retail</button>
                        <button type="button" onClick={() => setCustomerType('Wholesale')} className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${customerType === 'Wholesale' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Users size={16} /> Wholesale</button>
                    </div>

                    <select required className={`w-full p-2 border rounded ${inputClass}`} onChange={handleItemSelect} value={newSale.item_id}>
                        <option value="">Select Item</option>
                        {Object.keys(groupedItems).map(category => (
                            <optgroup key={category} label={category}>
                                {groupedItems[category].map(i => (
                                    <option key={i.id} value={i.id}>{i.name} (Rs. {i.price})</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold opacity-50 uppercase">Quantity</label>
                            <input type="number" min="1" className={`w-full p-2 border rounded mt-1 ${inputClass}`} value={newSale.quantity} onChange={e => setNewSale({...newSale, quantity: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold opacity-50 uppercase">Unit Price (NPR)</label>
                            <input type="number" className={`w-full p-2 border rounded mt-1 font-bold ${isDarkMode ? 'bg-gray-700 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-900'}`} value={newSale.unit_price} onChange={e => setNewSale({...newSale, unit_price: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold opacity-50 uppercase">Payment Method</label>
                        <select className={`w-full p-2 border rounded mt-1 ${inputClass}`} value={newSale.payment_method} onChange={e => setNewSale({...newSale, payment_method: e.target.value})}>
                            <option value="Cash">Cash</option><option value="Fonepay">Fonepay</option><option value="Bank">Bank</option>
                        </select>
                    </div>
                    
                    {isPhone && <input type="text" placeholder="IMEI Number" className={`w-full p-2 border rounded ${inputClass}`} value={newSale.imei_number} onChange={e => setNewSale({...newSale, imei_number: e.target.value})} />}
                    
                    <div className={`p-4 rounded-lg flex justify-between items-center ${customerType === 'Wholesale' ? 'bg-purple-50 text-purple-800' : 'bg-green-50 text-green-800'}`}>
                        <span className="font-medium">Grand Total:</span>
                        <span className="text-xl font-bold">Rs. {newSale.unit_price * newSale.quantity}</span>
                    </div>

                    <button type="submit" className={`w-full py-2 rounded font-bold text-white ${customerType === 'Wholesale' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {isEditing ? 'Update Sale' : 'Confirm Sale'}
                    </button>
                </form>
            </div>
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
                <h3 className="text-xl font-bold mb-2">Delete Sale Record?</h3>
                <p className="opacity-70 mb-6 text-sm">
                    This action cannot be undone. Are you sure you want to permanently delete this sale record?
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
      
      {/* --- INVOICE TEMPLATE (Visible only to printer) --- */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={componentRef} className="p-8 text-black bg-white" style={{ width: "80mm", fontFamily: 'sans-serif' }}>
            {selectedInvoice ? (
                <div>
                    <div className="text-center border-b-2 border-black pb-2 mb-2">
                        <h1 className="text-xl font-bold uppercase">Om Mobile</h1>
                        <p className="text-xs">Kathmandu | 9800000000</p>
                    </div>
                    <div className="flex justify-between mb-2 text-xs">
                        <div>
                            <p><strong>Inv:</strong> #{selectedInvoice.id}</p>
                            <p><strong>To:</strong> {selectedInvoice.customer_name || 'Guest'}</p>
                        </div>
                        <div className="text-right">
                             <p>{new Date(selectedInvoice.sale_date).toLocaleDateString()}</p>
                             <p>{selectedInvoice.payment_method}</p>
                        </div>
                    </div>
                    <table className="w-full border-collapse border border-black mb-2 text-xs">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-black p-1 text-left">Item</th>
                                <th className="border border-black p-1 text-center">Qty</th>
                                <th className="border border-black p-1 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-1">
                                    {selectedInvoice.item_name}
                                    {selectedInvoice.imei_number && <div className="text-[10px]">IMEI: {selectedInvoice.imei_number}</div>}
                                </td>
                                <td className="border border-black p-1 text-center">{selectedInvoice.quantity}</td>
                                <td className="border border-black p-1 text-right">{selectedInvoice.total_price}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="text-right">
                        <h2 className="text-lg font-bold">Total: Rs. {selectedInvoice.total_price}</h2>
                    </div>
                    <div className="mt-4 text-center text-[10px] border-t border-black pt-1">
                        <p>Thank you for visiting!</p>
                    </div>
                </div>
            ) : (
                <p>Loading Invoice...</p>
            )}
        </div>
      </div>
    </div>
  );
};
export default Sales;