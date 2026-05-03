import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE = 'http://127.0.0.1:8000/api';

// Confirmation modal
const ConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
    >
      <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">delete_sweep</span>
      <h3 className="text-white text-xl font-black italic mb-2">Start Fresh?</h3>
      <p className="text-zinc-400 text-sm mb-6">
        This will <strong className="text-red-400">permanently delete all orders</strong> and reset every metric to zero.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all">
          Yes, Reset
        </button>
      </div>
    </motion.div>
  </div>
);

const STATUS_COLORS = {
  PENDING:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  PREPARING: 'bg-blue-500/20   text-blue-300   border-blue-500/30',
  COMPLETED: 'bg-green-500/20  text-green-300  border-green-500/30',
  CANCELLED: 'bg-red-500/20    text-red-300    border-red-500/30',
};
const STATUS_NEXT = { PENDING: 'PREPARING', PREPARING: 'COMPLETED' };

// Format a Date object to match the key format
const fmtDate = (d) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Build a 7-day skeleton (always shows last 7 days including today)
const buildWeekSkeleton = () => {
  const rows = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = fmtDate(d);
    rows[key] = { date: key, count: 0, revenue: 0, totalAmount: 0 };
  }
  return rows;
};

const downloadCSV = (rows) => {
  const lines = [
    ['Date', 'Orders', 'Total Amount (All)', 'Revenue (Completed)'].join(','),
    ...rows.map(r =>
      [`"${r.date}"`, r.count, r.totalAmount.toFixed(2), r.revenue.toFixed(2)].join(',')
    ),
    '',
    ['"Weekly Total"',
      rows.reduce((s, r) => s + r.count, 0),
      rows.reduce((s, r) => s + r.totalAmount, 0).toFixed(2),
      rows.reduce((s, r) => s + r.revenue, 0).toFixed(2),
    ].join(','),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MINI_Honey_Weekly_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const Status = () => {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt,  setUpdatedAt]  = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── fetch all orders ──────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE}/orders/`);
      setOrders(res.data);
      setUpdatedAt(new Date());
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── clear all & start fresh ───────────────────────────
  const handleReset = async () => {
    setShowConfirm(false);
    setRefreshing(true);
    try {
      await axios.post(`${BASE}/orders/clear_all/`);
      setOrders([]);          // instant UI reset to zero
      setUpdatedAt(new Date());
    } catch (e) {
      console.error('Clear error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  // ── derived data (all memoised) ───────────────────────
  const weekRows = useMemo(() => {
    const skeleton = buildWeekSkeleton();
    orders.forEach(o => {
      // Parse server date in local timezone
      const key = fmtDate(new Date(o.created_at));
      if (skeleton[key]) {
        skeleton[key].count += 1;
        skeleton[key].totalAmount += parseFloat(o.total_amount || 0);
        if (o.status === 'COMPLETED')
          skeleton[key].revenue += parseFloat(o.total_amount || 0);
      }
    });
    return Object.values(skeleton); // always 7 entries
  }, [orders]);

  const hotItems = useMemo(() => {
    const counts = {};
    orders.forEach(o =>
      (o.items || []).forEach(oi => {
        const nm = oi.menu_item_name || `Item #${oi.menu_item}`;
        counts[nm] = (counts[nm] || 0) + (oi.quantity || 1);
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, units]) => ({ name, units }));
  }, [orders]);

  const metrics = useMemo(() => {
    const weeklyRevenue  = weekRows.reduce((s, r) => s + r.revenue, 0);
    const weeklyOrders   = weekRows.reduce((s, r) => s + r.count, 0);
    const pending        = orders.filter(o => o.status === 'PENDING').length;
    const completed      = orders.filter(o => o.status === 'COMPLETED').length;
    return [
      { title: 'Weekly Revenue',  value: `₹${weeklyRevenue.toFixed(2)}`,  icon: 'payments',        color: '#ef4d23' },
      { title: 'Weekly Orders',   value: weeklyOrders,                     icon: 'receipt_long',    color: '#f59e0b' },
      { title: 'Pending Now',     value: pending,                          icon: 'pending_actions', color: '#3b82f6' },
      { title: 'Completed',       value: completed,                        icon: 'check_circle',    color: '#10b981' },
    ];
  }, [weekRows, orders]);

  const maxRev   = useMemo(() => Math.max(...weekRows.map(r => r.revenue), 1), [weekRows]);
  const todayKey = useMemo(() => fmtDate(new Date()), []);

  // ── order actions ─────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await axios.post(`${BASE}/orders/${id}/update_status/`, { status });
      await fetchAll(false); // full refetch so metrics sync
    } catch (e) { console.error(e); }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`${BASE}/orders/${id}/`);
      await fetchAll(false); // full refetch so metrics & weekly rows sync
    } catch (e) { console.error(e); }
  };

  // ── render ────────────────────────────────────────────
  return (
    <div className="flex-1 p-4 md:p-8 min-h-screen">
      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            onConfirm={handleReset}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="font-display-lg text-4xl md:text-5xl text-white font-black tracking-tighter uppercase italic"
            >
              MINI Honey <span className="text-[#ef4d23]">Management</span>
            </motion.h1>
            <p className="text-zinc-400 text-sm mt-1">
              Weekly analytics — auto-refreshes every 30s
              {updatedAt && <span className="ml-2 text-zinc-600">· Updated {updatedAt.toLocaleTimeString()}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 shadow-lg shadow-red-600/20"
            >
              <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>
                {refreshing ? 'progress_activity' : 'restart_alt'}
              </span>
              {refreshing ? 'Resetting…' : 'New Start'}
            </button>
            <button
              onClick={() => fetchAll()}
              className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl text-white/70 hover:text-white text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              Sync
            </button>
            <div className="bg-[#1c1b1b] px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl hover:border-white/15 transition-all"
            >
              <div className="p-3 rounded-xl w-fit mb-4" style={{ background: `${m.color}20` }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: m.color }}>{m.icon}</span>
              </div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">{m.title}</p>
              <h2 className="text-3xl font-black text-white tracking-tighter italic">
                {loading ? '—' : m.value}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* Chart + Hot Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-black text-white italic mb-6">Weekly Revenue (Last 7 Days)</h3>
            <div className="h-48 flex items-end gap-2 md:gap-3 px-1">
              {weekRows.map((row, i) => {
                const pct     = row.revenue > 0 ? (row.revenue / maxRev) * 100 : 0;
                const isToday = row.date === todayKey;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                    <span className="text-white/70 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{row.revenue.toFixed(0)}
                    </span>
                    <div className="w-full relative" style={{ height: 140 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, pct > 0 ? 6 : 2)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.07 }}
                        className={`absolute bottom-0 w-full rounded-t-lg transition-colors
                          ${isToday ? 'bg-[#ef4d23]' : 'bg-[#ef4d23]/30 group-hover:bg-[#ef4d23]/60'}`}
                      />
                    </div>
                    <span className={`text-[9px] font-black uppercase text-center leading-tight ${isToday ? 'text-[#ef4d23]' : 'text-zinc-600'}`}>
                      {row.date.split(' ').slice(0, 2).join('\n')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hot Items */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-black text-white italic mb-4">🔥 Top Items</h3>
            {hotItems.length === 0 ? (
              <p className="text-white/20 text-xs uppercase tracking-widest text-center py-10">No order data yet</p>
            ) : hotItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#ef4d23]/30 transition-all mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#ef4d23] font-black text-sm w-5">#{i + 1}</span>
                  <p className="font-bold text-white text-sm truncate max-w-[120px]">{item.name}</p>
                </div>
                <span className="text-zinc-400 text-xs font-bold shrink-0">{item.units} sold</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white italic">Live Orders</h3>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{orders.length} total</span>
          </div>

          {orders.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center border border-white/5">
              <span className="material-symbols-outlined text-5xl text-white/10 mb-3 block">receipt_long</span>
              <p className="text-white/25 text-xs uppercase tracking-widest">No orders placed yet</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      {['Order', 'Customer', 'Date', 'Items', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...orders].reverse().slice(0, 30).map(order => (
                      <React.Fragment key={order.id}>
                        <tr
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        >
                          <td className="px-4 py-4 text-white font-bold">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-zinc-600">
                                {expandedId === order.id ? 'expand_less' : 'expand_more'}
                              </span>
                              #{order.id}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-white/80 font-medium text-sm whitespace-nowrap">{order.customer_name}</td>
                          <td className="px-4 py-4 text-zinc-500 text-xs whitespace-nowrap">
                            {fmtDate(new Date(order.created_at))}
                          </td>
                          <td className="px-4 py-4 text-zinc-400 text-sm">
                            {(order.items || []).length} item{order.items?.length !== 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-4 text-[#ef4d23] font-black italic whitespace-nowrap">
                            ₹{parseFloat(order.total_amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${STATUS_COLORS[order.status] || 'text-zinc-500'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              {STATUS_NEXT[order.status] && (
                                <button
                                  onClick={() => updateStatus(order.id, STATUS_NEXT[order.status])}
                                  className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-[#ef4d23] text-white text-xs font-bold transition-all whitespace-nowrap"
                                >
                                  → {STATUS_NEXT[order.status]}
                                </button>
                              )}
                              {!['CANCELLED', 'COMPLETED'].includes(order.status) && (
                                <button
                                  onClick={() => updateStatus(order.id, 'CANCELLED')}
                                  className="px-2 py-1.5 rounded-lg text-zinc-500 hover:text-yellow-400 text-xs font-bold transition-all hover:bg-yellow-500/10"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                onClick={() => deleteOrder(order.id)}
                                className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Remove order"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded items row */}
                        <AnimatePresence>
                          {expandedId === order.id && (
                            <tr key={`exp-${order.id}`}>
                              <td colSpan={7} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden bg-white/[0.02] border-t border-white/5"
                                >
                                  <div className="px-8 py-4">
                                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">
                                      Items — {order.customer_name}
                                    </p>
                                    {(order.items || []).length === 0 ? (
                                      <p className="text-zinc-600 text-sm italic">No items recorded.</p>
                                    ) : order.items.map((oi, idx) => (
                                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                                        <span className="text-white/70 text-sm">
                                          {oi.quantity}× {oi.menu_item_name || `Item #${oi.menu_item}`}
                                        </span>
                                        <span className="text-[#ef4d23] font-bold text-sm">
                                          ₹{(parseFloat(oi.menu_item_price || 0) * oi.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between pt-2 border-t border-white/10 mt-1">
                                      <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Total (incl. GST)</span>
                                      <span className="text-white font-black">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Revenue Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-black text-white italic">Weekly Revenue Report</h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                {weekRows[0]?.date} → {weekRows[6]?.date}
              </p>
            </div>
            <button
              onClick={() => downloadCSV(weekRows)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ef4d23] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download Excel
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Orders</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Total Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Revenue (Completed)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {weekRows.map((row, i) => {
                  const isToday = row.date === todayKey;
                  return (
                    <tr key={i} className={`transition-colors ${isToday ? 'bg-[#ef4d23]/5' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-4 font-bold">
                        <span className={isToday ? 'text-[#ef4d23]' : 'text-white'}>{row.date}</span>
                        {isToday && (
                          <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-[#ef4d23] bg-[#ef4d23]/10 px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black ${row.count > 0 ? 'text-white' : 'text-zinc-700'}`}>{row.count}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${row.totalAmount > 0 ? 'text-white' : 'text-zinc-700'}`}>
                          ₹{row.totalAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-black italic text-lg ${row.revenue > 0 ? 'text-[#ef4d23]' : 'text-zinc-700'}`}>
                          ₹{row.revenue.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-white/5 border-t border-white/10">
                <tr>
                  <td className="px-6 py-4 font-black text-white text-sm uppercase tracking-widest">Weekly Total</td>
                  <td className="px-6 py-4 text-center font-black text-white">
                    {weekRows.reduce((s, r) => s + r.count, 0)}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-white">
                    ₹{weekRows.reduce((s, r) => s + r.totalAmount, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-[#ef4d23] italic text-xl">
                    ₹{weekRows.reduce((s, r) => s + r.revenue, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Status;
