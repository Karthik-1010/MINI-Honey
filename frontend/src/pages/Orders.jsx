import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('single');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/');
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.patch(`/api/orders/${id}/`, { status });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status", err);
      alert("Error updating order status");
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
              <p className="text-white/40 text-sm mt-0.5">3 items • Pickup in 25 mins</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-xs text-white/40 block font-bold uppercase tracking-wider">Estimated Total</span>
              <span className="text-3xl font-black text-[#ef4d23] tracking-tighter italic">₹699.99</span>
            </div>
            <button className="bg-[#ef4d23] text-white px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20">
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
                  {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                      <span className="material-symbols-outlined text-5xl text-zinc-600">receipt_long</span>
                      <p className="text-zinc-500 mt-4 font-bold">No active orders found</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
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
                                className="text-red-500 hover:text-red-400" 
                                title="Cancel Order"
                              >
                                <span className="material-symbols-outlined text-xl">cancel</span>
                              </button>
                            )}
                            <span className="material-symbols-outlined text-[#ef4d23] text-xl">visibility</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
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
              <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border border-[#ef4d23]/20 shadow-2xl">
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-[#ef4d23]/20 text-[#ef4d23] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Experimental</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-6">Group Order Status</h3>
                <div className="flex -space-x-3 mb-8">
                  {['JD', 'AS', 'MK'].map((init, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background glass-panel flex items-center justify-center text-sm font-black text-white shadow-xl">
                      {init}
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-background bg-[#ef4d23] flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 glass-panel-heavy rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-white text-lg">John Doe</span>
                      <span className="text-lg font-black text-[#ef4d23]">₹185.0</span>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">1x Spicy Salmon Bowl</p>
                  </div>
                  <div className="p-5 glass-panel-heavy rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-white text-lg">Alice Smith</span>
                      <span className="text-lg font-black text-[#ef4d23]">₹240.0</span>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">1x Truffle Honey Pizza, 1x Coke</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="glass-panel-heavy rounded-2xl p-8 sticky top-24 space-y-8 shadow-2xl border border-white/10 bg-zinc-950/40">
                <h3 className="text-2xl font-black text-white border-b border-white/5 pb-6 italic">Order Summary</h3>
                <div className="space-y-5">
                  <div className="flex justify-between text-zinc-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹625.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 font-medium">
                    <span>Delivery Fee</span>
                    <span className="text-white font-bold">₹49.99</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 font-medium">
                    <span>Service Charge</span>
                    <span className="text-white font-bold">₹25.00</span>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                    <span className="text-white text-xl font-bold">Total</span>
                    <span className="text-[#ef4d23] text-4xl font-black italic tracking-tighter">₹699.99</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <button className="w-full bg-[#ef4d23] hover:scale-105 active:scale-95 transition-all duration-300 py-5 rounded-2xl text-white font-black text-xl shadow-[0_0_30px_rgba(239,77,35,0.4)] flex items-center justify-center gap-3">
                    Place Order
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button className="w-full glass-panel hover:bg-white/10 transition-all py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined">group_add</span>
                    Convert to Group Order
                  </button>
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
    </div>
  );
};

export default Orders;
