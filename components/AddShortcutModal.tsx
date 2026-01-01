
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Sparkles, Image as ImageIcon, Loader2, Wand2, CheckCircle2, User, Car, Plane, Cat, Layout, Palette, Upload, Lock, ShieldCheck } from 'lucide-react';
import { FileNode } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FileNode>) => void;
  initialData?: FileNode | null;
}

const AI_STYLES = [
  { id: 'kanban', label: 'Anime Girl', icon: User, prompt: 'Japanese anime kanban girl character, vibrant colors, clean lines' },
  { id: 'car', label: 'Cyber Car', icon: Car, prompt: 'Futuristic supercar, neon lighting, dark metallic finish, high tech' },
  { id: 'cat', label: 'Cute Cat', icon: Cat, prompt: 'Adorable stylized 3D cat mascot, fluffy texture, expressive eyes' },
  { id: 'glass', label: 'Glassmorphism', icon: Layout, prompt: 'Translucent frosted glass UI element, soft shadows, pastel gradients' },
  { id: 'clay', label: 'Clay 3D', icon: Palette, prompt: 'Playful 3D claymorphism render, soft shapes, matte finish' },
];

const AddShortcutModal: React.FC<AddShortcutModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(AI_STYLES[0]);
  const [thumbnails, setThumbnails] = useState<FileNode['thumbnails']>({});
  const [isPrivate, setIsPrivate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState<'idle' | 'analyzing' | 'painting-icon' | 'painting-card' | 'painting-gallery'>('idle');

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
      setGenPhase('idle');
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

  const handleAiGenerate = async () => {
    if (!label && !url) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let currentLabel = label;
      
      if (!currentLabel) {
        setGenPhase('analyzing');
        const nameRes = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Brand name from ${url}. Return ONLY the name.`,
        });
        currentLabel = nameRes.text?.trim() || 'App';
        setLabel(currentLabel);
      }

      const visualPrompt = `Theme: ${selectedStyle.prompt}. Concept: ${currentLabel}. High quality, 4k, digital art.`;
      const specs = [
        { k: 'icon', p: `Square app icon: ${visualPrompt}`, ar: '1:1', w: 512, h: 512, ph: 'painting-icon' },
        { k: 'card', p: `Vertical card layout: ${visualPrompt}`, ar: '3:4', w: 480, h: 640, ph: 'painting-card' },
        { k: 'gallery', p: `Full cinematic background: ${visualPrompt}`, ar: '9:16', w: 576, h: 1024, ph: 'painting-gallery' }
      ] as const;

      const newThumbs: any = {};
      for (const spec of specs) {
        setGenPhase(spec.ph as any);
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: spec.p }] },
          config: { imageConfig: { aspectRatio: spec.ar as any } }
        });
        const raw = res.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
        if (raw) newThumbs[spec.k] = await resizeImage(`data:image/png;base64,${raw}`, spec.w, spec.h);
      }
      setThumbnails(prev => ({ ...prev, ...newThumbs }));
    } catch (e) { console.error(e); } finally { setIsGenerating(false); setGenPhase('idle'); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      label: label || 'New Shortcut',
      url: url.startsWith('http') ? url : `https://${url}`,
      thumbnails,
      isPrivate,
      appId: 'weblink',
      type: 'shortcut'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400"><Globe size={18} /></div>
            <h3 className="text-white font-bold text-base">Shortcut Studio</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase ml-1 tracking-widest">URL Domain</label>
              <input 
                type="text" required value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="domain.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase ml-1 tracking-widest">Display Name</label>
              <input 
                type="text" required value={label} onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase ml-1 tracking-widest">Visibility Settings</label>
            <div className="flex gap-3">
              <button 
                type="button" onClick={() => setIsPrivate(false)}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${!isPrivate ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
              >
                <ShieldCheck size={18} />
                <span className="text-xs font-bold">Public (Shared)</span>
              </button>
              <button 
                type="button" onClick={() => setIsPrivate(true)}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${isPrivate ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-500/10' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
              >
                <Lock size={18} />
                <span className="text-xs font-bold">Private (Only You)</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase ml-1 tracking-widest">Visual Art Style</label>
            <div className="grid grid-cols-5 gap-3">
              {AI_STYLES.map((style) => (
                <button
                  key={style.id} type="button" onClick={() => setSelectedStyle(style)}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all ${selectedStyle.id === style.id ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                >
                  <style.icon size={20} />
                  <span className="text-[9px] font-bold text-center">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-[24px] p-6 space-y-5 border border-white/10">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Asset Management</span>
              {thumbnails.icon && <CheckCircle2 size={16} className="text-emerald-500" />}
            </div>

            <div className="flex justify-around items-start gap-5 py-2">
              {[
                { k: 'icon', r: '1:1', w: 512, h: 512 },
                { k: 'card', r: '3:4', w: 480, h: 640 },
                { k: 'gallery', r: '9:16', w: 576, h: 1024 }
              ].map(s => (
                <div key={s.k} className="flex flex-col items-center gap-3 flex-1">
                  <div className={`
                    bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden transition-all relative group shadow-inner
                    ${s.k === 'icon' ? 'w-full aspect-square' : s.k === 'card' ? 'w-full aspect-[3/4]' : 'w-full aspect-[9/16]'}
                    ${genPhase.includes(s.k) ? 'ring-2 ring-blue-500 animate-pulse' : ''}
                  `}>
                    {thumbnails[s.k as keyof FileNode['thumbnails']] ? (
                      <img src={thumbnails[s.k as keyof FileNode['thumbnails']]} className="w-full h-full object-cover" />
                    ) : <ImageIcon size={20} className="text-white/5" />}
                    <button 
                      type="button" onClick={() => fileInputRefs[s.k as keyof typeof fileInputRefs].current?.click()}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                    >
                      <Upload size={20} className="mb-1" />
                      <span className="text-[10px] font-black uppercase">Replace</span>
                    </button>
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold">{s.r} Ratio</span>
                  <input type="file" className="hidden" accept="image/*" ref={fileInputRefs[s.k as keyof typeof fileInputRefs]} onChange={(e) => handleFileUpload(e, s.k as any, s.w, s.h)} />
                </div>
              ))}
            </div>

            <button 
              type="button" onClick={handleAiGenerate} disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isGenerating ? `${genPhase.replace('painting-', 'Drawing ')}...` : 'Paint Multi-Mode Assets with AI'}</span>
            </button>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-4 rounded-2xl border border-white/10 transition-all uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" className="flex-[2] bg-white text-black hover:bg-gray-200 text-sm font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-white/10">
              Save Shortcut
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddShortcutModal;
