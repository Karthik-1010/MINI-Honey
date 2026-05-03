import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
      <header className="sticky top-0 w-full z-50 flex justify-between items-center px-8 py-5 bg-[#121212]/60 backdrop-blur-[20px] border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] font-['Epilogue'] antialiased">
        <div className="flex items-center h-12">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="MINI Honey Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-[#ef4d23]/20" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://ui-avatars.com/api/?name=MH&background=ef4d23&color=fff&rounded=xl&bold=true";
              }}
            />
            <span className="font-display-lg text-2xl text-white tracking-tighter font-black italic uppercase">MINI Honey</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/menu" className={({ isActive }) => isActive ? "text-[#ef4d23] font-bold border-b-2 border-[#ef4d23] pb-1 transition-all" : "text-white/70 font-medium hover:text-white hover:scale-105 transition-all"}>Menu</NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? "text-[#ef4d23] font-bold border-b-2 border-[#ef4d23] pb-1 transition-all" : "text-white/70 font-medium hover:text-white hover:scale-105 transition-all"}>Orders</NavLink>
          <NavLink to="/management" className={({ isActive }) => isActive ? "text-[#ef4d23] font-bold border-b-2 border-[#ef4d23] pb-1 transition-all" : "text-white/70 font-medium hover:text-white hover:scale-105 transition-all"}>Group Order</NavLink>
          <NavLink to="/status" className={({ isActive }) => isActive ? "text-[#ef4d23] font-bold border-b-2 border-[#ef4d23] pb-1 transition-all" : "text-white/70 font-medium hover:text-white hover:scale-105 transition-all"}>Status</NavLink>
          <NavLink to="/inventory" className={({ isActive }) => isActive ? "text-[#ef4d23] font-bold border-b-2 border-[#ef4d23] pb-1 transition-all" : "text-white/70 font-medium hover:text-white hover:scale-105 transition-all"}>Store</NavLink>
          <NavLink to="/stock" className={({ isActive }) => isActive ? "text-[#ef4d23] font-bold border-b-2 border-[#ef4d23] pb-1 transition-all" : "text-white/70 font-medium hover:text-white hover:scale-105 transition-all"}>Stock</NavLink>
        </nav>
        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-white/70 hover:text-[#ef4d23] transition-colors text-2xl">notifications</button>
          <button className="material-symbols-outlined text-white/70 hover:text-[#ef4d23] transition-colors text-2xl">account_circle</button>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#121212]/80 backdrop-blur-[20px] border-t border-white/10 flex justify-around items-center px-6 z-50 shadow-[0_-8px_32px_0_rgba(0,0,0,0.5)]">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#ef4d23]' : 'text-white/40'}`}>
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#ef4d23]' : 'text-white/40'}`}>
          <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
        </NavLink>
        <NavLink to="/management" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#ef4d23]' : 'text-white/40'}`}>
          <div className="bg-[#ef4d23] text-white p-3 rounded-full -mt-10 shadow-xl shadow-[#ef4d23]/30 border-4 border-[#131313]">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Start</span>
        </NavLink>
        <NavLink to="/status" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#ef4d23]' : 'text-white/40'}`}>
          <span className="material-symbols-outlined text-2xl">analytics</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#ef4d23]' : 'text-white/40'}`}>
          <span className="material-symbols-outlined text-2xl">store</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Store</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Navbar;
