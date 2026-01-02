
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Sparkles, Image as ImageIcon, Loader2, CheckCircle2, User, Car, Cat, Layout, Palette, Upload, Lock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { FileNode } from '../types';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FileNode>) => void;
  initialData?: FileNode | null;
}

const AI_STYLES = [
  { id: 'kanban', label: 'Anime Girl', icon: User, prompt: 'Japanese anime character, vibrant colors, clean vector lines, mascot style' },
  { id: 'car', label: 'Cyber Car', icon: Car, prompt: 'Futuristic vehicle, neon lighting, dark metallic reflections, tech aesthetic' },
  { id: 'cat', label: 'Cute Cat', icon: Cat, prompt: 'Adorable 3D mascot cat, big eyes, high-end digital render' },
  { id: 'glass', label: 'Glass UI', icon: Layout, prompt: 'Premium glassmorphism UI element, translucent, futuristic' },
  { id: 'neo', label: 'Neo-Future', icon: Palette, prompt: 'Cyberpunk digital painting, high contrast synthwave colors' },
];

const AddShortcutModal: React.FC<AddShortcutModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(AI_STYLES[0]);
  const [thumbnails, setThumbnails] = useState<FileNode['thumbnails']>({});
  const [isPrivate, setIsPrivate] = useState(false);
  
  // 每一项资产独立的加载和错误状态
  const [genStates, setGenStates] = useState<Record<string, { loading: boolean, error: string | null }>>({
    icon: { loading: false, error: null },
    card: { loading: false, error: null },
    gallery: { loading: false, error: null },
    analyzing: { loading: false, error: null }
  });

  const fileInputRefs = {
    icon: useRef<HTMLInputElement>(null),
    card: useRef<HTMLInputElement>(null),
    gallery: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (isOpen) {
      setLabel(initialData?.label || '');
      setUrl(initialData?.url || '');
      setThumbnails(initialData?.thumbnails || {});
      setIsPrivate(initialData?.isPrivate || false);
      setGenStates({
        icon: { loading: false, error: null },
        card: { loading: false, error: null },
        gallery: { loading: false, error: null },
        analyzing: { loading: false, error: null }
      });
    }
  }, [isOpen, initialData]);

  const resizeImage = (base64Str: string, w: number, h: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onerror = () => resolve(base64Str);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/webp', 0.6)); 
        } else resolve(base64Str);
      };
      img.src = base64Str;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: keyof FileNode['thumbnails'], w: number, h: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const optimized = await resizeImage(event.target?.result as string, w, h);
      setThumbnails(prev => ({ ...prev, [type]: optimized }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const generateSingleAsset = async (key: 'icon' | 'card' | 'gallery', prompt: string, ar: string, w: number, h: number, subject: string) => {
    setGenStates(prev => ({ ...prev, [key]: { loading: true, error: null } }));
    try {
      const fullPrompt = `${prompt}, subject: ${subject}. High quality, professional digital asset.`;
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, aspectRatio: ar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      const optimized = await resizeImage(`data:image/png;base64,${data.data}`, w, h);
      setThumbnails(prev => ({ ...prev, [key]: optimized }));
      setGenStates(prev => ({ ...prev, [key]: { loading: false, error: null } }));
    } catch (e: any) {
      setGenStates(prev => ({ ...prev, [key]: { loading: false, error: e.message } }));
    }
  };

  const handleAiGenerate = async () => {
    if (!label && !url) {
      setGenStates(prev => ({ ...prev, analyzing: { loading: false, error: "Name or URL required" } }));
      return;
    }

    let currentLabel = label;
    
    // 1. 如果没有名字，先分析 URL
    if (!currentLabel && url) {
      setGenStates(prev => ({ ...prev, analyzing: { loading: true, error: null } }));
      try {
        const res = await fetch('/api/analyze-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        currentLabel = data.name || 'App';
        setLabel(currentLabel);
      } catch (e) {
        currentLabel = 'New Application';
      } finally {
        setGenStates(prev => ({ ...prev, analyzing: { loading: false, error: null } }));
      }
    }

    // 2. 并行开始三项任务
    const tasks = [
      { key: 'icon', ar: '1:1', w: 512, h: 512, prompt: `Square App Icon, ${selectedStyle.prompt}` },
      { key: 'card', ar: '3:4', w: 480, h: 640, prompt: `Vertical Content Card, ${selectedStyle.prompt}` },
      { key: 'gallery', ar: '9:16', w: 576, h: 1024, prompt: `Full Screen Cinematic Background, ${selectedStyle.prompt}` },
    ] as const;

    tasks.forEach(t => generateSingleAsset(t.key, t.prompt, t.ar, t.w, t.h, currentLabel));
  };

  // Explicitly cast Object.values to the expected type to avoid 'unknown' property access errors
  const statesArray = Object.values(genStates) as Array<{loading: boolean, error: string | null}>;
  const isAnythingLoading = statesArray.some(s => s.loading);
  const globalError = statesArray.find(s => s.error)?.error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Globe size={18} /></div>
            <h3 className="text-white font-bold">Shortcut Studio</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave({ label, url, thumbnails, isPrivate, appId: 'weblink', type: 'shortcut' }); onClose(); }} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {globalError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Generation Error</span>
              </div>
              <p className="text-xs opacity-80">{globalError}</p>
              {globalError.includes("API Key") && (
                <button type="button" onClick={() => window.location.reload()} className="text-[10px] font-black uppercase text-blue-400 hover:underline mt-1">Refresh & Re-select Key</button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">URL Domain</label>
              <input type="text" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="domain.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Label</label>
              <input type="text" required value={label} onChange={(e) => setLabel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Visual Style</label>
            <div className="grid grid-cols-5 gap-2">
              {AI_STYLES.map((style) => (
                <button
                  key={style.id} type="button" onClick={() => setSelectedStyle(style)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${selectedStyle.id === style.id ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                >
                  <style.icon size={18} />
                  <span className="text-[8px] font-black uppercase">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 space-y-5 border border-white/10">
             <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Multi-Ratio Assets</span>
            </div>

            <div className="flex justify-around items-start gap-4">
              {[
                { k: 'icon', r: '1:1', w: 512, h: 512, label: 'Icon' },
                { k: 'card', r: '3:4', w: 480, h: 640, label: 'Card' },
                { k: 'gallery', r: '9:16', w: 576, h: 1024, label: 'Wall' }
              ].map(s => (
                <div key={s.k} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`
                    bg-black/60 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden transition-all relative group shadow-inner w-full
                    ${s.k === 'icon' ? 'aspect-square' : s.k === 'card' ? 'aspect-[3/4]' : 'aspect-[9/16]'}
                    ${genStates[s.k].loading ? 'ring-2 ring-blue-500/50 animate-pulse' : genStates[s.k].error ? 'ring-2 ring-red-500/50' : ''}
                  `}>
                    {thumbnails[s.k as keyof FileNode['thumbnails']] ? (
                      <img src={thumbnails[s.k as keyof FileNode['thumbnails']]} className="w-full h-full object-cover" />
                    ) : genStates[s.k].loading ? (
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                    ) : <ImageIcon size={16} className="text-white/5" />}
                    
                    <button 
                      type="button" onClick={() => (fileInputRefs as any)[s.k].current?.click()}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                  <span className="text-[8px] text-gray-500 font-bold uppercase">{s.label}</span>
                  <input type="file" className="hidden" accept="image/*" ref={(fileInputRefs as any)[s.k]} onChange={(e) => handleFileUpload(e, s.k as any, s.w, s.h)} />
                </div>
              ))}
            </div>

            <button 
              type="button" onClick={handleAiGenerate} disabled={isAnythingLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-[10px] font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest"
            >
              {isAnythingLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isAnythingLoading ? 'AI is Painting...' : 'Paint Assets with Pro AI'}</span>
            </button>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-4 rounded-xl border border-white/10 transition-all uppercase">Cancel</button>
            <button type="submit" className="flex-[2] bg-white text-black hover:bg-gray-200 text-xs font-black py-4 rounded-xl transition-all active:scale-95 uppercase">Save Shortcut</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddShortcutModal;
