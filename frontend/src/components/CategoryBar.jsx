import React from 'react';

const CategoryBar = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="sticky top-20 md:top-24 z-30 bg-background/80 backdrop-blur-md -mx-4 px-4 py-4 mb-2 overflow-x-auto hide-scrollbar border-b border-white/5">
      <div className="flex items-center gap-3 min-w-max pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 glass-panel rounded-full font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-2 ${
              activeCategory === cat.id ? 'bg-[#ef4d23] text-white border-[#ef4d23]' : 'text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {cat.name.toLowerCase().includes('drink') ? 'local_drink' : 
               cat.name.toLowerCase().includes('maggi') ? 'ramen_dining' : 'fastfood'}
            </span> 
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
