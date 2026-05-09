import React from 'react';

const Cart = ({ cartItems, onUpdate, onRemove, onPlaceOrder }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <div className="bg-[#ef4d23] p-6 text-white">
        <h2 className="text-2xl font-black italic tracking-tighter">Current Order</h2>
        <p className="opacity-80 text-sm mt-1 font-medium">Order — Dine-in</p>
      </div>
      <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {cartItems.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">Your cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between group py-2">
              <div>
                <p className="font-bold text-white">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button 
                    onClick={() => onUpdate(item.id, -1)}
                    className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white hover:bg-[#ef4d23]"
                  >-</button>
                  <span className="text-xs text-zinc-400 font-bold">x {item.quantity}</span>
                  <button 
                    onClick={() => onUpdate(item.id, 1)}
                    className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white hover:bg-[#ef4d23]"
                  >+</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-white">₹{item.price * item.quantity}</span>
                <div className="flex gap-1">
                  <button onClick={() => onRemove(item.id)} className="text-zinc-600 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {cartItems.length > 0 && (
          <div className="border-t border-white/5 pt-4 space-y-2">
            <div className="flex justify-between text-zinc-400 text-sm font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-white text-2xl font-black pt-2 border-t border-white/5">
              <span>Total</span>
              <span className="text-[#ef4d23]">₹{total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 pt-0">
        <button 
          onClick={onPlaceOrder}
          disabled={cartItems.length === 0}
          className="w-full bg-[#ef4d23] text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#ef4d23]/20 disabled:opacity-50"
        >
          Place Order
        </button>
        <button className="w-full mt-2 py-3 text-zinc-500 font-bold hover:text-zinc-300 transition-colors">
          Hold Order
        </button>
      </div>
    </div>
  );
};

export default Cart;
