
"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Desktop from '../components/Desktop';
import Taskbar from '../components/Taskbar';
import LoginScreen from '../components/LoginScreen';
import { OSProvider, useOS } from '../context/OSContext';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const { wallpaper } = useOS();

  const checkKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      try {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        setHasKey(false);
      }
    } else {
      setHasKey(true);
    }
  };

  useEffect(() => {
    checkKey();
    // 监听可能的权限变更
    const interval = setInterval(checkKey, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenKeyDialog = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // 触发后立即标记为可能有 Key，由下一轮 checkKey 最终确认
      setHasKey(true);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <AnimatePresence mode="wait">
        {!isLoggedIn && (
          <LoginScreen 
            key="login" 
            onLogin={() => setIsLoggedIn(true)} 
            needsKey={hasKey === false}
            onSelectKey={handleOpenKeyDialog}
          />
        )}
      </AnimatePresence>

      {isLoggedIn && (
        <>
            <Desktop />
            <Taskbar />
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <OSProvider>
      <AppContent />
    </OSProvider>
  );
}
