import React, { useEffect, useRef, useState } from 'react';
import { 
  Zap, 
  Activity, 
  Shield, 
  ArrowRight, 
  Play, 
  Battery, 
  Cpu, 
  Menu, 
  X, 
  Youtube, 
  Linkedin, 
  Github, 
  Instagram, 
  Twitter, 
  Mail, 
  Globe, 
  ArrowUp 
} from 'lucide-react';
import clsx from 'clsx';
import { View } from '../types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Handle Scroll for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle Network Background Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const particleCount = Math.min(100, (width * height) / 10000); 

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, 
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw gradient background via canvas for smoother blend
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      gradient.addColorStop(0, '#0f172a'); // Slate-900
      gradient.addColorStop(1, '#020617'); // Slate-950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Mouse Interaction
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Interaction with mouse (repel)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const angle = Math.atan2(dy, dx);
          const force = (150 - dist) / 150;
          p.x -= Math.cos(angle) * force * 2;
          p.y -= Math.sin(angle) * force * 2;
        }

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${0.3 + (Math.random() * 0.2)})`; // Cyan pulse
        ctx.fill();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distX = p.x - p2.x;
          const distY = p.y - p2.y;
          const distSq = distX * distX + distY * distY;

          if (distSq < 20000) { // Connection range
            const connectionDist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - connectionDist / 141)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const SocialLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );

  return (
    <div className="relative min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-inter scanlines">
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none"
      />
      
      {/* Decorative Glowing Core Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen translate-y-20" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm bg-black/20 rounded-b-2xl border-b border-white/5">
        <div 
          className="flex items-center gap-2 relative z-50 cursor-pointer group" 
          onClick={() => onNavigate('landing')}
        >
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
            <Activity className="text-cyan-400 w-6 h-6 group-hover:animate-pulse" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider">GRID<span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">BALANCER</span></span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 after:transition-all hover:after:w-full">TECHNOLOGY</a>
          <a href="#mission" className="hover:text-cyan-400 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 after:transition-all hover:after:w-full">MISSION</a>
          <a href="#system" className="hover:text-cyan-400 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 after:transition-all hover:after:w-full">SYSTEM STATUS</a>
        </div>

        <button 
          onClick={() => onNavigate('game')}
          className="hidden md:block px-6 py-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-500/10 hover:border-cyan-400 text-cyan-400 transition-all text-sm font-display tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] group overflow-hidden relative"
          aria-label="Login to System"
        >
          <span className="relative z-10">LOGIN // SYSTEM</span>
          <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden relative z-50 p-2 text-slate-300 hover:text-white bg-slate-800/50 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Overlay Menu */}
        <div className={clsx(
          "fixed inset-0 bg-[#050510]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden border-l border-white/10",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
           <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-xl font-display text-slate-300 hover:text-cyan-400">TECHNOLOGY</a>
           <a href="#mission" onClick={() => setIsMenuOpen(false)} className="text-xl font-display text-slate-300 hover:text-cyan-400">MISSION</a>
           <a href="#system" onClick={() => setIsMenuOpen(false)} className="text-xl font-display text-slate-300 hover:text-cyan-400">SYSTEM STATUS</a>
           <button 
            onClick={() => { setIsMenuOpen(false); onNavigate('game'); }}
            className="px-10 py-4 rounded-lg bg-cyan-500 text-black font-bold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] font-display"
          >
            INITIALIZE SYSTEM
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-16 md:pt-28 pb-20 md:pb-32 px-4 text-center min-h-[80vh]">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-xs text-cyan-300 mb-8 font-mono animate-fade-in shadow-lg hover:border-cyan-500/50 transition-colors backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          SYSTEM V.2.04 ONLINE
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-black tracking-tight mb-8 drop-shadow-2xl relative">
          <span className="block text-white mb-2">MASTER THE</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 animate-pulse-slow filter drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            ENERGY GRID
          </span>
        </h1>
        
        <p className="max-w-2xl text-base md:text-xl text-slate-300 mb-12 leading-relaxed px-4 font-light border-l-2 border-cyan-500/30 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
          The city's heartbeat is in your hands. Balance fluctuating solar inputs against surging urban demand. 
          <span className="text-cyan-400 font-medium"> Prevent blackouts.</span> <span className="text-red-400 font-medium">Avoid explosions.</span> 
          <br className="hidden md:block"/> Do not fail the directive.
        </p>
        
        <button 
          onClick={() => onNavigate('game')}
          className="group relative px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-lg tracking-wider clip-path-slant transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(6,182,212,0.4)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 overflow-hidden"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          aria-label="Start Game Simulation"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12 origin-bottom-left" />
          <span className="flex items-center gap-3 relative z-10">
            INITIALIZE SIMULATION <Play className="w-5 h-5 fill-current" />
          </span>
        </button>

        <div className="mt-20 flex flex-wrap justify-center gap-6 md:gap-16 text-slate-400 font-mono text-xs md:text-sm">
          <div className="flex flex-col items-center gap-3 group cursor-default">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">REAL-TIME SIM</span>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-default">
             <div className="p-3 rounded-full bg-slate-900 border border-slate-800 group-hover:border-yellow-500/50 group-hover:text-yellow-400 transition-all shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <span className="tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">DYNAMIC LOADS</span>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-default">
             <div className="p-3 rounded-full bg-slate-900 border border-slate-800 group-hover:border-green-500/50 group-hover:text-green-400 transition-all shadow-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">50HZ PRECISION</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 bg-gradient-to-b from-transparent via-[#0a0f1e] to-transparent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="group p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-cyan-500/50 hover:to-blue-600/50 transition-all duration-500 shadow-xl hover:shadow-cyan-500/20">
            <div className="h-full bg-[#050510] rounded-xl p-8 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
              
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center mb-8 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all duration-300 shadow-lg">
                <Battery className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-white group-hover:text-cyan-200 transition-colors">Resource Management</h3>
              <p className="text-slate-400 leading-relaxed text-sm flex-1 font-light">
                Capture solar energy during the day. Store it in battery banks. Deploy backup generators when demand spikes. Every kilowatt counts.
              </p>
              <div className="mt-6 h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-1/3 group-hover:w-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-yellow-500/50 hover:to-orange-600/50 transition-all duration-500 shadow-xl hover:shadow-yellow-500/20">
             <div className="h-full bg-[#050510] rounded-xl p-8 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />

              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center mb-8 group-hover:border-yellow-500/50 group-hover:text-yellow-400 transition-all duration-300 shadow-lg">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-white group-hover:text-yellow-200 transition-colors">Frequency Stability</h3>
              <p className="text-slate-400 leading-relaxed text-sm flex-1 font-light">
                The grid must maintain <span className="text-white font-mono bg-white/10 px-1 rounded">50.00 Hz</span>. Too much power speeds it up; too little slows it down. Chaos awaits at the margins.
              </p>
               <div className="mt-6 flex items-center gap-1 h-4">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className={`w-1 bg-slate-800 group-hover:bg-yellow-500 transition-colors delay-${i*75} h-${[2,3,4,3,2][i]}`} />
                 ))}
               </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-red-500/50 hover:to-pink-600/50 transition-all duration-500 shadow-xl hover:shadow-red-500/20">
             <div className="h-full bg-[#050510] rounded-xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all" />

              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center mb-8 group-hover:border-red-500/50 group-hover:text-red-400 transition-all duration-300 shadow-lg">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-white group-hover:text-red-200 transition-colors">Catastrophe Avoidance</h3>
              <p className="text-slate-400 leading-relaxed text-sm flex-1 font-light">
                Below 45Hz lies blackout. Above 55Hz lies destruction. Your decisions stand between the city and total darkness.
              </p>
              <div className="mt-6 flex justify-between items-center text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity border border-red-900/50 bg-red-950/30 px-2 py-1 rounded">
                 <span>WARNING</span>
                 <span className="animate-pulse font-bold">CRITICAL</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Story / Lore Section */}
      <section id="mission" className="relative py-24 border-y border-white/5 bg-[#080c16]">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 text-white">THE YEAR IS 2048</h2>
            <div className="h-1 w-24 bg-cyan-500 mx-auto mb-10 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10 font-light max-w-2xl mx-auto">
              Legacy fossil fuels are depleted. The <span className="text-white font-medium">Global Energy Directorate</span> has commissioned autonomous micro-grids for the remaining mega-cities. You are the newly appointed Lead Operator for Sector 7. The demand is high, the solar arrays are aging, and the margin for error is zero.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => onNavigate('game')}
                className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-3 group text-lg px-6 py-3 border border-cyan-500/20 rounded-full hover:bg-cyan-500/10 transition-all"
              >
                BEGIN SIMULATION <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#020617] text-center relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div 
                className="flex items-center gap-2 mb-6 cursor-pointer group" 
                onClick={() => onNavigate('landing')}
              >
                <Activity className="text-cyan-400 w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="font-display font-bold text-lg text-white tracking-wider">GRID<span className="text-cyan-400">BALANCER</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Next-gen energy grid simulation. Manage resources, optimize flow, and survive the surge. Built for the modern web.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-6 font-display">Explore</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400 transition-colors text-left w-full flex items-center gap-2 hover:translate-x-1 duration-200"><span className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100"></span> Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('terms')} className="hover:text-cyan-400 transition-colors text-left w-full flex items-center gap-2 hover:translate-x-1 duration-200">Terms of Service</button>
                </li>
                <li><a href="https://vickyiitp.tech" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200">Main Website <Globe className="w-3 h-3"/></a></li>
              </ul>
            </div>

             {/* Contact */}
             <div>
              <h4 className="font-bold text-white mb-6 font-display">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-cyan-500" /> themvaplatform@gmail.com</li>
                <li className="flex items-center gap-3"><Globe className="w-4 h-4 text-cyan-500" /> IIT Patna, Devil Labs</li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-bold text-white mb-6 font-display">Connect</h4>
              <div className="flex flex-wrap gap-3">
                 <SocialLink href="https://youtube.com/@vickyiitp" icon={Youtube} label="YouTube" />
                 <SocialLink href="https://linkedin.com/in/vickyiitp" icon={Linkedin} label="LinkedIn" />
                 <SocialLink href="https://x.com/vickyiitp" icon={Twitter} label="X (Twitter)" />
                 <SocialLink href="https://github.com/vickyiitp" icon={Github} label="GitHub" />
                 <SocialLink href="https://instagram.com/vickyiitp" icon={Instagram} label="Instagram" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-mono">
            <p>&copy; 2025 VICKY KUMAR (VICKYIITP). ALL RIGHTS RESERVED.</p>
            <p className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> SYSTEM OPTIMIZED</p>
          </div>
        </div>
      </footer>

      {/* Back To Top Button */}
      <button 
        onClick={scrollToTop}
        className={clsx(
          "fixed bottom-8 right-8 p-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-500 z-50 transform hover:-translate-y-1 active:scale-95",
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

    </div>
  );
};

export default LandingPage;