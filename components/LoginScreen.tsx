import React from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <motion.div 
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/10 border border-white/10 shadow-2xl backdrop-blur-xl w-80">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-1 shadow-lg shadow-purple-500/20">
             <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/20">
                <User size={40} className="text-white/80" />
             </div>
        </div>
        
        <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold text-white tracking-tight">User</h1>
            <p className="text-sm text-gray-400">Locked</p>
        </div>

        <button 
            onClick={onLogin}
            className="group flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/5 active:scale-95"
        >
            <span>Enter Desktop</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default LoginScreen;