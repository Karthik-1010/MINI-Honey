import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ item, cartQuantity, onAdd, onEdit, onDelete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:bg-white/5 hover:border-[#ef4d23]/30 transition-all group"
    >
      <div className="flex-1 flex items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-[#ef4d23] transition-colors flex items-center gap-3">
            {item.name}
            {item.description && item.description !== '-' && (
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-white/10 text-white/70">
                {item.description}
              </span>
            )}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <span className="text-xl font-black text-white w-16 text-right">₹{item.price}</span>
        
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(item)} className="p-2 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-white/5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
          
          <div className="relative">
            {cartQuantity > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#ef4d23] text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-[#131313] z-10">
                {cartQuantity}
              </div>
            )}
            <button 
              onClick={() => onAdd(item)}
              className="px-4 py-2 bg-[#ef4d23] text-white rounded-lg shadow-lg shadow-[#ef4d23]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1 relative"
              disabled={!item.is_available}
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="text-sm font-bold">Add</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
