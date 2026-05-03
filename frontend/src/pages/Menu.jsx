import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState([]);
  
  // Admin UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '-',
    price: '',
    category: '',
    item_type: 'veg',
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        axios.get('/api/categories/'),
        axios.get('/api/menu-items/')
      ]);
      setCategories(catRes.data);
      setMenuItems(itemRes.data);
      if (catRes.data.length > 0) setActiveCategory(catRes.data[0].id);
    } catch (err) {
      console.error("Error fetching menu data", err);
      // Fallback static data if API fails (Step 5)
      setCategories([{ id: 1, name: 'MAGGI' }, { id: 2, name: 'DRINKS' }]);
      setMenuItems([
        { id: 1, name: 'Veg Maggi', description: 'Classic veg maggi', price: 49, category: 1, is_available: true, item_type: 'veg' },
        { id: 2, name: 'Chicken Maggi', description: 'Classic chicken maggi', price: 79, category: 1, is_available: true, item_type: 'nonveg' },
      ]);
      setActiveCategory(1);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Admin CRUD operations
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '-',
      price: '',
      category: categories.length > 0 ? categories[0].id : '',
      item_type: 'veg',
      is_available: true
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      item_type: item.item_type || 'veg',
      is_available: item.is_available
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/api/menu-items/${id}/`);
        setMenuItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error("Error deleting item", err);
        alert('Error deleting item');
      }
    }
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        const res = await axios.put(`/api/menu-items/${editingItem.id}/`, formData);
        setMenuItems(prev => prev.map(item => item.id === editingItem.id ? res.data : item));
      } else {
        const res = await axios.post(`/api/menu-items/`, formData);
        setMenuItems(prev => [...prev, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving item", err);
      alert('Error saving item');
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const totalAmount = subtotal * 1.05; // 5% GST
      const orderData = {
        customer_name: 'Walk-in Customer',
        status: 'PENDING',
        total_amount: totalAmount.toFixed(2),
        is_group_order: false,
        items: cart.map(item => ({
          menu_item: item.id,
          quantity: item.quantity
        }))
      };
      await axios.post('/api/orders/', orderData);
      alert('Order placed successfully!');
      setCart([]);
    } catch (err) {
      console.error("Error placing order", err);
      alert('Error placing order');
    }
  };

  const visibleCategories = categories.filter(cat => 
    menuItems.some(item => 
      item.category === cat.id && 
      (filter === 'all' ? true : item.item_type === filter)
    )
  );

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    const matchesFilter = filter === "all" ? true : item.item_type === filter;
    return matchesCategory && matchesFilter;
  });

  return (
    <div className="flex-1 w-full pb-32 px-4 md:px-8 space-y-stack-lg">
      <CategoryBar 
        categories={visibleCategories} 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
      />

      <div className="flex justify-center gap-4 mb-8">
        {[
          { id: 'all', label: 'ALL' }, 
          { id: 'veg', label: 'VEG' }, 
          { id: 'nonveg', label: 'NON-VEG' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setActiveCategory(null);
            }}
            className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
              filter === f.id ? 'bg-[#ef4d23] text-white' : 'glass-panel text-white/60 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="relative h-48 rounded-3xl overflow-hidden mt-2 flex items-end p-8">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Gourmet Hero" 
            className="w-full h-full object-cover brightness-50" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTZ0J3QdV16YVyPFkBFTgfmfaeBJkj4s14zrOyiyn1dswX_zWFLVan5Pku_guQywT3WEWs4oCslUija_jIW4AcE4YFRBOCE6yHUItjoFUprZbCYrNaSxCzVqZaQVn-H7MrNiZeMJm3cdlAcx_HT3PGWoTiLza7KzApvdzAoL5fkSNl27m3f9T-DPbQrbNJ5bqepuXUE_4OD8kK8j9Y04h4ILm5d0bZvfyTXiPCiNfqCH5jU9LrRZxo94EbaSCa-QBvm1D6ynRGihi-"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-white font-display-lg text-4xl md:text-5xl font-black italic uppercase">Gourmet Selection</h1>
          <p className="text-zinc-300 text-lg font-medium opacity-80 italic">Manage your honey-themed menu with precision.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-8">
            <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border-l-4 border-[#ef4d23]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#ef4d23]/20 rounded-full flex items-center justify-center text-[#ef4d23]">
                  <span className="material-symbols-outlined">restaurant_menu</span>
                </div>
                <span className="text-2xl font-bold text-white uppercase tracking-tight italic">
                  {activeCategory ? (categories.find(c => c.id === activeCategory)?.name || 'All Items') : 'Full Menu'}
                </span>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-white/10 hover:bg-[#ef4d23] text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Add Item
              </button>
            </div>
            
            {activeCategory ? (
              <div className="flex flex-col gap-3">
                {filteredItems.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    item={item} 
                    cartQuantity={cart.find(i => i.id === item.id)?.quantity || 0}
                    onAdd={addToCart} 
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {visibleCategories.map(cat => {
                  const catItems = filteredItems.filter(item => item.category === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-4">
                      <h3 className="text-xl font-black text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
                        {cat.name}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {catItems.map((item) => (
                          <ProductCard 
                            key={item.id} 
                            item={item} 
                            cartQuantity={cart.find(i => i.id === item.id)?.quantity || 0}
                            onAdd={addToCart} 
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 h-fit sticky top-24">
          <Cart 
            cartItems={cart} 
            onUpdate={updateQuantity} 
            onRemove={removeFromCart} 
            onPlaceOrder={placeOrder} 
          />
        </div>
      </div>

      {/* Admin Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-black text-white italic mb-6">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 block">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 block">Item Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23]"
                  placeholder="E.g., Veg Maggi"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 block">Type (Optional)</label>
                <input 
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23]"
                  placeholder="E.g., Wet, Fried, -"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 block">Price</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23]"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 block">Diet Type</label>
                  <select 
                    value={formData.item_type}
                    onChange={e => setFormData({...formData, item_type: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ef4d23]"
                  >
                    <option value="veg">🟢 Veg</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveItem}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#ef4d23] hover:scale-105 transition-all shadow-lg shadow-[#ef4d23]/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
