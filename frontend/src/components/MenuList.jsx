import React from 'react';
import ProductCard from './ProductCard';

const MenuList = ({ items, onAdd }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} onAdd={onAdd} />
      ))}
      {items.length === 0 && (
        <div className="col-span-full py-20 text-center glass-panel rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-zinc-700 mb-4">search_off</span>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No items found in this category</p>
        </div>
      )}
    </div>
  );
};

export default MenuList;
