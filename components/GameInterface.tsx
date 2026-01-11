import React, { useEffect, useRef } from 'react';
import { 
  Zap, 
  Sun, 
  Battery, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Power,
  LogOut
} from 'lucide-react';
import { useGridGame } from '../hooks/useGridGame';
import Oscilloscope from './Oscilloscope';
import { BatteryMode, GameStatus } from '../types';
import { TARGET_FREQUENCY } from '../constants';
import clsx from 'clsx';

interface GameInterfaceProps {
  onExit: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ onExit }) => {
  const { gameState, toggleGenerator, setBatteryMode, resetGame } = useGridGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Format Time 00:00
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isGameOver = gameState.status !== GameStatus.PLAYING;
  
  // Calculate stability percentage for color coding
  const freqDeviation = Math.abs(gameState.frequency - TARGET_FREQUENCY);
  const dangerZone = freqDeviation > 3;

  // 3D Moving Grid Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationId: number;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = '#050510'; // Dark background
      ctx.fillRect(0, 0, width, height);

      // Draw Horizon Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617'); // Top dark
      gradient.addColorStop(0.4, '#0f172a'); // Horizon line color
      gradient.addColorStop(0.4, '#0f172a'); // Sharp horizon
      gradient.addColorStop(1, '#020617'); // Bottom dark
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Horizon Glow
      const horizonY = height * 0.4;
      const glow = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 50);
      glow.addColorStop(0, 'rgba(6, 182, 212, 0)');
      glow.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
      glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - 50, width, 100);

      // Draw Grid (Perspective)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      const FOV = 300;
      const gridHeight = height - horizonY;
      const gridWidth = width * 2; // Wider than screen to cover corners
      
      // Vertical Lines (Z-axis)
      for (let x = -gridWidth; x < gridWidth; x += 100) {
        // Perspective calculation
        // Top point (at horizon)
        const x1 = width / 2 + (x - width/2) * (FOV / (FOV + 1000)); 
        const y1 = horizonY;
        
        // Bottom point (near camera)
        const x2 = width / 2 + (x - width/2) * (FOV / FOV); 
        const y2 = height;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }

      // Horizontal Lines (X-axis moving towards camera)
      // We loop Z from far to near
      const speed = 2; // Movement speed
      offset = (offset + speed) % 100;

      for (let z = 0; z < 1000; z += 100) {
        const currentZ = z - offset;
        if (currentZ < 0) continue; // Behind camera

        // Calculate Y position based on Z depth
        // Simple projection: y = horizonY + (height - horizonY) * (FOV / (FOV + z))
        // Actually, we want linear steps in 3D space, which bunch up near horizon
        
        const scale = FOV / (FOV + currentZ);
        const y = horizonY + (height * 0.6) * scale; // Limit grid height to not stretch infinitely

        // Draw horizontal line at y
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      ctx.stroke();

      // Add "Sun" or "Moon"
      const sunGradient = ctx.createRadialGradient(width / 2, horizonY - 80, 10, width / 2, horizonY - 80, 60);
      sunGradient.addColorStop(0, 'rgba(234, 179, 8, 0.8)'); // Yellow core
      sunGradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(width / 2, horizonY - 80, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // Scanlines effect on canvas
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 1);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

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

  return (
    <div className="min-h-screen bg-[#050510] text-slate-200 p-4 lg:p-8 flex flex-col gap-6 relative overflow-hidden animate-fade-in font-inter">
      
      {/* 3D Grid Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      {/* Overlay vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center pb-4 gap-4 border-b border-white/10 backdrop-blur-md bg-black/20 rounded-xl p-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Activity className="text-yellow-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white text-holo">GRID <span className="text-yellow-400">BALANCER</span></h1>
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-mono">System Stability Control</p>
            </div>
          </div>
          <button 
            onClick={onExit}
            className="md:hidden p-2 rounded hover:bg-slate-800 text-slate-500 transition-colors"
            title="Exit to Menu"
            aria-label="Exit Game"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-6 w-full md:w-auto md:bg-transparent p-1 rounded-lg">
          <div className="text-center md:text-right">
             <div className="text-[10px] md:text-xs text-slate-500 uppercase font-mono">Time</div>
             <div className="font-mono text-lg md:text-xl text-cyan-400 leading-tight drop-shadow-lg">{formatTime(gameState.timeOfDay)}</div>
          </div>
          <div className="text-center md:text-right border-l border-slate-700 md:border-none pl-2 md:pl-0">
             <div className="text-[10px] md:text-xs text-slate-500 uppercase font-mono">Cycle</div>
             <div className="font-mono text-lg md:text-xl text-white leading-tight drop-shadow-lg">DAY {gameState.day}</div>
          </div>
          <div className="text-center md:text-right border-l border-slate-700 md:border-none pl-2 md:pl-0 md:mr-4">
             <div className="text-[10px] md:text-xs text-slate-500 uppercase font-mono">Score</div>
             <div className="font-mono text-lg md:text-xl text-green-400 leading-tight drop-shadow-lg">{(gameState.score / 60).toFixed(0)}</div>
          </div>
          <button 
            onClick={onExit}
            className="hidden md:block p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Exit to Menu"
            aria-label="Exit Game"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-slate-900/90 border border-slate-700 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
             {/* Decorative glow */}
            <div className={clsx(
              "absolute top-0 left-0 w-full h-1",
              gameState.status === GameStatus.GAME_OVER_BLACKOUT ? "bg-slate-500 shadow-[0_0_20px_white]" : "bg-red-500 shadow-[0_0_20px_red]"
            )} />

            <div className="mb-6 flex justify-center">
              {gameState.status === GameStatus.GAME_OVER_BLACKOUT ? (
                <div className="p-4 bg-slate-800 rounded-full border border-slate-700 shadow-xl"><Power className="w-12 h-12 text-slate-500" /></div>
              ) : (
                <div className="p-4 bg-red-900/20 rounded-full border border-red-900/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"><AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" /></div>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 tracking-wide">SYSTEM FAILURE</h2>
            <p className="text-slate-400 mb-6 font-mono text-xs md:text-sm">
              {gameState.status === GameStatus.GAME_OVER_BLACKOUT 
                ? "Voltage dropped too low. The city has blacked out." 
                : "Voltage spiked uncontrollably. Transformer explosion detected."}
            </p>
            <div className="mb-8 p-4 bg-black/40 rounded-lg border border-slate-800">
              <div className="text-sm text-slate-500 uppercase font-mono">Final Uptime</div>
              <div className="text-2xl font-mono text-green-400">{(gameState.score / 60).toFixed(1)} Hours</div>
            </div>
            <button 
              onClick={resetGame}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-display font-bold rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wide shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]"
            >
              <RotateCcw className="w-5 h-5" />
              Reboot System
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 z-10 h-full relative">
        
        {/* Left Column: SOURCES */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2 pl-2">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold tracking-wider font-display text-sm">GENERATION</h3>
          </div>

          {/* Solar Panel Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sun className="w-24 h-24 text-cyan-400" />
            </div>
            <div className="relative z-10">
              <h4 className="text-cyan-200/70 text-sm uppercase font-bold mb-4 font-mono tracking-wider">Solar Array A-1</h4>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">{gameState.solarOutput.toFixed(0)}</span>
                <span className="text-sm text-slate-400 mb-1">kW</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${(gameState.solarOutput / 600) * 100}%` }}></div>
              </div>
              <p className="mt-4 text-xs text-slate-500 font-mono">
                Status: {gameState.solarOutput > 10 ? "ACTIVE" : "OFFLINE"} // Passive Generation
              </p>
            </div>
          </div>

          {/* Generator Card */}
          <div className={clsx(
            "border p-6 rounded-2xl relative transition-all duration-300 backdrop-blur-md",
            gameState.isGeneratorOn 
              ? "bg-slate-900/80 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
              : "bg-slate-900/40 border-white/10 hover:border-white/20"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-orange-200/70 text-sm uppercase font-bold font-mono tracking-wider">Backup Turbine</h4>
                <div className="text-[10px] md:text-xs text-slate-500 mt-1 font-mono">Manual Override Available</div>
              </div>
              <button 
                onClick={toggleGenerator}
                className={clsx(
                  "w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-inner",
                  gameState.isGeneratorOn ? "bg-orange-500" : "bg-slate-700"
                )}
                aria-label={gameState.isGeneratorOn ? "Turn off Generator" : "Turn on Generator"}
              >
                <div className={clsx(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm",
                  gameState.isGeneratorOn ? "left-7" : "left-1"
                )} />
              </button>
            </div>
            
            <div className="flex items-end gap-2 mb-2">
                <span className={clsx("text-3xl md:text-4xl font-mono font-bold transition-all", gameState.isGeneratorOn ? "text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" : "text-slate-600")}>
                  {gameState.generatorOutput.toFixed(0)}
                </span>
                <span className="text-sm text-slate-500 mb-1">kW</span>
            </div>
             <p className="mt-2 text-xs text-slate-500 font-mono">
                Emergency power injection. Use to counter demand spikes.
              </p>
          </div>

          {/* Net Power Stat */}
          <div className="bg-slate-900/40 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-slate-900/60 transition-colors backdrop-blur-sm">
            <span className="text-slate-400 text-sm font-bold uppercase font-mono">Net Grid Flow</span>
            <span className={clsx(
              "font-mono font-bold text-lg drop-shadow-md",
              gameState.netPower > 0 ? "text-green-400" : gameState.netPower < 0 ? "text-red-400" : "text-slate-400"
            )}>
              {gameState.netPower > 0 ? "+" : ""}{gameState.netPower.toFixed(1)} kW
            </span>
          </div>
        </div>


        {/* Middle Column: VISUALIZATION */}
        <div className="flex flex-col gap-4 h-full min-h-[350px] lg:min-h-0 order-first lg:order-none">
          <div className="flex items-center gap-2 text-yellow-400 mb-2 justify-center lg:justify-start">
            <Activity className="w-5 h-5" />
            <h3 className="font-bold tracking-wider font-display text-sm">GRID FREQUENCY</h3>
          </div>

          <div className="flex-1 bg-black/80 rounded-2xl border-2 border-slate-700 relative overflow-hidden shadow-2xl flex flex-col h-full ring-1 ring-white/5">
            {/* Frequency Readout */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <span className={clsx(
                "font-mono text-3xl md:text-4xl font-bold transition-colors duration-300 block",
                dangerZone ? "text-red-500 animate-pulse drop-shadow-[0_0_10px_red]" : "text-yellow-400 drop-shadow-[0_0_5px_yellow]"
              )}>
                {gameState.frequency.toFixed(2)} <span className="text-sm opacity-70">Hz</span>
              </span>
            </div>

            {/* Target Line Indicators */}
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 text-right text-[10px] text-slate-600 font-mono pointer-events-none z-10">
                <div className="text-red-500 font-bold border-b border-red-900 w-12 ml-auto">55.0</div>
                <div className="text-yellow-500 border-b border-yellow-900/30 w-8 ml-auto">52.5</div>
                <div className="text-cyan-500 border-b border-cyan-900 w-16 ml-auto">50.0</div>
                <div className="text-yellow-500 border-b border-yellow-900/30 w-8 ml-auto">47.5</div>
                <div className="text-red-500 font-bold border-b border-red-900 w-12 ml-auto">45.0</div>
             </div>

            <Oscilloscope frequency={gameState.frequency} status={gameState.status} />
            
            {/* Status Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>WAVE_FORM: SINE</span>
              <span className={dangerZone ? "text-red-500 font-bold animate-pulse" : "text-green-500"}>
                {dangerZone ? "WARNING: UNSTABLE" : "STATUS: NOMINAL"}
              </span>
            </div>
          </div>
        </div>


        {/* Right Column: SINKS & STORAGE */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2 justify-end lg:justify-start pl-2">
             <TrendingUp className="w-5 h-5" />
             <h3 className="font-bold tracking-wider font-display text-sm">LOAD & STORAGE</h3>
          </div>

          {/* City Demand */}
           <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden hover:border-purple-500/30 transition-colors shadow-lg">
             <h4 className="text-purple-200/70 text-sm uppercase font-bold mb-4 font-mono tracking-wider">City Demand</h4>
             <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">{gameState.cityDemand.toFixed(0)}</span>
                <span className="text-sm text-slate-400 mb-1">kW</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: `${Math.min(100, (gameState.cityDemand / 800) * 100)}%` }}></div>
              </div>
              <p className="mt-4 text-xs text-slate-500 font-mono">
                Fluctuates based on time of day. 
                <br/>Peak hours: 09:00 & 19:00.
              </p>
           </div>

           {/* Battery Control */}
           <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex-1 flex flex-col hover:border-slate-600 transition-colors shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <Battery className={clsx(
                     "w-6 h-6",
                     gameState.batteryLevel < 20 ? "text-red-500 animate-pulse" : "text-green-400"
                   )} />
                   <h4 className="text-green-200/70 text-sm uppercase font-bold font-mono tracking-wider">Grid Battery</h4>
                </div>
                <span className="font-mono text-white font-bold text-xl">{gameState.batteryLevel.toFixed(0)}%</span>
              </div>

              {/* Battery Visual Bar */}
              <div className="w-full h-14 border-2 border-slate-700/50 rounded-lg p-1.5 mb-6 relative bg-black/40">
                 <div 
                   className={clsx(
                     "h-full rounded transition-all duration-300 relative overflow-hidden",
                     gameState.batteryLevel < 20 ? "bg-red-500/80 shadow-[0_0_15px_red]" : "bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                   )}
                   style={{ width: `${gameState.batteryLevel}%` }}
                 >
                    {/* Animated charging stripes */}
                    {gameState.batteryMode !== BatteryMode.IDLE && (
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px] animate-[pulse_1s_linear_infinite]" />
                    )}
                 </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-2 mt-auto">
                 <button
                   onClick={() => setBatteryMode(BatteryMode.CHARGE)}
                   disabled={gameState.batteryLevel >= 100}
                   className={clsx(
                     "py-3 rounded-lg text-xs font-bold uppercase transition-all border font-mono relative overflow-hidden group",
                     gameState.batteryMode === BatteryMode.CHARGE 
                       ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                       : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   )}
                   aria-label="Charge Battery"
                 >
                   Charge
                   {gameState.batteryMode === BatteryMode.CHARGE && <div className="absolute inset-0 bg-blue-400/10 animate-pulse" />}
                 </button>
                 <button
                   onClick={() => setBatteryMode(BatteryMode.IDLE)}
                   className={clsx(
                     "py-3 rounded-lg text-xs font-bold uppercase transition-all border font-mono",
                     gameState.batteryMode === BatteryMode.IDLE 
                       ? "bg-slate-500/20 border-slate-400 text-white" 
                       : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700"
                   )}
                   aria-label="Idle Battery"
                 >
                   Idle
                 </button>
                 <button
                   onClick={() => setBatteryMode(BatteryMode.DISCHARGE)}
                   disabled={gameState.batteryLevel <= 0}
                   className={clsx(
                     "py-3 rounded-lg text-xs font-bold uppercase transition-all border font-mono relative overflow-hidden",
                     gameState.batteryMode === BatteryMode.DISCHARGE 
                       ? "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                       : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   )}
                   aria-label="Discharge Battery"
                 >
                   Supply
                   {gameState.batteryMode === BatteryMode.DISCHARGE && <div className="absolute inset-0 bg-green-400/10 animate-pulse" />}
                 </button>
              </div>
              <div className="text-center mt-3 text-[10px] text-slate-500 font-mono tracking-wide h-4">
                {gameState.batteryMode === BatteryMode.CHARGE && <span className="text-blue-400 animate-pulse">ABSORBING EXCESS POWER...</span>}
                {gameState.batteryMode === BatteryMode.DISCHARGE && <span className="text-green-400 animate-pulse">INJECTING SAVED POWER...</span>}
                {gameState.batteryMode === BatteryMode.IDLE && "BATTERY DISCONNECTED"}
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default GameInterface;