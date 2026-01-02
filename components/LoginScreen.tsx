
import React from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Key } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  needsKey?: boolean;
  onSelectKey?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, needsKey, onSelectKey }) => {
  return (
    <motion.div 
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/10 border border-white/10 shadow-2xl backdrop-blur-xl w-80">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-1 shadow-lg shadow-purple-500/20">
             <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/20">
                <User size={40} className="text-white/80" />
             </div>
        </div>
        
        <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold text-white tracking-tight">System User</h1>
            <p className="text-sm text-gray-400">{needsKey ? 'Action Required' : 'Locked'}</p>
        </div>

        <div className="w-full space-y-3">
          {needsKey ? (
            <button 
              onClick={onSelectKey}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold active:scale-95 shadow-lg shadow-blue-900/40"
            >
              <Key size={18} />
              <span>Select API Key</span>
            </button>
          ) : (
            <button 
                onClick={onLogin}
                className="group flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/5 active:scale-95"
            >
                <span>Enter Desktop</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {needsKey && (
            <p className="text-[10px] text-gray-500 text-center leading-tight">
              An API key from a paid GCP project is required for AI features. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 ml-1 hover:underline">Learn more</a>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LoginScreen;
