
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FileNode, LayoutMode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const INITIAL_DESKTOP_ITEMS: FileNode[] = [
  { id: '1', appId: 'computer', label: 'My PC', type: 'shortcut', path: '/Desktop', x: 20, y: 20, isPrivate: false },
  { id: '2', appId: 'browser', label: 'Google', type: 'shortcut', path: '/Desktop', url: 'https://google.com', x: 20, y: 140, isPrivate: false },
  { 
    id: '3', appId: 'weblink', label: 'YouTube', type: 'shortcut', path: '/Desktop', url: 'https://youtube.com', x: 140, y: 20,
    isPrivate: false,
    thumbnails: {
      icon: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200&auto=format&fit=crop',
      card: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop',
      gallery: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop'
    }
  },
];

const STORAGE_KEY = 'aero_desktop_v7';
const LAYOUT_KEY = 'aero_layout_v7';
const SCALE_KEY = 'aero_scale_v7';

interface OSContextType {
  desktopItems: FileNode[];
  layoutMode: LayoutMode;
  iconScale: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setIconScale: (scale: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;
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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("Load failed", e); }
    return INITIAL_DESKTOP_ITEMS;
  });

  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() => 
    (localStorage.getItem(LAYOUT_KEY) as LayoutMode) || 'icon'
  );

  const [iconScale, setIconScaleState] = useState<number>(() => {
    const saved = localStorage.getItem(SCALE_KEY);
    return saved ? parseFloat(saved) : 1.0;
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(desktopItems));
  }, [desktopItems]);

  useEffect(() => {
    localStorage.setItem(SCALE_KEY, iconScale.toString());
  }, [iconScale]);

  const fetchNewsForItem = async (id: string) => {
    const item = desktopItems.find(i => i.id === id);
    if (!item || item.news) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find 3 real current hot news headlines or interesting facts about "${item.label}" or its domain "${item.url || ''}". Return ONLY a JSON array of objects with "title", "snippet", and "url" properties.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                snippet: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "snippet", "url"]
            }
          }
        }
      });
      
      const news = JSON.parse(response.text);
      updateItem(id, { news });
    } catch (e) {
      console.error("Failed to fetch news", e);
    }
  };

  const reorganizeGrid = (mode: LayoutMode = layoutMode, scale: number = iconScale) => {
    const margin = 32;
    const taskbarHeight = 48;
    let baseW = mode === 'icon' ? 100 : mode === 'card' ? 140 : 160;
    let baseH = mode === 'icon' ? 120 : mode === 'card' ? 240 : 300;
    
    const cellW = baseW * scale;
    const cellH = baseH * scale;
    const availableW = window.innerWidth - margin * 2;
    const availableH = window.innerHeight - margin * 2 - taskbarHeight;
    const cols = Math.max(1, Math.floor(availableW / cellW));
    const rows = Math.max(1, Math.floor(availableH / cellH));
    const itemsPerPage = cols * rows;

    setTotalPages(Math.max(1, Math.ceil(desktopItems.length / itemsPerPage)));

    setDesktopItems(prev => prev.map((item, index) => {
      const pageIndex = Math.floor(index / itemsPerPage);
      const indexInPage = index % itemsPerPage;
      const col = indexInPage % cols;
      const row = Math.floor(indexInPage / cols);

      return {
        ...item,
        x: margin + col * cellW,
        y: margin + row * cellH,
        page: pageIndex
      } as any;
    }));
  };

  useEffect(() => {
    reorganizeGrid(layoutMode, iconScale);
  }, [desktopItems.length, layoutMode, iconScale]);

  const setIconScale = (scale: number) => setIconScaleState(Math.min(Math.max(scale, 0.2), 3.0));
  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    localStorage.setItem(LAYOUT_KEY, mode);
  };

  const deleteItem = (id: string) => setDesktopItems(prev => prev.filter(i => i.id !== id));
  const createItem = (node: FileNode) => setDesktopItems(prev => [...prev, { ...node, id: `node-${Date.now()}` }]);
  const updateItem = (id: string, updates: Partial<FileNode>) => {
    setDesktopItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };
  const updatePosition = (id: string, x: number, y: number) => {
    setDesktopItems(prev => prev.map(i => i.id === id ? { ...i, x, y } : i));
  };

  const resetDesktop = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <OSContext.Provider value={{ 
      desktopItems, layoutMode, setLayoutMode, iconScale, setIconScale,
      currentPage, setCurrentPage, totalPages,
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
