
import { 
  Monitor, Trash2, Globe, Folder, Settings, Music, 
  Image as ImageIcon, Video, Terminal, Mail, Calendar, 
  Calculator, Gamepad2, Cloud, Lock, Link
} from 'lucide-react';
import { AppConfig, AppID } from '../types';

// This acts as a database/registry of all available applications in the OS
export const APP_REGISTRY: Record<AppID, AppConfig> = {
  computer: { id: 'computer', name: 'My PC', icon: Monitor, color: 'text-blue-400' },
  trash: { id: 'trash', name: 'Recycle Bin', icon: Trash2, color: 'text-gray-400' },
  browser: { id: 'browser', name: 'Browser', icon: Globe, color: 'text-emerald-400' },
  documents: { id: 'documents', name: 'Documents', icon: Folder, color: 'text-yellow-400' },
  settings: { id: 'settings', name: 'Settings', icon: Settings, color: 'text-slate-300' },
  music: { id: 'music', name: 'Music', icon: Music, color: 'text-pink-400' },
  gallery: { id: 'gallery', name: 'Gallery', icon: ImageIcon, color: 'text-purple-400' },
  videos: { id: 'videos', name: 'Videos', icon: Video, color: 'text-red-400' },
  terminal: { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'text-gray-200' },
  mail: { id: 'mail', name: 'Mail', icon: Mail, color: 'text-blue-300' },
  calendar: { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'text-orange-400' },
  calculator: { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-teal-400' },
  games: { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-indigo-400' },
  cloud: { id: 'cloud', name: 'Cloud Storage', icon: Cloud, color: 'text-sky-300' },
  security: { id: 'security', name: 'Security', icon: Lock, color: 'text-yellow-200' },
  weblink: { id: 'weblink', name: 'Web Link', icon: Link, color: 'text-white' }, // Fallback
};

// Helper to get config safely
export const getAppConfig = (appId: AppID): AppConfig => {
  return APP_REGISTRY[appId] || APP_REGISTRY['weblink']; 
};
