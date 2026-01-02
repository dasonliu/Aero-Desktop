
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FileNode, LayoutMode } from '../types';
import { WALLPAPER_URL as DEFAULT_WALLPAPER } from '../constants';

const INITIAL_DESKTOP_ITEMS: FileNode[] = [
  { id: '1', appId: 'computer', label: 'My PC', type: 'shortcut', path: '/Desktop', x: 0, y: 0, isPrivate: false },
  { id: '2', appId: 'browser', label: 'Google', type: 'shortcut', path: '/Desktop', url: 'https://google.com', x: 0, y: 0 },
  { 
    id: '3', appId: 'weblink', label: 'YouTube', type: 'shortcut', path: '/Desktop', url: 'https://youtube.com', x: 0, y: 0,
    thumbnails: {
      icon: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200',
      card: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400',
      gallery: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600'
    }
  },
  { 
    id: '4', appId: 'weblink', label: 'GitHub', type: 'shortcut', path: '/Desktop', url: 'https://github.com', x: 0, y: 0,
    thumbnails: { icon: 'https://images.unsplash.com/photo-1618401471353-b98aadebc25a?q=80&w=200' }
  },
  { 
    id: '5', appId: 'weblink', label: 'Netflix', type: 'shortcut', path: '/Desktop', url: 'https://netflix.com', x: 0, y: 0,
    thumbnails: { icon: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=200' }
  },
  { 
    id: '6', appId: 'weblink', label: 'ChatGPT', type: 'shortcut', path: '/Desktop', url: 'https://chat.openai.com', x: 0, y: 0,
    thumbnails: { icon: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=200' }
  },
  { id: '7', appId: 'weblink', label: 'Twitter', type: 'shortcut', path: '/Desktop', url: 'https://twitter.com', x: 0, y: 0 },
  { id: '8', appId: 'weblink', label: 'Reddit', type: 'shortcut', path: '/Desktop', url: 'https://reddit.com', x: 0, y: 0 },
  { id: '9', appId: 'weblink', label: 'Figma', type: 'shortcut', path: '/Desktop', url: 'https://figma.com', x: 0, y: 0 },
  { id: '10', appId: 'weblink', label: 'Adobe', type: 'shortcut', path: '/Desktop', url: 'https://adobe.com', x: 0, y: 0 },
  { id: '11', appId: 'weblink', label: 'Wikipedia', type: 'shortcut', path: '/Desktop', url: 'https://wikipedia.org', x: 0, y: 0 }
];

const STORAGE_KEY = 'aero_desktop_v20';
const LAYOUT_KEY = 'aero_layout_v20';
const SCALE_KEY = 'aero_scale_v20';
const WALLPAPER_KEY = 'aero_wallpaper_v20';
const CLOCK_KEY = 'aero_clock_v20';

interface OSContextType {
  desktopItems: FileNode[];
  layoutMode: LayoutMode;
  iconScale: number;
  wallpaper: string;
  currentPage: number;
  totalPages: number;
  showClock: boolean;
  setShowClock: (show: boolean) => void;
  setCurrentPage: (page: number) => void;
  setIconScale: (scale: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setWallpaper: (url: string) => void;
  deleteItem: (id: string) => void;
  createItem: (node: FileNode) => void;
  updateItem: (id: string, updates: Partial<FileNode>) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  reorganizeGrid: (mode?: LayoutMode, scale?: number) => void;
  resetDesktop: () => void;
  fetchNewsForItem: (id: string) => Promise<void>;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [desktopItems, setDesktopItems] = useState<FileNode[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DESKTOP_ITEMS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("Load failed", e); }
    return INITIAL_DESKTOP_ITEMS;
  });

  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() => {
    if (typeof window === 'undefined') return 'icon';
    return (localStorage.getItem(LAYOUT_KEY) as LayoutMode) || 'icon';
  });

  const [iconScale, setIconScaleState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.0;
    const saved = localStorage.getItem(SCALE_KEY);
    return saved ? parseFloat(saved) : 1.0;
  });

  const [wallpaper, setWallpaperState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_WALLPAPER;
    return localStorage.getItem(WALLPAPER_KEY) || DEFAULT_WALLPAPER;
  });

  const [showClock, setShowClockState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CLOCK_KEY) === 'true';
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(desktopItems));
  }, [desktopItems]);

  useEffect(() => {
    localStorage.setItem(SCALE_KEY, iconScale.toString());
  }, [iconScale]);

  useEffect(() => {
    localStorage.setItem(WALLPAPER_KEY, wallpaper);
  }, [wallpaper]);

  useEffect(() => {
    localStorage.setItem(CLOCK_KEY, showClock.toString());
  }, [showClock]);

  const setShowClock = (show: boolean) => setShowClockState(show);

  const fetchNewsForItem = async (id: string) => {
    const item = desktopItems.find(i => i.id === id);
    if (!item || item.news) return;
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: item.label }),
      });
      const news = await response.json();
      if (!news.error) {
        updateItem(id, { news });
      }
    } catch (e) { console.error(e); }
  };

  const reorganizeGrid = (mode: LayoutMode = layoutMode, scale: number = iconScale) => {
    const isMobile = window.innerWidth < 1024;
    const isLandscape = window.innerWidth > window.innerHeight;
    const marginX = isMobile ? (isLandscape ? 24 : 12) : 40;
    const marginY = isMobile ? (isLandscape ? 12 : 16) : 40;
    const taskbarHeight = isMobile ? 50 : 70;
    
    let baseW, baseH;
    if (mode === 'icon') {
        baseW = isMobile ? (isLandscape ? 80 : 64) : 100;
        baseH = isMobile ? (isLandscape ? 90 : 80) : 110;
    } else if (mode === 'card') {
        baseW = (isMobile && isLandscape) ? Math.floor(window.innerWidth / 5) : (isMobile ? 120 : 180);
        baseH = (isMobile && isLandscape) ? 140 : (isMobile ? 200 : 260);
    } else { // gallery
        baseW = (isMobile && isLandscape) ? Math.floor(window.innerWidth / 5.5) : (isMobile ? 150 : 210);
        baseH = (isMobile && isLandscape) ? 180 : (isMobile ? 260 : 320);
    }
    
    const spacingFactor = isMobile ? 1.02 : (1.03 + (scale * 0.05)); 
    const cellW = baseW * scale * spacingFactor;
    const cellH = baseH * scale * spacingFactor;
    const availableW = window.innerWidth - marginX * 2;
    const availableH = window.innerHeight - marginY * 2 - taskbarHeight;
    let cols = Math.max(1, Math.floor(availableW / cellW));
    let rows = Math.max(1, Math.floor(availableH / cellH));

    if (isMobile && isLandscape && (mode === 'card' || mode === 'gallery')) {
      cols = 4;
      rows = 1;
    }

    const itemsPerPage = cols * rows;
    setTotalPages(Math.max(1, Math.ceil(desktopItems.length / itemsPerPage)));

    setDesktopItems(prev => prev.map((item, index) => {
      const pageIndex = Math.floor(index / itemsPerPage);
      const indexInPage = index % itemsPerPage;
      const col = indexInPage % cols;
      const row = Math.floor(indexInPage / cols);
      const usedWidth = cols * cellW;
      const horizontalOffset = Math.max(0, (availableW - usedWidth) / 2);
      const usedHeight = rows * cellH;
      const verticalOffset = Math.max(0, (availableH - usedHeight) / 2);
      return {
        ...item,
        x: marginX + horizontalOffset + col * cellW,
        y: marginY + verticalOffset + row * cellH,
        page: pageIndex
      };
    }));
  };

  useEffect(() => {
    reorganizeGrid();
    const handleResize = () => reorganizeGrid();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutMode, iconScale]);

  const setIconScale = (scale: number) => {
    setIconScaleState(Math.min(Math.max(scale, 0.4), 3.0));
  };
  
  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    localStorage.setItem(LAYOUT_KEY, mode);
  };

  const setWallpaper = (url: string) => setWallpaperState(url);
  const deleteItem = (id: string) => setDesktopItems(prev => prev.filter(i => i.id !== id));
  const createItem = (node: FileNode) => setDesktopItems(prev => [...prev, { ...node, id: `node-${Date.now()}` }]);
  const updateItem = (id: string, updates: Partial<FileNode>) => setDesktopItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const updatePosition = (id: string, x: number, y: number) => setDesktopItems(prev => prev.map(i => i.id === id ? { ...i, x, y } : i));
  const resetDesktop = () => { localStorage.clear(); window.location.reload(); };

  return (
    <OSContext.Provider value={{ 
      desktopItems, layoutMode, setLayoutMode, iconScale, setIconScale,
      wallpaper, setWallpaper, currentPage, setCurrentPage, totalPages,
      showClock, setShowClock,
      deleteItem, createItem, updateItem, updatePosition, reorganizeGrid, resetDesktop,
      fetchNewsForItem
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) throw new Error('useOS must be used within an OSProvider');
  return context;
};
