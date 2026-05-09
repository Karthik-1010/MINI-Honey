import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const AddItemModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', category: '', price: '', quantity: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', category: '', price: '', quantity: '' });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-panel p-8 rounded-2xl w-full max-w-md border border-white/10 relative"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Add Stock Item</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest px-1 block mb-2">Item Name</label>
              <input required type="text" className="w-full bg-zinc-900/50 border-white/10 rounded-xl p-4 text-white focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23] outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Classic Burger" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest px-1 block mb-2">Category</label>
              <input required type="text" className="w-full bg-zinc-900/50 border-white/10 rounded-xl p-4 text-white focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23] outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Mains" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest px-1 block mb-2">Price ($)</label>
                <input required type="number" step="0.01" className="w-full bg-zinc-900/50 border-white/10 rounded-xl p-4 text-white focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23] outline-none transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest px-1 block mb-2">Quantity</label>
                <input required type="number" className="w-full bg-zinc-900/50 border-white/10 rounded-xl p-4 text-white focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23] outline-none transition-all" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="0" />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#ef4d23] text-white px-6 py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20 mt-4 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add_circle</span> Add to Stock
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const StockItemRow = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQty, setTempQty] = useState(item.quantity);

  const handleSave = () => {
    onUpdate(item.id, tempQty);
    setIsEditing(false);
  };

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0"
    >
      <td className="px-8 py-6 font-bold text-white group-hover:text-[#ef4d23] transition-colors">{item.name}</td>
      <td className="px-8 py-6 text-zinc-400 font-medium">{item.category}</td>
      <td className="px-8 py-6 font-mono text-white">${parseFloat(item.price).toFixed(2)}</td>
      <td className="px-8 py-6 text-center font-mono text-white">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <input 
              type="number" 
              className="w-20 bg-zinc-900 border-white/10 rounded-lg text-sm p-2 text-white focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23] outline-none text-center" 
              value={tempQty} 
              onChange={e => setTempQty(e.target.value)}
              autoFocus
            />
            <button onClick={handleSave} className="text-green-500 hover:text-green-400 bg-green-500/10 p-1.5 rounded-md transition-colors">
              <span className="material-symbols-outlined text-sm">check</span>
            </button>
            <button onClick={() => { setIsEditing(false); setTempQty(item.quantity); }} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-md transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <span className="text-lg">{item.quantity}</span>
        )}
      </td>
      <td className="px-8 py-6 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.status === 'In Stock' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {item.status}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end gap-2">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white/5 hover:bg-blue-500/20 text-white hover:text-blue-400 p-2 rounded-lg transition-all flex items-center justify-center group/btn" 
              title="Update Quantity"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:scale-110">edit</span>
            </button>
          )}
          <button 
            onClick={() => onDelete(item.id)}
            className="bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 p-2 rounded-lg transition-all flex items-center justify-center group/btn" 
            title="Delete Item"
          >
            <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:scale-110">delete</span>
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const StockTable = ({ stock, onUpdate, onDelete }) => (
  <div className="overflow-x-auto rounded-2xl glass-panel border border-white/5 shadow-2xl">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-white/5 border-b border-white/5">
          <th className="px-8 py-5 text-xs uppercase font-bold text-zinc-400 tracking-widest">Item Name</th>
          <th className="px-8 py-5 text-xs uppercase font-bold text-zinc-400 tracking-widest">Category</th>
          <th className="px-8 py-5 text-xs uppercase font-bold text-zinc-400 tracking-widest">Price</th>
          <th className="px-8 py-5 text-xs uppercase font-bold text-zinc-400 tracking-widest text-center">Quantity</th>
          <th className="px-8 py-5 text-xs uppercase font-bold text-zinc-400 tracking-widest text-center">Status</th>
          <th className="px-8 py-5 text-xs uppercase font-bold text-zinc-400 tracking-widest text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        <AnimatePresence>
          {stock.length > 0 ? stock.map((item) => (
            <StockItemRow 
              key={item.id} 
              item={item} 
              onUpdate={onUpdate} 
              onDelete={onDelete} 
            />
          )) : (
            <tr>
              <td colSpan="6" className="px-8 py-12 text-center text-zinc-500 font-medium italic">
                No items in stock. Add some above.
              </td>
            </tr>
          )}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

const StockPage = () => {
  const [stock, setStock] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStock = async () => {
    try {
      const res = await api.get('/api/stock/');
      setStock(res.data);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAddItem = async (newItem) => {
    try {
      const res = await api.post('/api/stock/', newItem);
      setStock([...stock, res.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (id, field, value) => {
    try {
      const res = await api.patch(`/api/stock/${id}/`, { [field]: value });
      setStock(stock.map(item => item.id === id ? res.data : item));
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Error updating stock quantity");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      try {
        await api.delete(`/api/stock/${id}/`);
        fetchStock();
      } catch (error) {
        console.error("Failed to delete stock:", error);
      }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[280px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
        <img 
          className="w-full h-full object-cover grayscale opacity-40" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf3BvFJQ2crxWFt16o3247zeHSHEroiGAWud7xHzJSv19uGv5tDvNdS1Hqq0XSYChaY3Wiu0ga-44hdJwWZwyLJ5EuSc0v7mpZ3ZqQNMTLXlzlMGpy3kK4CjRj6xzR66_LF_2_ZmBI1Xxp0z7nzL4bOBesKayF-sQk05kyuU2tRS92Fj9j9UdT2UDTCtip1O_Sy7sUeFDOs9kC3VM5gxMh9HswbePAnOpl0FdDk4gwPVaieGSixNA5IIva6tk2EAi4PI1rECd-O1ND"
          alt="Stock Hero"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-[1440px] mx-auto w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display-lg text-4xl md:text-5xl text-white mb-2 font-black tracking-tight"
          >
            Stock Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 max-w-xl text-base md:text-lg"
          >
            Manage item availability, price, and track exact inventory quantities dynamically.
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-8 mt-12 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Stock Register</h2>
            <p className="text-zinc-500 text-sm mt-1">Showing all tracked items across categories.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ef4d23] text-white px-6 py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#ef4d23]/20"
          >
            <span className="material-symbols-outlined text-sm">add_box</span> Add Item
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-zinc-500">
            <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
          </div>
        ) : (
          <StockTable stock={stock} onUpdate={handleUpdateQuantity} onDelete={handleDeleteItem} />
        )}
      </div>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />
    </div>
  );
};

export default StockPage;
