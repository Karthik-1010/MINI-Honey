import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_MENU = '/api/menu-items/';
const API_CAT  = '/api/categories/';
const API_ORDERS = '/api/orders/';

/* ─── helpers ─────────────────────────────────────────────── */
const avatar = (name) => name?.[0]?.toUpperCase() || '?';
const COLORS  = ['#ef4d23','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
const memberColor = (i) => COLORS[i % COLORS.length];

/* ─── main component ──────────────────────────────────────── */
const OrderManagement = () => {
  /* -- menu data -- */
  const [menuItems,   setMenuItems]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [menuFilter,  setMenuFilter]  = useState('all');
  const [menuSearch,  setMenuSearch]  = useState('');
  const [menuCat,     setMenuCat]     = useState(null);

  /* -- session -- */
  const [members, setMembers] = useState([]);      // [{ name, items:[{...item, qty}] }]
  const [activeMember, setActiveMember] = useState(null);  // index
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const nameRef = useRef();

  /* -- place order -- */
  const [placing, setPlacing]   = useState(false);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        axios.get(API_CAT),
        axios.get(API_MENU),
      ]);
      setCategories(catRes.data);
      setMenuItems(itemRes.data);
      if (catRes.data.length) setMenuCat(catRes.data[0].id);
    } catch { /* silent */ }
  };

  /* ── add member ── */
  const handleAddMember = (e) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) { setNameError('Please enter a name.'); return; }
    if (members.find(m => m.name.toLowerCase() === name.toLowerCase())) {
      setNameError('Name already added.'); return;
    }
    const updated = [...members, { name, items: [] }];
    setMembers(updated);
    setActiveMember(updated.length - 1);
    setNameInput('');
    setNameError('');
  };

  /* ── add / remove item for active member ── */
  const addItem = (item) => {
    if (activeMember === null) return;
    setMembers(prev => prev.map((m, i) => {
      if (i !== activeMember) return m;
      const existing = m.items.find(it => it.id === item.id);
      const items = existing
        ? m.items.map(it => it.id === item.id ? { ...it, qty: it.qty + 1 } : it)
        : [...m.items, { ...item, qty: 1 }];
      return { ...m, items };
    }));
  };

  const removeItem = (itemId) => {
    if (activeMember === null) return;
    setMembers(prev => prev.map((m, i) => {
      if (i !== activeMember) return m;
      const items = m.items
        .map(it => it.id === itemId ? { ...it, qty: it.qty - 1 } : it)
        .filter(it => it.qty > 0);
      return { ...m, items };
    }));
  };

  const deleteMember = (idx) => {
    const updated = members.filter((_, i) => i !== idx);
    setMembers(updated);
    setActiveMember(updated.length > 0 ? 0 : null);
  };

  /* ── derived ── */
  const memberTotal = (m) =>
    m.items.reduce((s, it) => s + parseFloat(it.price) * it.qty, 0);

  const grandTotal = members.reduce((s, m) => s + memberTotal(m), 0);

  const activeMemberQty = (itemId) => {
    if (activeMember === null) return 0;
    return members[activeMember]?.items.find(it => it.id === itemId)?.qty || 0;
  };

  const visibleItems = menuItems.filter(item => {
    const catMatch = menuCat ? item.category === menuCat : true;
    const filterMatch = menuFilter === 'all' ? true : item.item_type === menuFilter;
    const searchMatch = menuSearch
      ? item.name.toLowerCase().includes(menuSearch.toLowerCase())
      : true;
    return catMatch && filterMatch && searchMatch;
  });

  const visibleCats = categories.filter(cat =>
    menuItems.some(item =>
      item.category === cat.id &&
      (menuFilter === 'all' ? true : item.item_type === menuFilter)
    )
  );

  /* ── place group order ── */
  const placeGroupOrder = async () => {
    if (members.length === 0) return;
    const hasItems = members.some(m => m.items.length > 0);
    if (!hasItems) { alert('Add at least one item before placing the order.'); return; }
    setPlacing(true);
    try {
      // Place one order per member
      await Promise.all(members.filter(m => m.items.length > 0).map(m =>
        axios.post(API_ORDERS, {
          customer_name: m.name,
          status: 'PENDING',
          total_amount: (memberTotal(m) * 1.05).toFixed(2),
          is_group_order: true,
          items: m.items.map(it => ({ menu_item: it.id, quantity: it.qty }))
        })
      ));
      setSuccess(true);
      setTimeout(() => {
        setMembers([]);
        setActiveMember(null);
        setSuccess(false);
      }, 2500);
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  /* ─── render ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-32">

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#131313] to-[#0d0d0d] border-b border-white/5 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#ef4d23] font-black uppercase tracking-[0.3em] text-xs mb-3">Group Ordering</p>
          <h1 className="font-display-lg text-4xl md:text-5xl text-white font-black italic uppercase tracking-tight">
            Table <span className="text-[#ef4d23]">Order</span>
          </h1>
          <p className="text-white/50 mt-3 text-base max-w-xl">
            Add each person at the table, let them pick their items, then place one combined order.
          </p>
        </div>
        {/* decorative glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#ef4d23]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ══════════════ LEFT — Menu ══════════════ */}
        <div className="xl:col-span-7 space-y-6">

          {/* Active person banner */}
          <AnimatePresence mode="wait">
            {activeMember !== null ? (
              <motion.div
                key="active-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl border-2"
                style={{ borderColor: memberColor(activeMember), background: `${memberColor(activeMember)}15` }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0"
                  style={{ background: memberColor(activeMember) }}
                >
                  {avatar(members[activeMember]?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Now ordering for</p>
                  <p className="text-white text-xl font-black truncate">{members[activeMember]?.name}</p>
                </div>
                <span className="text-white/30 text-sm hidden sm:block">
                  {members[activeMember]?.items.reduce((s, it) => s + it.qty, 0)} items • ₹{memberTotal(members[activeMember]).toFixed(0)}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="no-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-2xl px-6 py-4 border border-white/5 flex items-center gap-3 text-white/40"
              >
                <span className="material-symbols-outlined">info</span>
                <span className="text-sm font-medium">Add a person below, then select them to start ordering.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search + Filters */}
          <div className="space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
              <input
                type="text"
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                placeholder="Search menu items…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ef4d23] transition-colors"
              />
            </div>

            {/* Veg filter */}
            <div className="flex gap-2 flex-wrap">
              {[{ id:'all', label:'ALL' },{ id:'veg', label:'🟢 VEG' },{ id:'nonveg', label:'🔴 NON-VEG' }].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMenuFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${menuFilter === f.id ? 'bg-[#ef4d23] text-white' : 'glass-panel text-white/50 hover:text-white'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {visibleCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setMenuCat(cat.id)}
                  className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${menuCat === cat.id ? 'bg-white/15 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            {visibleItems.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center text-white/30">
                <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                No items found.
              </div>
            ) : visibleItems.map(item => {
              const qty = activeMemberQty(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-4 border border-white/5 hover:border-white/15 transition-all"
                >
                  {/* Image */}
                  <img
                    src={item.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=ef4d23&color=fff&size=64`}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=ef4d23&color=fff&size=64`; }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.item_type === 'veg' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <p className="text-white font-bold text-sm truncate">{item.name}</p>
                    </div>
                    <p className="text-white/40 text-xs truncate">{item.description || '—'}</p>
                  </div>

                  {/* Price */}
                  <span className="text-white font-black text-sm shrink-0">₹{item.price}</span>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 ? (
                      <>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          disabled={activeMember === null}
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="text-white font-black w-5 text-center">{qty}</span>
                      </>
                    ) : null}
                    <button
                      onClick={() => addItem(item)}
                      disabled={activeMember === null}
                      className="w-8 h-8 rounded-full bg-[#ef4d23] hover:scale-110 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-[#ef4d23]/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ RIGHT — Members + Summary ══════════════ */}
        <div className="xl:col-span-5 space-y-6">

          {/* Add Member */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h2 className="text-lg font-black text-white italic uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ef4d23]">group_add</span>
              Add Person
            </h2>
            <form onSubmit={handleAddMember} className="flex gap-3">
              <input
                ref={nameRef}
                type="text"
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                placeholder="Enter name…"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ef4d23] transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#ef4d23] text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </form>
            {nameError && (
              <p className="text-red-400 text-xs mt-2 font-medium">{nameError}</p>
            )}
          </div>

          {/* Members List with their orders */}
          {members.length > 0 && (
            <div className="space-y-4">
              {members.map((m, i) => (
                <motion.div
                  key={m.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl p-5 border-2 transition-all cursor-pointer ${activeMember === i ? 'border-opacity-100' : 'border-white/5 glass-panel hover:border-white/20'}`}
                  style={activeMember === i ? { borderColor: memberColor(i), background: `${memberColor(i)}12` } : {}}
                  onClick={() => setActiveMember(i)}
                >
                  {/* Member header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg shrink-0"
                      style={{ background: memberColor(i) }}
                    >
                      {avatar(m.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black truncate">{m.name}</p>
                      <p className="text-white/40 text-xs">{m.items.reduce((s, it) => s + it.qty, 0)} items</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-black">₹{memberTotal(m).toFixed(0)}</p>
                      {activeMember === i && (
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: memberColor(i) }}>Active</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMember(i); }}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 flex items-center justify-center transition-colors ml-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  {/* Item breakdown */}
                  {m.items.length > 0 && (
                    <div className="space-y-1.5 pl-13">
                      {m.items.map(it => (
                        <div key={it.id} className="flex justify-between items-center text-sm">
                          <span className="text-white/70 truncate max-w-[60%]">{it.qty}× {it.name}</span>
                          <span className="text-white/50 font-bold shrink-0">₹{(parseFloat(it.price) * it.qty).toFixed(0)}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/5 pt-1.5 flex justify-between text-xs font-black">
                        <span className="text-white/40 uppercase tracking-widest">Subtotal</span>
                        <span className="text-white">₹{memberTotal(m).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {m.items.length === 0 && activeMember === i && (
                    <p className="text-white/25 text-xs text-center py-2 uppercase tracking-widest">
                      ← Pick items from the menu
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Grand Total + Place Order */}
          {members.length > 0 && (
            <motion.div
              layout
              className="glass-panel rounded-3xl p-6 border border-white/5 shadow-2xl"
            >
              <div className="space-y-3 mb-6">
                {members.map((m, i) => (
                  <div key={m.name} className="flex justify-between items-center text-sm">
                    <span className="text-white/60 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: memberColor(i) }} />
                      {m.name}
                    </span>
                    <span className="text-white font-bold">₹{memberTotal(m).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/10 flex justify-between">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest">GST (5%)</span>
                  <span className="text-white/60 text-sm">₹{(grandTotal * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-xl font-black italic">Total</span>
                  <span className="text-[#ef4d23] text-3xl font-black italic">₹{(grandTotal * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeGroupOrder}
                disabled={placing || success}
                className="w-full bg-[#ef4d23] hover:scale-[1.02] active:scale-95 disabled:opacity-60 text-white py-5 rounded-2xl font-black text-lg italic tracking-tighter flex items-center justify-center gap-3 shadow-lg shadow-[#ef4d23]/20 transition-all duration-300"
              >
                {success ? (
                  <><span className="material-symbols-outlined">check_circle</span> Order Placed!</>
                ) : placing ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span> Placing…</>
                ) : (
                  <><span className="material-symbols-outlined">shopping_cart_checkout</span> Place Group Order ({members.length} {members.length === 1 ? 'person' : 'people'})</>
                )}
              </button>
            </motion.div>
          )}

          {/* Empty state */}
          {members.length === 0 && (
            <div className="glass-panel rounded-3xl p-10 text-center border border-white/5">
              <span className="material-symbols-outlined text-6xl text-white/10 mb-4 block">group</span>
              <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Add people above to start the group order</p>
            </div>
          )}
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-green-500/30 rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4"
            >
              <span className="material-symbols-outlined text-green-400 text-6xl mb-4 block">check_circle</span>
              <h3 className="text-white text-2xl font-black italic mb-2">Order Placed!</h3>
              <p className="text-white/50 text-sm">
                {members.filter(m => m.items.length > 0).length} orders have been sent to the kitchen.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
