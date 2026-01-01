
import { LucideIcon } from 'lucide-react';
import React from 'react';

export type LayoutMode = 'icon' | 'card' | 'gallery';

export type AppID = 
  | 'computer' | 'trash' | 'browser' | 'documents' | 'settings' 
  | 'music' | 'gallery' | 'videos' | 'terminal' | 'mail' 
  | 'calendar' | 'calculator' | 'games' | 'cloud' | 'security'
  | 'weblink';

export interface AppConfig {
  id: AppID;
  name: string;
  icon: LucideIcon;
  color: string;
  component?: React.ComponentType;
}

export interface FileNode {
  id: string;        
  appId: AppID;      
  label: string;     
  type: 'shortcut' | 'file' | 'folder';
  x: number;        
  y: number;        
  path: string;      
  page?: number;
  
  url?: string;           
  thumbnail?: string; 
  thumbnails?: {
    icon?: string;    // 1:1
    card?: string;    // 3:4
    gallery?: string; // 9:16
  };
  
  // New features
  isPrivate?: boolean;
  news?: { title: string; snippet: string; url: string }[];
}
