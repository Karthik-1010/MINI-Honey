import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE = '/api/inventory/';

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'packets', 'boxes', 'bottles'];

const QUICK_ESSENTIALS = [
  { name: 'Milk',   icon: 'water_drop', unit: 'L'    },
  { name: 'Eggs',   icon: 'egg',        unit: 'pcs'  },
  { name: 'Curd',   icon: 'icecream',   unit: 'kg'   },
  { name: 'Butter', icon: 'bakery_dining', unit: 'kg' },
  { name: 'Sugar',  icon: 'restaurant',  unit: 'kg'  },
  { name: 'Oil',    icon: 'opacity',     unit: 'L'   },
];

const EMPTY_FORM = { name: '', stock_level: '', unit: 'pcs', note: '', min_threshold: 10 };

const stockStatus = (item) => {
  if (item.stock_level <= 0)               return { label: 'Out of Stock', cls: 'bg-red-500/20 text-red-300 border-red-500/30' };
  if (item.stock_level <= item.min_threshold) return { label: 'Low Stock',    cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
  return { label: 'In Stock', cls: 'bg-green-500/20 text-green-300 border-green-500/30' };
};

const Inventory = () => {
  const [inventory,      setInventory]      = useState([]);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [editingId,      setEditingId]      = useState(null);
  const [showClear,      setShowClear]      = useState(false);
  const [quickQtys,      setQuickQtys]      = useState({});  // { name: qty }
  const [saving,         setSaving]         = useState(false);
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [toast,          setToast]          = useState(null);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(BASE);
      setInventory(res.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── CRUD ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.stock_level === '') return;
    setSaving(true);
    try {
      if (editingId) {
        await axios.patch(`${BASE}${editingId}/`, form);
        showToast('Item updated!');
        setEditingId(null);
      } else {
        await axios.post(BASE, form);
        showToast('Item added!');
      }
      setForm(EMPTY_FORM);
      fetchInventory();
    } catch (err) {
      showToast('Error saving item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name:          item.name,
      stock_level:   item.stock_level,
      unit:          item.unit || 'pcs',
      note:          item.note || '',
      min_threshold: item.min_threshold || 10,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE}${id}/`);
      setInventory(prev => prev.filter(i => i.id !== id));
      showToast('Item deleted.');
    } catch { showToast('Error deleting item.', 'error'); }
  };

  const handleAdjustQty = async (item, delta) => {
    const newQty = Math.max(0, item.stock_level + delta);
    try {
      await axios.patch(`${BASE}${item.id}/`, { stock_level: newQty });
      setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock_level: newQty } : i));
    } catch { showToast('Error updating quantity.', 'error'); }
  };

  const handleQuickAdd = async (essential) => {
    const qty = parseInt(quickQtys[essential.name] || 1);
    const existing = inventory.find(i => i.name.toLowerCase() === essential.name.toLowerCase());
    try {
      if (existing) {
        const newQty = existing.stock_level + qty;
        await axios.patch(`${BASE}${existing.id}/`, { stock_level: newQty });
        showToast(`${essential.name} updated to ${newQty} ${existing.unit}`);
      } else {
        await axios.post(BASE, { name: essential.name, stock_level: qty, unit: essential.unit, note: '', min_threshold: 10 });
        showToast(`${essential.name} added!`);
      }
      fetchInventory();
    } catch { showToast('Error.', 'error'); }
  };

  const handleClearAll = async () => {
    try {
      await axios.post(`${BASE}clear_all/`);
      setInventory([]);
      setShowClear(false);
      showToast('All inventory cleared.');
    } catch { showToast('Error clearing inventory.', 'error'); }
  };

  /* ── Export CSV ── */
  const handleExport = () => {
    const rows = [
      ['Name', 'Quantity', 'Unit', 'Min Threshold', 'Note', 'Status'],
      ...inventory.map(i => [
        i.name, i.stock_level, i.unit, i.min_threshold, i.note || '', stockStatus(i).label
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!');
  };

  /* ── Filtered list ── */
  const filtered = inventory.filter(item => {
    const s = stockStatus(item).label.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' ? true
      : filterStatus === 'low'  ? s === 'low stock'
      : filterStatus === 'out'  ? s === 'out of stock'
      : s === 'in stock';
    return matchSearch && matchFilter;
  });

  const summary = {
    total:    inventory.length,
    inStock:  inventory.filter(i => stockStatus(i).label === 'In Stock').length,
    low:      inventory.filter(i => stockStatus(i).label === 'Low Stock').length,
    out:      inventory.filter(i => stockStatus(i).label === 'Out of Stock').length,
  };

  return (
    <div className="min-h-screen pb-20">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-xl border ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/30 text-red-200' : 'bg-green-900/80 border-green-500/30 text-green-200'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative w-full h-[260px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/80 to-transparent z-10" />
        <img
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqEIjkhOVzOv8ukfSSqmUILhGXWAOyVB9THhZk2JSDI-6UioEOaLNS5GY9lsNzX0vhXteURZFHOCqwUkDG2SjdStgq7d2VhUcGqF_KLUOPeDjJLO3btMU8quD5N51CshR4Ct60jA56rUr4cN1BGpIZYtY3Fbe8o9wkx54npHXuih032OuCIb8wPJjxA0ycc1cLh2d1VSY3NfTnvXOGEr-3t2USeN2asx_RN1eCGsoKmBrQFjYEy8wtY8JRj_J-DL55KOUrdSYAmRA-"
          alt="Store"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-14">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="font-display-lg text-4xl md:text-5xl text-white font-black tracking-tighter italic uppercase">
            Store Inventory
          </motion.h1>
          <p className="text-white/50 mt-2 max-w-md">Manage your supplies — track stock, set low-stock alerts, and export reports.</p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 space-y-10">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: summary.total,   icon: 'inventory_2', color: '#ef4d23' },
            { label: 'In Stock',    value: summary.inStock, icon: 'check_circle', color: '#10b981' },
            { label: 'Low Stock',   value: summary.low,     icon: 'warning',      color: '#f59e0b' },
            { label: 'Out of Stock',value: summary.out,     icon: 'cancel',       color: '#ef4444' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: `${s.color}20` }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{s.label}</p>
                <p className="text-white text-2xl font-black">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top row: Quick Add + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Add */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white italic uppercase">⚡ Quick Add</h2>
            <div className="space-y-3">
              {QUICK_ESSENTIALS.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#ef4d23]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ef4d23] text-lg">{item.icon}</span>
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className="text-zinc-600 text-xs">{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={quickQtys[item.name] || 1}
                      onChange={e => setQuickQtys(q => ({ ...q, [item.name]: e.target.value }))}
                      className="w-14 bg-black/50 border border-white/10 rounded-lg text-sm p-1.5 text-white text-center focus:outline-none focus:border-[#ef4d23]"
                    />
                    <button
                      onClick={() => handleQuickAdd(item)}
                      className="bg-[#ef4d23] text-white p-2 rounded-lg hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#ef4d23]/20"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add / Edit Form */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-black text-white italic uppercase">
                {editingId ? '✏️ Edit Item' : '➕ Add New Item'}
              </h2>
              {editingId && (
                <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }}
                  className="text-zinc-400 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-base">close</span> Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Item Name *</label>
                <input
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                  placeholder="e.g. Organic Honey"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Quantity *</label>
                  <input
                    required type="number" min="0"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                    placeholder="0"
                    value={form.stock_level}
                    onChange={e => setForm({ ...form, stock_level: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Unit</label>
                  <select
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Low Stock Alert (min)</label>
                <input
                  type="number" min="0"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                  placeholder="10"
                  value={form.min_threshold}
                  onChange={e => setForm({ ...form, min_threshold: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Note</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                  placeholder="Special instructions…"
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#ef4d23] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">{editingId ? 'update' : 'add_circle'}</span>
                  {saving ? 'Saving…' : editingId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          {/* Table Header */}
          <div className="p-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search items…"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#ef4d23] transition-colors text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#ef4d23] text-sm"
              >
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <div className="flex gap-3">
              {!showClear ? (
                <button onClick={() => setShowClear(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
                  <span className="material-symbols-outlined text-base">delete_sweep</span> Clear All
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleClearAll}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold animate-pulse">
                    ⚠️ Confirm
                  </button>
                  <button onClick={() => setShowClear(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold">
                    Cancel
                  </button>
                </div>
              )}
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ef4d23] text-white text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20">
                <span className="material-symbols-outlined text-base">download</span> Export CSV
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Item</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Note</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-white/20 text-xs uppercase tracking-widest">
                      {search ? 'No items match your search.' : 'No inventory items yet. Add one above!'}
                    </td>
                  </tr>
                ) : filtered.map(item => {
                  const st = stockStatus(item);
                  return (
                    <motion.tr key={item.id} layout className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-white group-hover:text-[#ef4d23] transition-colors">{item.name}</p>
                        <p className="text-zinc-600 text-xs mt-0.5">Min: {item.min_threshold} {item.unit}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleAdjustQty(item, -1)}
                            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center text-sm transition-colors">
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="text-white font-black w-12 text-center font-mono">{item.stock_level} {item.unit}</span>
                          <button onClick={() => handleAdjustQty(item, 1)}
                            className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#ef4d23] text-white flex items-center justify-center text-sm transition-colors">
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-zinc-500 text-sm italic max-w-[200px] truncate">
                        {item.note || '—'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white hover:text-blue-400 transition-all">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
