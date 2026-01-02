
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DesktopIcon from './DesktopIcon';
import ParticleClock from './ParticleClock';
import { useOS } from '../context/OSContext';
import { FileNode } from '../types';
import { Plus, Trash, Edit2, RotateCcw, LayoutGrid, CreditCard, Image as ImageIcon, Grid3X3, Palette, X, Check, Clock, Settings } from 'lucide-react';
import AddShortcutModal from './AddShortcutModal';

const PRESET_WALLPAPERS = [
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1200",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200",
  "https://images.unsplash.com/photo-1506744038706-8e31639847c6?q=80&w=1200",
];

const getFlyInStart = (index: number) => {
  const side = index % 4;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const offsetX = w > h ? w * 1.5 : w * 2.0; 
  const offsetY = h > w ? h * 1.5 : h * 2.0;

  switch (side) {
    case 0: return { x: -offsetX, y: -offsetY, rotate: -45 }; 
    case 1: return { x: offsetX, y: -offsetY, rotate: 45 };   
    case 2: return { x: -offsetX, y: offsetY, rotate: -90 };  
    case 3: return { x: offsetX, y: offsetY, rotate: 90 };   
    default: return { x: 0, y: 0, rotate: 0 };
  }
};

const WallpaperModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { wallpaper, setWallpaper } = useOS();
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 40 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-[48px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <Palette size={24} />
            </div>
            <h3 className="text-white font-black text-2xl tracking-tight">Personalization</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Curated Wallpapers</label>
            <div className="grid grid-cols-4 gap-4">
              {PRESET_WALLPAPERS.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setWallpaper(url)} 
                  className={`group relative aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${wallpaper === url ? 'border-blue-500 shadow-2xl shadow-blue-500/40 scale-105' : 'border-white/5'}`}
                >
                  <img src={url} className="w-full h-full object-cover" />
                  {wallpaper === url && (
                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center backdrop-blur-[1px]">
                      <Check className="text-white drop-shadow-lg" size={24} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Custom Image URL</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={customUrl} 
                onChange={(e) => setCustomUrl(e.target.value)} 
                placeholder="https://images.unsplash.com/..." 
                className="flex-1 bg-black/60 border border-white/10 rounded-[22px] px-6 py-4.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700 font-medium" 
              />
              <button 
                onClick={() => customUrl && setWallpaper(customUrl)} 
                className="px-10 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-[22px] transition-all shadow-xl shadow-blue-900/40 active:scale-95"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        <div className="p-8 bg-white/5 flex justify-end">
          <button onClick={onClose} className="px-14 py-4 bg-white text-black font-black text-sm rounded-[24px] hover:bg-gray-200 transition-all active:scale-95 shadow-2xl">
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Desktop: React.FC = () => {
  const { 
    desktopItems, layoutMode, setLayoutMode, iconScale, setIconScale,
    currentPage, setCurrentPage, totalPages, deleteItem, updateItem, 
    updatePosition, createItem, resetDesktop, reorganizeGrid,
    showClock, setShowClock
  } = useOS();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<FileNode | null>(null);
  const [isInitialEntry, setIsInitialEntry] = useState(true);
  
  const [dragEdge, setDragEdge] = useState<'left' | 'right' | null>(null);
  // Using ReturnType<typeof setTimeout> instead of NodeJS.Timeout for cross-environment compatibility
  const edgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsInitialEntry(true);
    const timer = setTimeout(() => setIsInitialEntry(false), 1500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      setIconScale(iconScale + direction * 0.05);
    }
  };

  useEffect(() => {
    const preventZoom = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    window.addEventListener('wheel', preventZoom, { passive: false });
    return () => window.removeEventListener('wheel', preventZoom);
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, targetId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, targetId });
  };

  const handleDrag = (id: string, info: any) => {
    const screenWidth = window.innerWidth;
    const dragX = info.point.x;
    const edgeThreshold = 60;

    if (dragX < edgeThreshold) {
      if (dragEdge !== 'left') {
        setDragEdge('left');
        startEdgeTimer('left', id);
      }
    } else if (dragX > screenWidth - edgeThreshold) {
      if (dragEdge !== 'right') {
        setDragEdge('right');
        startEdgeTimer('right', id);
      }
    } else {
      clearEdgeTimer();
    }
  };

  const startEdgeTimer = (edge: 'left' | 'right', id: string) => {
    if (edgeTimerRef.current) clearTimeout(edgeTimerRef.current);
    edgeTimerRef.current = setTimeout(() => {
      if (edge === 'left' && currentPage > 0) {
        updateItem(id, { page: currentPage - 1 });
        setCurrentPage(currentPage - 1);
      } else if (edge === 'right') {
        updateItem(id, { page: currentPage + 1 });
        setCurrentPage(currentPage + 1);
      }
      clearEdgeTimer();
    }, 600);
  };

  const clearEdgeTimer = () => {
    setDragEdge(null);
    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);
      edgeTimerRef.current = null;
    }
  };

  const handleDragEnd = (id: string, info: any) => {
    clearEdgeTimer();
    const node = desktopItems.find(n => n.id === id);
    if (node) {
      const finalX = (node.x || 0) + info.offset.x;
      const finalY = (node.y || 0) + info.offset.y;
      updatePosition(id, finalX, finalY);
    }
  };

  const handleAddShortcut = (data: Partial<FileNode>) => {
    if (editingNode) {
      updateItem(editingNode.id, data);
    } else {
      createItem({
        ...data,
        id: `node-${Date.now()}`,
        path: '/Desktop',
        page: currentPage,
        x: 100, 
        y: 100,
      } as FileNode);
      setTimeout(() => reorganizeGrid(), 100);
    }
    setEditingNode(null);
  };

  const visibleItems = desktopItems.filter((item: any) => (item.page || 0) === currentPage);

  return (
    <>
      <div 
        ref={desktopRef}
        className="w-full h-full relative z-10 overflow-hidden" 
        onContextMenu={(e) => handleContextMenu(e)}
        onWheel={handleWheel}
      >
        <AnimatePresence>
          {dragEdge && (
            <motion.div 
              initial={{ opacity: 0, x: dragEdge === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dragEdge === 'left' ? -50 : 50 }}
              className={`fixed top-0 bottom-0 w-24 z-50 pointer-events-none ${dragEdge === 'left' ? 'left-0 bg-gradient-to-r from-blue-500/30 to-transparent' : 'right-0 bg-gradient-to-l from-blue-500/30 to-transparent'}`}
            >
               <div className={`absolute top-1/2 -translate-y-1/2 ${dragEdge === 'left' ? 'left-6' : 'right-6'} text-blue-400 animate-pulse`}>
                  {dragEdge === 'left' ? '← PREV' : 'NEXT →'}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showClock && <ParticleClock />}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          <motion.div key={`page-${currentPage}`} className="absolute inset-0">
            {visibleItems.map((node, index) => {
              const startPos = getFlyInStart(index);
              return (
                <motion.div
                  key={node.id}
                  layout 
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => handleDrag(node.id, info)}
                  onDragEnd={(_, info) => handleDragEnd(node.id, info)}
                  initial={{ 
                    x: startPos.x, 
                    y: startPos.y, 
                    opacity: 0, 
                    scale: 0.1,
                    rotate: startPos.rotate 
                  }}
                  animate={{ 
                    x: node.x || 0, 
                    y: node.y || 0, 
                    opacity: 1, 
                    scale: iconScale, 
                    rotate: 0 
                  }}
                  transition={{ 
                    type: "spring", 
                    damping: 26, 
                    stiffness: 120,
                    delay: isInitialEntry ? index * 0.03 : 0,
                    scale: { type: "spring", damping: 18, stiffness: 200 }
                  }}
                  style={{ position: 'absolute', originX: 0, originY: 0 }}
                  className="z-20 cursor-grab active:cursor-grabbing"
                >
                  <DesktopIcon 
                    node={node} 
                    mode={layoutMode}
                    scale={1.0} 
                    onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, node.id); }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-40 bg-black/40 backdrop-blur-3xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i)} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentPage === i ? 'bg-blue-400 w-8 shadow-[0_0_15px_rgba(96,165,250,0.8)]' : 'bg-white/10 hover:bg-white/30'}`} 
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className="fixed w-64 bg-[#080d1a]/95 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 z-[100] text-[12px] text-gray-200"
            style={{ 
              top: Math.min(contextMenu.y, window.innerHeight - 480), 
              left: Math.min(contextMenu.x, window.innerWidth - 280) 
            }}
          >
            {contextMenu.targetId ? (
              <>
                <button onClick={() => { setEditingNode(desktopItems.find(n => n.id === contextMenu.targetId)!); setIsModalOpen(true); }} className="w-full text-left px-5 py-3 hover:bg-white/10 flex items-center gap-3 transition-all group">
                  <Edit2 size={14} className="text-blue-400 group-hover:scale-110 transition-transform" /> Edit Properties
                </button>
                <div className="h-px bg-white/5 my-1.5 mx-3" />
                <button onClick={() => deleteItem(contextMenu.targetId!)} className="w-full text-left px-5 py-3 hover:bg-red-500/20 text-red-400 flex items-center gap-3 transition-all">
                  <Trash size={14} /> Remove Shortcut
                </button>
              </>
            ) : (
              <>
                <div className="px-5 py-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.15em] mb-0.5 opacity-60">General</div>
                <button onClick={() => setShowClock(!showClock)} className={`w-full text-left px-5 py-2.5 flex items-center justify-between transition-all hover:bg-white/10`}>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-blue-400" /> 
                    <span>Particle Clock</span>
                  </div>
                  {showClock && <Check size={14} className="text-emerald-400" />}
                </button>
                <button onClick={() => setIsWallpaperModalOpen(true)} className="w-full text-left px-5 py-2.5 hover:bg-white/10 flex items-center gap-3 transition-all">
                  <Settings size={16} className="text-slate-400" />
                  <span>System Settings</span>
                </button>

                <div className="h-px bg-white/5 my-2 mx-3" />

                <div className="px-5 py-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.15em] mb-0.5 opacity-60">Display Style</div>
                <button onClick={() => setLayoutMode('icon')} className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-all ${layoutMode === 'icon' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}>
                  <LayoutGrid size={16} /> Grid
                </button>
                <button onClick={() => setLayoutMode('card')} className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-all ${layoutMode === 'card' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}>
                  <CreditCard size={16} /> Cards
                </button>
                <button onClick={() => setLayoutMode('gallery')} className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-all ${layoutMode === 'gallery' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}>
                  <ImageIcon size={16} /> Gallery
                </button>
                
                <div className="h-px bg-white/5 my-2 mx-3" />
                
                <div className="px-5 py-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.15em] mb-0.5 opacity-60">Scaling</div>
                <div className="flex px-4 py-2 gap-2">
                   {[0.7, 1.0, 1.4].map(s => (
                     <button 
                        key={s} 
                        onClick={() => setIconScale(s)} 
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black border transition-all ${Math.abs(iconScale - s) < 0.1 ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                      >
                       {s < 0.9 ? 'TINY' : s < 1.2 ? 'STD' : 'BIG'}
                     </button>
                   ))}
                </div>

                <div className="h-px bg-white/5 my-2 mx-3" />
                
                <button onClick={() => setIsWallpaperModalOpen(true)} className="w-full text-left px-5 py-2.5 hover:bg-white/10 flex items-center gap-3 transition-all text-pink-400">
                  <Palette size={16} /> Wallpapers
                </button>
                <button onClick={() => reorganizeGrid()} className="w-full text-left px-5 py-2.5 hover:bg-white/10 flex items-center gap-3 transition-all text-purple-400">
                  <Grid3X3 size={16} /> Auto Align
                </button>
                <button onClick={() => { setEditingNode(null); setIsModalOpen(true); }} className="w-full text-left px-5 py-2.5 hover:bg-white/10 flex items-center gap-3 transition-all text-emerald-400">
                  <Plus size={16} /> New App
                </button>
                <button onClick={resetDesktop} className="w-full text-left px-5 py-2.5 hover:bg-white/10 flex items-center gap-3 transition-all text-gray-500">
                  <RotateCcw size={16} /> Factory Reset
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddShortcutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddShortcut} initialData={editingNode} />
      <WallpaperModal isOpen={isWallpaperModalOpen} onClose={() => setIsWallpaperModalOpen(false)} />
    </>
  );
};

export default Desktop;
