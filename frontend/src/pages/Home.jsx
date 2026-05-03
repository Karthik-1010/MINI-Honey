import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api/menu-items/';

const EMPTY_FORM = { name: '', price: '', description: '', image_url: '', category: '', item_type: 'veg', is_available: true };

const Home = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = React.useRef();

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  const fetchDishes = async () => {
    try {
      const res = await axios.get(API);
      setDishes(res.data.slice(0, 8));
    } catch {
      setDishes(FALLBACK_DISHES);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/categories/');
      setCategories(res.data);
    } catch {}
  };

  const openAdd = () => {
    setEditingDish(null);
    setImagePreview(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.id || '' });
    setIsModalOpen(true);
  };

  const openEdit = (dish) => {
    setEditingDish(dish);
    setImagePreview(dish.image_url || null);
    setForm({
      name: dish.name,
      price: dish.price,
      description: dish.description || '',
      image_url: dish.image_url || '',
      category: dish.category,
      item_type: dish.item_type || 'veg',
      is_available: dish.is_available ?? true,
    });
    setIsModalOpen(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    // Upload to backend
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/upload-image/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, image_url: res.data.url }));
    } catch {
      // Keep local preview; image_url stays blank (will show placeholder)
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      if (editingDish) {
        const res = await axios.put(`${API}${editingDish.id}/`, form);
        setDishes(prev => prev.map(d => d.id === editingDish.id ? res.data : d));
      } else {
        const res = await axios.post(API, form);
        setDishes(prev => [res.data, ...prev].slice(0, 8));
      }
      setIsModalOpen(false);
    } catch {
      alert('Error saving item. Check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}${id}/`);
      setDishes(prev => prev.filter(d => d.id !== id));
      setDeleteConfirm(null);
    } catch {
      alert('Error deleting item.');
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[921px] w-full flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-container-margin max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="mb-stack-md glass-panel rounded-full text-[#ef4d23] font-label-bold tracking-widest flex items-center px-8 py-3 text-lg gap-3">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
            MINI Honey
          </div>
          <h1 className="font-display-lg text-6xl md:text-[80px] leading-[1.1] text-white mb-stack-md font-extrabold tracking-tighter italic uppercase">
            Feel Fresh and <br/>
            <span className="text-[#ef4d23]">Eat Fresh</span>
          </h1>
          <p className="font-body-lg text-lg text-white/80 mb-stack-lg max-w-2xl leading-relaxed">
            Experience the finest ingredients with a touch of honey. Our urban kitchen brings gourmet delicacies straight to your doorstep.
          </p>
          <Link to="/menu" className="bg-[#ef4d23] text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_10px_30px_rgba(239,77,35,0.4)] flex items-center gap-3">
            Order Now
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </motion.div>
      </section>

      {/* Signature Dishes Section */}
      <section className="relative -mt-32 pb-stack-lg pr-8 overflow-hidden z-20 px-8">
        <div className="flex items-end justify-between mb-stack-md pr-8">
          <div>
            <p className="text-[#ef4d23] font-black uppercase tracking-[0.3em] text-xs mb-2">Today's Specials</p>
            <h2 className="font-display-lg text-4xl text-white font-black italic uppercase tracking-tight">Signature Dishes</h2>
          </div>
          <div className="flex gap-2">
            {/* Add Item Button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ef4d23] text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/30"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Item
            </button>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-10 px-2 -mx-2">
          {dishes.map((dish, i) => (
            <motion.div
              key={dish.id ?? i}
              whileHover={{ y: -10 }}
              className="flex-none w-[320px] glass-panel rounded-2xl p-5 group transition-all duration-300 hover:bg-white/15 border border-white/5 relative"
            >
              {/* Edit / Delete controls */}
              <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => openEdit(dish)}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#ef4d23] transition-colors"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm(dish)}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>

              <div className="relative h-64 w-full rounded-xl overflow-hidden mb-5">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={dish.image_url || dish.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(dish.name)}&background=ef4d23&color=fff&size=320`}
                  alt={dish.name || dish.title}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dish.name || 'Item')}&background=ef4d23&color=fff&size=320`; }}
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black text-white border border-white/10 italic">
                  ₹{dish.price || dish.price}
                </div>
                {/* Veg / Non-Veg badge */}
                <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold border ${dish.item_type === 'veg' ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-red-500/20 border-red-400 text-red-300'}`}>
                  {dish.item_type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                </div>
              </div>
              <h3 className="font-display-lg text-2xl text-white mb-2 leading-tight font-black uppercase tracking-tight">{dish.name || dish.title}</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed font-medium">{dish.description || dish.desc}</p>
              <Link to="/menu" className="block w-full py-4 text-center rounded-xl border-2 border-[#ef4d23]/30 text-[#ef4d23] font-black uppercase tracking-widest text-xs hover:bg-[#ef4d23] hover:text-white transition-all shadow-lg shadow-[#ef4d23]/10">
                Add to Cart
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAB */}
      <Link to="/menu" className="fixed bottom-24 md:bottom-10 right-10 w-20 h-20 bg-[#ef4d23] text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,77,35,0.6)] hover:scale-110 transition-transform active:scale-95 z-50 border-4 border-[#131313]">
        <span className="material-symbols-outlined text-4xl">restaurant_menu</span>
      </Link>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h2 className="text-2xl font-black text-white italic mb-6 uppercase tracking-tight">
                {editingDish ? 'Edit Dish' : 'Add New Dish'}
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 block">Item Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                    placeholder="e.g. Veg Maggi"
                  />
                </div>
                {/* Price */}
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 block">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                    placeholder="0"
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors resize-none"
                    placeholder="Short description of the dish…"
                  />
                </div>
                {/* Image Upload */}
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 block">Dish Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full rounded-xl border-2 border-dashed border-white/20 hover:border-[#ef4d23] transition-colors cursor-pointer overflow-hidden"
                    style={{ minHeight: imagePreview ? 'auto' : '120px' }}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined">photo_camera</span> Change Photo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-28 gap-2 text-white/40 hover:text-white/70 transition-colors">
                        <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs">PNG, JPG, WEBP accepted</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                {/* Category + Type row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 block">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 block">Type</label>
                    <select
                      value={form.item_type}
                      onChange={e => setForm({ ...form, item_type: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23] transition-colors"
                    >
                      <option value="veg">🟢 Veg</option>
                      <option value="nonveg">🔴 Non-Veg</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-[#ef4d23] hover:scale-105 transition-all shadow-lg shadow-[#ef4d23]/20 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingDish ? 'Update' : 'Add Dish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-400 text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Delete Dish?</h3>
              <p className="text-white/50 text-sm mb-6">
                "<span className="text-white font-semibold">{deleteConfirm.name}</span>" will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

const FALLBACK_DISHES = [
  { id: 'f1', name: "Honey Glazed Avocado", price: "18.50", description: "Smashed organic avocado, chili flakes, and local wildflower honey.", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf3BvFJQ2crxWFt16o3247zeHSHEroiGAWud7xHzJSv19uGv5tDvNdS1Hqq0XSYChaY3Wiu0ga-44hdJwWZwyLJ5EuSc0v7mpZ3ZqQNMTLXlzlMGpy3kK4CjRj6xzR66_LF_2_ZmBI1Xxp0z7nzL4bOBesKayF-sQk05kyuU2tRS92Fj9j9UdT2UDTCtip1O_Sy7sUeFDOs9kC3VM5gxMh9HswbePAnOpl0FdDk4gwPVaieGSixNA5IIva6tk2EAi4PI1rECd-O1ND", item_type: 'veg' },
  { id: 'f2', name: "Seared Honey Salmon", price: "24.90", description: "Wild-caught salmon with a caramelized honey glaze and greens.", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXg-cTyhWCkgH-nqSSrOdCnl9lFZTNZfOp7LokaMxqb1e7ken6H0YAZ1fx2MMlRqoHYEXx8D6Kh5jvFp4X4g5aMTc882Zqg36-yCrMJ4h9Kq0xDevcD1bkIMPS_ey8hWzDPjbNS-DJtKc9vezNh1zheY2tRwt4Oc2lupDVxLWeHoRdi9qUSO1Kh0PhvarnXyvu8-z3xaYpMoJZcAi2p325VO_Kx4q2usYjWsOS6qadXffIP2pxkRHTqbElAnwRMxpAlU6F8gCEmYc5", item_type: 'nonveg' },
  { id: 'f3', name: "Pomegranate Bowl", price: "15.20", description: "Fresh seasonal pomegranate seeds with goat cheese and nuts.", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3jlefVJ54c4G2A2Jm9vz3ExmmUiqxfOObaIk5WmGukw2SM2rwv7kXFg3nf9dcBGcPUQd1bsmUKQHXuDPtxQd9Mc4fmSAnKfziZAsY8Q8_gpMttEEzHVUvRyaLiT_0FlJXaKHMqgrpSV4W8DJ3J9rXUHnfNHswu3SS5Ji1eZtD70XfFwJE8HIpjU-XOLQuoTYrc8KOyL8WayaURXkodLwZ8DczXkDl8HEZxKxYksu49vYjwtVm8hsROzNFodppfxRY29DS5W69NGrm", item_type: 'veg' },
  { id: 'f4', name: "Honey Dust Donut", price: "12.00", description: "Hand-made brioche donut with pure honey glaze and silver leaf.", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5fRjwST10e_AAE9J4Z0ajTM-9TDAbZ_NWProZ09QsK0TuoiGyMQr9aYmdI49NzbqaBNSXyiDx1xgG65HSA5T5h4PaQmN4Vqa-H0byGuvwZwYcfJQMr_LFxOR2H9NKPFOiQEfGDpiCduyU3TjHYQ0MDJVebu8ha7fD-1_Tj4XtpHezNAXrFa9SKxBDduUhq131WFS65jVAHZ-t6FRkMRqsmuFM4E8PQy_5-mJpVbVgtUj45AscdQ_XqkB2AQM4xXYIKNPsYVbyvOER", item_type: 'veg' },
];
