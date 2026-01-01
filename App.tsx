
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import LoginScreen from './components/LoginScreen';
import { WALLPAPER_URL } from './constants';
import { OSProvider } from './context/OSContext';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <OSProvider>
      <div 
        className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none"
        style={{ backgroundImage: `url(${WALLPAPER_URL})` }}
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
    </OSProvider>
  );
};

export default App;
