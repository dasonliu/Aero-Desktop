
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Globe, AppWindow, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { useOS } from '../context/OSContext';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const { desktopItems } = useOS();
  const [query, setQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [webResults, setWebResults] = useState<{ text: string, links: any[] } | null>(null);

  const localResults = useMemo(() => {
    if (!query.trim()) return [];
    return desktopItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, desktopItems]);

  const handleWebSearch = async () => {
    if (!query.trim()) return;
    setIsAiSearching(true);
    setWebResults(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (!data.error) {
        setWebResults({ text: data.text, links: data.links });
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error(e);
      setWebResults({ text: "Search failed. Please try again later.", links: [] });
    } finally {
      setIsAiSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setWebResults(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
    >
      <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[60px]" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-white/5">
          <Search className="text-blue-400 shrink-0" size={24} />
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
            placeholder="Search apps, files, or the entire web..."
            className="flex-1 bg-transparent text-white text-xl outline-none placeholder:text-gray-500 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {localResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <AppWindow size={14} className="text-gray-500" />
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Local Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {localResults.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { item.url && window.open(item.url, '_blank'); onClose(); }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                       <AppWindow size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-bold text-white truncate">{item.label}</div>
                      <div className="text-[10px] text-gray-500 truncate">Application Shortcut</div>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !isAiSearching && !webResults && (
            <button 
              onClick={handleWebSearch}
              className="w-full p-6 rounded-[24px] border border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 group-hover:rotate-12 transition-transform">
                <Globe size={28} />
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm">Search the web for "{query}"</div>
                <div className="text-gray-500 text-xs mt-1">Get real-time answers powered by Gemini AI</div>
              </div>
            </button>
          )}

          {isAiSearching && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
               <Loader2 size={32} className="text-blue-500 animate-spin" />
               <div className="text-sm text-blue-400 font-medium animate-pulse">Consulting global knowledge...</div>
            </div>
          )}

          {webResults && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 px-1">
                <Globe size={14} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Global Insights</span>
              </div>
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 leading-relaxed text-gray-200 text-sm">
                {webResults.text}
              </div>

              {webResults.links.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest px-1">Source Citations</div>
                  <div className="grid grid-cols-1 gap-2">
                    {webResults.links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <span className="text-xs font-medium text-gray-300 truncate pr-4">{link.title}</span>
                        <ExternalLink size={12} className="text-gray-500 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between text-[10px] text-gray-500 font-bold tracking-tight">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-white">Enter</kbd> to Web Search</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-white">Esc</kbd> to Close</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-blue-400">Gemini 3.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchOverlay;
