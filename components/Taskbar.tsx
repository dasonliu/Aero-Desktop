
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

const Taskbar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 100, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 h-12 bg-slate-900/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 z-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-500 hover:bg-blue-400 transition-colors flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/20">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
            </div>
          </div>
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center bg-white/5 rounded-full px-3 py-1.5 border border-white/5 w-48 hover:bg-white/10 transition-colors group text-left"
          >
              <Search size={14} className="text-gray-400 mr-2 group-hover:text-blue-400 transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">Search Aero...</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-white/80 h-full">
          <div className="flex flex-col items-end justify-center border-l border-white/10 pl-4 h-full">
              <span className="text-xs font-medium">{time}</span>
              <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Taskbar;
