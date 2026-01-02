
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
  // Using ReturnType<typeof setTimeout> instead of NodeJS.Timeout for cross-environment compatibility
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = getAppConfig(node.appId);
  const Icon = config?.icon || HelpCircle;

  const currentThumbnail = 
    (mode === 'icon' ? node.thumbnails?.icon : 
     mode === 'card' ? node.thumbnails?.card : 
     node.thumbnails?.gallery) || node.thumbnail;

  // 这里的尺寸需与 OSContext 的 baseW/baseH 匹配
  const baseWidth = mode === 'icon' ? 52 : mode === 'card' ? 90 : 110;
  const baseHeight = mode === 'icon' ? 52 : mode === 'card' ? 140 : 200;

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
      className={`relative flex flex-col items-center group cursor-pointer perspective-1000 p-0.5`}
      style={{
        width: (baseWidth + 12) * scale,
        height: (baseHeight + 28) * scale,
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
            absolute inset-0 backface-hidden shadow-lg border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm 
            flex items-center justify-center rounded-xl transition-all
            ${isSelected ? 'ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}
          `}
        >
          {currentThumbnail ? (
            <img src={currentThumbnail} className="w-full h-full object-cover" alt={node.label} />
          ) : (
            <Icon size={Math.max(14, (mode === 'icon' ? 24 : 36) * scale)} className={`${config.color || 'text-white'}`} />
          )}
          
          {node.url && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLink className="text-white" size={Math.max(10, 16 * scale)} />
            </div>
          )}

          {node.isPrivate && (
            <div className="absolute top-1 right-1 p-0.5 bg-black/40 backdrop-blur-md rounded-md">
              <Lock size={8} className="text-yellow-400" />
            </div>
          )}
        </div>

        {/* BACK SIDE (News) */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/20 rounded-xl flex flex-col p-2 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-1 mb-1 border-b border-white/10 pb-1">
            <Newspaper size={10} className="text-blue-400" />
            <span className="text-[8px] font-bold text-white/80 uppercase tracking-tight">AI Feed</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            {!node.news ? (
              <div className="h-full flex flex-col items-center justify-center gap-1 text-gray-500">
                <Loader2 size={12} className="animate-spin text-blue-400" />
                <span className="text-[7px]">Analysing...</span>
              </div>
            ) : (
              node.news.map((n, i) => (
                <div 
                  key={i} 
                  className="p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/news"
                  onClick={(e) => { e.stopPropagation(); window.open(n.url, '_blank'); }}
                >
                  <h4 className="text-[8px] font-bold text-white leading-tight mb-0.5 group-hover/news:text-blue-400 transition-colors line-clamp-1">{n.title}</h4>
                  <p className="text-[6px] text-gray-400 line-clamp-2 leading-tight">{n.snippet}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <div 
        className={`px-1 py-0.5 rounded-md max-w-full truncate font-medium mt-1.5 transition-opacity text-center
          ${isSelected ? 'bg-blue-500 text-white' : 'text-white/90 drop-shadow-lg'}
          ${isFlipped ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ fontSize: Math.max(7, 9 * scale) }}
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
