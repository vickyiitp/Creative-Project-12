import React, { useRef, useEffect } from 'react';
import { GameStatus } from '../types';

interface OscilloscopeProps {
  frequency: number;
  status: GameStatus;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({ frequency, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      // Handle resizing
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      // Clear with trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Slate-950 with opacity for trail
      ctx.fillRect(0, 0, w, h);

      if (status === GameStatus.GAME_OVER_BLACKOUT) {
         // Draw nothing, just darkness
         return;
      }

      ctx.beginPath();
      
      // Determine wave properties based on grid frequency
      // Ideal is 50Hz.
      // Visual Frequency: Higher grid Hz = Tighter waves
      // Visual Amplitude: Deviation from 50Hz makes it "shake" (amplitude modulation) or color change
      
      const deviation = Math.abs(frequency - 50);
      const isUnstable = deviation > 2.0;
      const isDanger = deviation > 4.0;
      
      // Map 50Hz to a pleasing visual frequency
      const visualFreq = (frequency / 50) * 0.02; 
      const baseAmplitude = h * 0.3;
      
      // Add "jitter" if unstable
      const jitter = isUnstable ? (Math.random() - 0.5) * deviation * 5 : 0;

      // Color
      if (isDanger) ctx.strokeStyle = '#ef4444'; // Red-500
      else if (isUnstable) ctx.strokeStyle = '#eab308'; // Yellow-500
      else ctx.strokeStyle = '#22d3ee'; // Cyan-400

      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;

      for (let x = 0; x < w; x++) {
        const y = centerY + Math.sin(x * visualFreq + phase) * baseAmplitude + jitter;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Center Line (50Hz Target)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();

      // Update Phase
      // Speed increases with frequency
      phase += frequency * 0.005;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [frequency, status]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full rounded-lg bg-slate-950 border border-slate-800"
    />
  );
};

export default Oscilloscope;
