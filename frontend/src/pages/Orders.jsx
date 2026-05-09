import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('single');
  const { cart, clearCart, total, subtotal, isHydrated } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/api/orders/');
      setOrders(res.data);
    } catch (err) {
      if (!silent) showToast('Failed to load orders', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000); // Poll silently every 15s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const orderData = {
        customer_name: 'Walk-in Customer',
        status: 'PENDING',
        total_amount: total.toFixed(2),
        is_group_order: false,
        items: cart.map(item => ({
          menu_item: item.id,
          quantity: item.quantity
        }))
      };
      await api.post('/api/orders/', orderData);
      showToast('Order placed successfully!');
      clearCart();
      fetchOrders(true);
    } catch (err) {
      showToast('Error placing order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.post(`/api/orders/${id}/update_status/`, { status });
      showToast(`Order status updated to ${status}`);
      fetchOrders(true);
    } catch (err) {
      showToast('Error updating order status', 'error');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Permanently delete this order record?')) return;
    try {
      await api.delete(`/api/orders/${id}/`);
      showToast('Order deleted');
      fetchOrders(true);
    } catch (err) {
      showToast('Error deleting order', 'error');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Marquee Animation Section */}
      <div className="w-full bg-[#121212]/30 py-4 overflow-hidden border-b border-white/5 whitespace-nowrap">
        <div className="flex gap-8 animate-marquee">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <img 
              key={i}
              alt={`Food ${i}`} 
              className="h-24 w-32 object-cover rounded-xl hover:grayscale-0 transition-all duration-500" 
              src={`https://lh3.googleusercontent.com/aida-public/AB6AXuBvcvXdI10l7TdNgi0EY6nw4_vgNH9X5Msjr9D2SkpXUVDxbEo6pzZyOCAP_3HLXFkRi5-cHU9x1pUgTv2OR5H5L2RCkmikeKeJ1N404aHR3KdP25urszMfZt8pC9scoqpNK6Pzwspe4tN9mxE1rgXChzql-Ai58xN1077P8tFCuSSpaa0F_krmdMqSJmLYBI1rC4ITfHvfpSj-4PuvtpJRdx-kySmkMUHB1uVR9Fp_hph98ADZbBcaHdFzQmH5cHKjKCBgZRlhOXMr`}
            />
          ))}
        </div>
      </div>

      {/* Cart Quick View */}
      <section className="max-w-7xl mx-auto px-8 py-4">
        <div className="glass-panel rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-[#ef4d23]/30">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#ef4d23] text-3xl">local_mall</span>
            <div>
              <h2 className="font-bold text-white uppercase text-xs tracking-widest">Current Order</h2>
              <p className="text-white/40 text-sm mt-0.5">{cart.reduce((acc, i) => acc + i.quantity, 0)} items • Pickup in 25 mins</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-xs text-white/40 block font-bold uppercase tracking-wider">Estimated Total</span>
              <span className="text-3xl font-black text-[#ef4d23] tracking-tighter italic">₹{total.toFixed(2)}</span>
            </div>
            <button 
              onClick={placeOrder}
              className="bg-[#ef4d23] text-white px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <section className="space-y-12">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display-lg text-5xl md:text-6xl text-[#ef4d23] font-black italic tracking-tighter"
              >
                Your Orders
              </motion.h1>
              <p className="text-zinc-400 text-lg mt-2 font-medium">Configure your meal or start a collective feast.</p>
            </div>
            <div className="glass-panel p-1.5 rounded-xl flex border border-white/5">
              <button 
                onClick={() => setActiveTab('single')}
                className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'single' ? 'bg-[#ef4d23] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
              >
                Single Orders
              </button>
              <button 
                onClick={() => setActiveTab('group')}
                className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'group' ? 'bg-[#ef4d23] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
              >
                Group Orders
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-panel rounded-2xl p-8 space-y-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ef4d23]">shopping_basket</span>
                  Active Orders List
                </h3>
                
                <div className="space-y-4">
                  {/* Show Current Cart Selections first */}
                  {cart.length > 0 && isHydrated && (
                    <div className="space-y-4 mb-8">
                      <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest px-1">Selected from Menu</h4>
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 glass-panel rounded-xl border-l-2 border-[#ef4d23] bg-[#ef4d23]/5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#ef4d23]/10 rounded-lg flex items-center justify-center text-[#ef4d23] font-bold">
                              {item.quantity}x
                            </div>
                            <div>
                              <h5 className="text-white font-bold">{item.name}</h5>
                              <p className="text-xs text-zinc-500 italic">Ready to order</p>
                            </div>
                          </div>
                          <span className="text-xl font-black text-[#ef4d23]">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {loading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 glass-panel rounded-xl animate-pulse bg-white/5"></div>
                      ))}
                    </div>
                  ) : (
                    <AnimatePresence mode='popLayout'>
                      {orders.length === 0 && cart.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-20 bg-white/[0.02] rounded-2xl border border-dashed border-white/10"
                        >
                          <span className="material-symbols-outlined text-5xl text-zinc-600">receipt_long</span>
                          <p className="text-zinc-500 mt-4 font-bold">No active orders found</p>
                        </motion.div>
                      ) : (
                        orders.filter(o => activeTab === 'single' ? !o.is_group_order : o.is_group_order).map((order) => (
                          <motion.div 
                            key={order.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center justify-between p-5 glass-panel rounded-xl hover:bg-white/5 transition-all border border-white/5 group"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-[#ef4d23] font-black text-xl italic shadow-inner">
                                #{order.id.toString().slice(-2)}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-white group-hover:text-[#ef4d23] transition-colors">
                                  {order.items?.length || 0} Items
                                </h4>
                                <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{order.status}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <span className="text-2xl font-black text-[#ef4d23] italic">₹{order.total_amount}</span>
                              <div className="flex items-center bg-zinc-900 rounded-full px-3 py-1.5 gap-4 border border-white/10">
                                {order.status !== 'CANCELLED' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'CANCELLED')} 
                                    className="text-red-500 hover:text-red-400 flex items-center" 
                                    title="Cancel Order"
                                  >
                                    <span className="material-symbols-outlined text-xl">cancel</span>
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteOrder(order.id)}
                                  className="text-zinc-500 hover:text-red-500 flex items-center"
                                  title="Delete Order Record"
                                >
                                  <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                                <span className="material-symbols-outlined text-[#ef4d23] text-xl">visibility</span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Special Instructions</label>
                  <textarea 
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-5 text-white focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23] outline-none transition-all resize-none h-32 leading-relaxed" 
                    placeholder="Any allergies or preferences?"
                  />
                </div>
              </div>

              {/* Group Order Preview */}
              <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border border-[#ef4d23]/20 shadow-2xl bg-[#ef4d23]/5">
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-[#ef4d23] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#ef4d23]/20">Live Sync</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                   <span className="material-symbols-outlined text-[#ef4d23]">groups</span>
                   Group Order Status
                </h3>
                
                {orders.filter(o => o.is_group_order).length > 0 ? (
                  <>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="flex -space-x-3">
                        {orders.filter(o => o.is_group_order).slice(0, 4).map((o, i) => (
                          <div key={o.id} className="w-12 h-12 rounded-full border-4 border-[#1a1a1a] bg-zinc-800 flex items-center justify-center text-sm font-black text-white shadow-xl ring-1 ring-white/10 overflow-hidden">
                            <span className="material-symbols-outlined text-xs">person</span>
                          </div>
                        ))}
                      </div>
                      <div className="h-10 w-px bg-white/10"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Status</span>
                        <span className="text-[#ef4d23] font-black text-sm uppercase tracking-widest">In Kitchen</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.filter(o => o.is_group_order).slice(0, 2).map(order => (
                        <div key={order.id} className="p-5 glass-panel rounded-xl border border-white/5 bg-black/20 hover:border-[#ef4d23]/30 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white truncate max-w-[100px]">{order.customer_name}</span>
                            <span className="font-black text-[#ef4d23]">₹{order.total_amount}</span>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium leading-relaxed truncate">
                            {order.items?.length || 0} Items • {order.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">group_off</span>
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest">No active group orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="glass-panel-heavy rounded-2xl p-8 sticky top-24 space-y-8 shadow-2xl border border-white/10 bg-zinc-950/40">
                <h3 className="text-2xl font-black text-white border-b border-white/5 pb-6 italic flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ef4d23]">receipt</span>
                  Order Summary
                </h3>
                <div className="space-y-5">
                  <div className="flex justify-between text-zinc-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                    <span className="text-white text-xl font-bold">Total</span>
                    <span className="text-[#ef4d23] text-4xl font-black italic tracking-tighter">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={placeOrder}
                    disabled={cart.length === 0}
                    className="w-full bg-[#ef4d23] hover:scale-105 active:scale-95 transition-all duration-300 py-5 rounded-2xl text-white font-black text-xl shadow-[0_0_30px_rgba(239,77,35,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  >
                    Place Order
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <Link to="/management" className="w-full glass-panel hover:bg-white/10 transition-all py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined">group_add</span>
                    Convert to Group Order
                  </Link>
                </div>
                <div className="pt-6 space-y-4">
                  <h4 className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">Store Location</h4>
                  <div className="rounded-2xl overflow-hidden h-40 relative group border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPjHy8Fi0J33lDceVCIvXWIIN8lj8w4EdaNtQhoOTh_OZPEGG-vFEE9meEZDl9Cbt_EZttduGZYJxxDhIqplZi_F69agVoDQots1IR3vtRh0ZFbrsc_yWkSG5eenpP-CcHMXLZZPmH8rDl3ozUAImG5E9BdFBMD0ApxsOyObamq_KhGxmHdfzTBigJTvkAh2Zx7AFFYBXp_j2ZFxraOdP-LF_4F7WFfriR8ml_ndaNYaipa1anynHlnANTYDDhloITjI8OGgDeyC0C"
                      alt="Store Location"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <p className="text-sm text-white font-black uppercase tracking-tighter italic">MINI Honey Central</p>
                      <p className="text-xs text-[#ef4d23] font-bold">Estimated: 25 mins</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Loading Overlay */}
      <AnimatePresence>
        {isPlacingOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#131313]/80 backdrop-blur-md flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#ef4d23]/20 border-t-[#ef4d23] rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-widest">Placing Your Order...</h2>
              <p className="text-zinc-400 mt-2 font-bold uppercase text-xs tracking-widest">Connecting to our kitchen</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
