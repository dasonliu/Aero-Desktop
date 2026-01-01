
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileNode, LayoutMode } from '../types';
import { getAppConfig } from '../config/appRegistry';
import { ExternalLink, HelpCircle, Lock, Newspaper, Loader2, ChevronRight } from 'lucide-react';
import { useOS } from '../context/OSContext';

interface DesktopIconProps {
  node: FileNode;
  mode: LayoutMode;
  scale: number;
  onContextMenu: (e: React.MouseEvent) => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ node, mode, scale, onContextMenu }) => {
  const { fetchNewsForItem } = useOS();
  const [isSelected, setIsSelected] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const config = getAppConfig(node.appId);
  const Icon = config?.icon || HelpCircle;

  const currentThumbnail = 
    (mode === 'icon' ? node.thumbnails?.icon : 
     mode === 'card' ? node.thumbnails?.card : 
     node.thumbnails?.gallery) || node.thumbnail;

  const baseWidth = mode === 'icon' ? 80 : mode === 'card' ? 110 : 130;
  const baseHeight = mode === 'icon' ? 80 : mode === 'card' ? 180 : 250;

  useEffect(() => {
    if (isHovering && mode !== 'icon') {
      hoverTimerRef.current = setTimeout(() => {
        setIsFlipped(true);
        fetchNewsForItem(node.id);
      }, 2000);
    } else {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setIsFlipped(false);
    }
    return () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); };
  }, [isHovering, mode]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.url) window.open(node.url, '_blank');
  };

  return (
    <div 
      className={`relative flex flex-col items-center group cursor-pointer transition-shadow perspective-1000`}
      style={{
        width: (baseWidth + 30) * scale,
        height: (baseHeight + 50) * scale,
      }}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={(e) => { e.stopPropagation(); setIsSelected(true); }}
      onDoubleClick={handleDoubleClick}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
    >
      <motion.div 
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        style={{ width: baseWidth * scale, height: baseHeight * scale }}
      >
        {/* FRONT SIDE */}
        <div 
          className={`
            absolute inset-0 backface-hidden shadow-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm 
            flex items-center justify-center rounded-2xl transition-all
            ${isSelected ? 'ring-2 ring-blue-500/50' : ''}
          `}
        >
          {currentThumbnail ? (
            <img src={currentThumbnail} className="w-full h-full object-cover" alt={node.label} />
          ) : (
            <Icon size={Math.max(16, (mode === 'icon' ? 32 : 44) * scale)} className={`${config.color || 'text-white'}`} />
          )}
          
          {node.url && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLink className="text-white" size={Math.max(12, 20 * scale)} />
            </div>
          )}

          {node.isPrivate && (
            <div className="absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-md rounded-lg">
              <Lock size={12} className="text-yellow-400" />
            </div>
          )}
        </div>

        {/* BACK SIDE (News) */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/20 rounded-2xl flex flex-col p-3 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
            <Newspaper size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">Hot Topics</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {!node.news ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span className="text-[9px]">Analyzing Feed...</span>
              </div>
            ) : (
              node.news.map((n, i) => (
                <div 
                  key={i} 
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/news"
                  onClick={(e) => { e.stopPropagation(); window.open(n.url, '_blank'); }}
                >
                  <h4 className="text-[10px] font-bold text-white leading-tight mb-1 group-hover/news:text-blue-400 transition-colors line-clamp-2">{n.title}</h4>
                  <p className="text-[8px] text-gray-400 line-clamp-2">{n.snippet}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[8px] text-gray-500 italic">via Gemini AI</span>
            <ChevronRight size={10} className="text-gray-500" />
          </div>
        </div>
      </motion.div>

      <div 
        className={`px-2 py-0.5 rounded-md max-w-full truncate font-medium mt-3 transition-opacity
          ${isSelected ? 'bg-blue-500 text-white' : 'text-white/90'}
          ${isFlipped ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ fontSize: Math.max(8, 11 * scale) }}
      >
        {node.label}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default DesktopIcon;
