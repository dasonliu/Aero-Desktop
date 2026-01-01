
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DesktopIcon from './DesktopIcon';
import { useOS } from '../context/OSContext';
import { FileNode } from '../types';
import { Plus, Trash, Edit2, RotateCcw, LayoutGrid, CreditCard, Image as ImageIcon, Grid3X3, Maximize2, ZoomIn } from 'lucide-react';
import AddShortcutModal from './AddShortcutModal';

const Desktop: React.FC = () => {
  const { 
    desktopItems, 
    layoutMode, 
    setLayoutMode, 
    iconScale,
    setIconScale,
    currentPage,
    setCurrentPage,
    totalPages,
    deleteItem, 
    updateItem, 
    updatePosition, 
    createItem, 
    resetDesktop,
    reorganizeGrid 
  } = useOS();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<FileNode | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Handle zooming via wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = 0.05;
      const direction = e.deltaY > 0 ? -1 : 1;
      setIconScale(iconScale + direction * zoomFactor);
    }
  };

  // Prevent default browser zoom
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
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

  const handleAddShortcut = (data: Partial<FileNode>) => {
    if (editingNode) {
      updateItem(editingNode.id, data);
    } else {
      const spawnX = contextMenu?.x || 100;
      const spawnY = contextMenu?.y || 100;
      
      createItem({
        id: `node-${Date.now()}`,
        appId: 'weblink',
        label: data.label || 'New Shortcut',
        type: 'shortcut',
        path: '/Desktop',
        x: spawnX,
        y: spawnY,
        ...data
      } as FileNode);
    }
  };

  const openEditModal = (id: string) => {
    const node = desktopItems.find(n => n.id === id);
    if (node) {
      setEditingNode(node);
      setIsModalOpen(true);
    }
  };

  const handleDragEnd = (id: string, info: any) => {
    const node = desktopItems.find(n => n.id === id);
    if (node) {
      const newX = (node.x || 0) + info.offset.x;
      const newY = (node.y || 0) + info.offset.y;
      updatePosition(id, newX, newY);
    }
  };

  // Filter items for current page
  const visibleItems = desktopItems.filter((item: any) => (item.page || 0) === currentPage);

  return (
    <>
      <div 
        ref={desktopRef}
        className="w-full h-full relative z-10 overflow-hidden"
        onContextMenu={(e) => handleContextMenu(e)}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`page-${currentPage}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0"
          >
            {visibleItems.map((node, index) => (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                dragElastic={0}
                onDragEnd={(_, info) => handleDragEnd(node.id, info)}
                initial={{ 
                  scale: 0, 
                  opacity: 0, 
                }}
                animate={{ 
                  x: typeof node.x === 'number' ? node.x : 0, 
                  y: typeof node.y === 'number' ? node.y : 0, 
                  scale: 1, 
                  opacity: 1,
                }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 100,
                }}
                style={{ position: 'absolute' }}
                className="z-20 cursor-grab active:cursor-grabbing"
              >
                <DesktopIcon 
                  node={node} 
                  mode={layoutMode}
                  scale={iconScale}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, node.id);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-40 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${currentPage === i ? 'bg-blue-400 w-4' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed w-60 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-2 z-[100] text-[13px] text-gray-200"
            style={{ 
              top: Math.min(contextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 450), 
              left: Math.min(contextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 260) 
            }}
          >
            {contextMenu.targetId ? (
              <>
                <button onClick={() => openEditModal(contextMenu.targetId!)} className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-3 transition-colors">
                  <Edit2 size={14} className="text-blue-400" /> Edit Shortcut
                </button>
                <div className="h-px bg-white/5 my-1 mx-2" />
                <button onClick={() => deleteItem(contextMenu.targetId!)} className="w-full text-left px-4 py-2.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-3 transition-colors">
                  <Trash size={14} /> Delete
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Display Mode</div>
                <button onClick={() => setLayoutMode('icon')} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${layoutMode === 'icon' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}>
                  <LayoutGrid size={14} /> Icons (1:1)
                </button>
                <button onClick={() => setLayoutMode('card')} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${layoutMode === 'card' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}>
                  <CreditCard size={14} /> Cards (3:4)
                </button>
                <button onClick={() => setLayoutMode('gallery')} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${layoutMode === 'gallery' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}>
                  <ImageIcon size={14} /> Gallery (9:16)
                </button>
                
                <div className="h-px bg-white/5 my-1.5 mx-2" />
                
                <div className="px-4 py-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Quick Scale</div>
                <div className="flex px-4 py-1 gap-2">
                   {[1.0, 2.0, 3.0].map((s) => (
                     <button 
                        key={s} 
                        onClick={() => setIconScale(s)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${Math.abs(iconScale - s) < 0.1 ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'}`}
                     >
                       {s.toFixed(1)}x
                     </button>
                   ))}
                </div>

                <div className="h-px bg-white/5 my-1.5 mx-2" />
                
                <button onClick={() => reorganizeGrid()} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-3 transition-colors">
                  <Grid3X3 size={14} className="text-purple-400" /> Auto Arrange
                </button>
                <button onClick={() => { setEditingNode(null); setIsModalOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-3 transition-colors">
                  <Plus size={14} className="text-emerald-400" /> New Shortcut
                </button>
                <button onClick={resetDesktop} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-3 transition-colors text-gray-400">
                  <RotateCcw size={14} /> Reset Everything
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddShortcutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddShortcut}
        initialData={editingNode}
      />
    </>
  );
};

export default Desktop;
