
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ParticleClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: any[] = [];
    const particleCount = 40; // 减少移动端开销

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, x: 100, y: -100 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      className="absolute top-4 right-4 sm:top-10 sm:right-10 z-30 cursor-move group"
    >
      <div className="relative p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden min-w-[200px] sm:min-w-[280px]">
        <canvas 
          ref={canvasRef} 
          width={240} 
          height={100} 
          className="absolute inset-0 pointer-events-none opacity-40"
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[8px] sm:text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2 opacity-60">Chronos Core</div>
          <div className="text-3xl sm:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {timeString}
          </div>
          <div className="mt-2 sm:mt-4 flex gap-1.5 sm:gap-2">
            <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/5 rounded-full text-[7px] sm:text-[9px] text-white/40 font-bold border border-white/5">
              {time.toLocaleDateString([], { weekday: 'short' })}
            </div>
            <div className="hidden sm:block px-3 py-1 bg-white/5 rounded-full text-[9px] text-white/40 font-bold border border-white/5">
              {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        
        {/* Subtle decorative elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
};

export default ParticleClock;
