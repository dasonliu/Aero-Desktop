
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import LoginScreen from './components/LoginScreen';
import { OSProvider, useOS } from './context/OSContext';

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { wallpaper } = useOS();

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />

      <AnimatePresence mode="wait">
        {!isLoggedIn && (
          <LoginScreen key="login" onLogin={() => setIsLoggedIn(true)} />
        )}
      </AnimatePresence>

      {/* Desktop Environment */}
      {isLoggedIn && (
        <>
            <Desktop />
            <Taskbar />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <OSProvider>
      <AppContent />
    </OSProvider>
  );
};

export default App;
