import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GroupOrder = ({ members, onJoin, onCreate }) => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState(null);

  const handleCreate = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupId(id);
    onCreate(id, name);
  };

  return (
    <div className="space-y-6">
      {!groupId ? (
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#ef4d23] flex items-center justify-center text-white shadow-lg shadow-[#ef4d23]/20">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tight">Group Order Session</h2>
              <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-1">Create or join a group order</p>
            </div>
          </div>
          <div className="space-y-4">
            <input 
              className="w-full bg-zinc-900 border-2 border-white/5 rounded-2xl py-5 px-6 text-white font-bold placeholder:text-zinc-700 focus:border-[#ef4d23] outline-none transition-all duration-300" 
              placeholder="Enter Your Name" 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={handleCreate}
                disabled={!name}
                className="flex-1 bg-[#ef4d23] text-white py-5 rounded-xl font-black italic tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
              >
                CREATE GROUP
              </button>
              <button 
                className="flex-1 glass-panel text-white py-5 rounded-xl font-black italic tracking-tighter hover:bg-white/5 active:scale-95 transition-all"
              >
                JOIN GROUP
              </button>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-8 border-2 border-[#ef4d23]/20 bg-[#ef4d23]/5 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ef4d23] flex items-center justify-center text-white shadow-lg shadow-[#ef4d23]/20">
                <span className="material-symbols-outlined">qr_code</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight italic">Group Code: {groupId}</h3>
                <p className="text-[10px] text-[#ef4d23] font-black uppercase tracking-[0.2em]">Share this with your friends</p>
              </div>
            </div>
            <button className="p-2.5 rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Active Members</h4>
            <div className="space-y-3">
              {members.map((m, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ef4d23]/20 text-[#ef4d23] flex items-center justify-center text-xs font-black">
                      {m.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-bold">{m.name} {m.isMe ? '(You)' : ''}</span>
                  </div>
                  <span className="text-[#ef4d23] font-black italic">₹{m.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default GroupOrder;
