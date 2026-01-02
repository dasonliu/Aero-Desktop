
"use client";

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Desktop from '../components/Desktop';
import Taskbar from '../components/Taskbar';
import LoginScreen from '../components/LoginScreen';
import { OSProvider, useOS } from '../context/OSContext';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { wallpaper } = useOS();

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <AnimatePresence mode="wait">
        {!isLoggedIn && (
          <LoginScreen key="login" onLogin={() => setIsLoggedIn(true)} />
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
