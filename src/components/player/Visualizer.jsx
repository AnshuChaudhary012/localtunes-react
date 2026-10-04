import React, { useRef, useEffect } from 'react';
import { player } from '../../services/player.js';

export function Visualizer({
  isPlaying = false,
  enabled = true,
  barCount = 28,
  className = 'w-full h-full',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = null;
    let isMounted = true;

    // Ensure AudioContext and Analyser are initialized if playing
    if (isPlaying) {
      player.setupWebAudio();
    }

    const resize = () => {
      if (!canvas || !isMounted) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = rect.width || 300;
      const displayHeight = rect.height || 40;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawRoundedBar = (x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      if (!isMounted) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 300;
      const height = rect.height || 40;

      ctx.clearRect(0, 0, width, height);

      const gap = 3;
      const barWidth = Math.max(2, (width - (barCount - 1) * gap) / barCount);

      // Linear gradient matching vanilla styling: cyan -> blue -> purple
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#a855f7');
      ctx.fillStyle = gradient;

      const freqData = player.getFrequencyData();
      const currentPlaying = isPlaying || player.isPlaying;
      const time = Date.now() * 0.003;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 3;

        if (currentPlaying && freqData && freqData.length > 0) {
          // Map bar index to frequency bin (focusing on the lower-mid range up to 70%)
          const binIndex = Math.floor((i / barCount) * (freqData.length * 0.7));
          const val = freqData[binIndex] || 0;
          const normalized = val / 255;
          barHeight = Math.max(3, normalized * (height - 4));
        } else if (currentPlaying) {
          // Organic spectrum simulation when WebAudio is disabled / unavailable / iOS
          const wave1 = Math.sin(time * 2.0 + i * 0.45);
          const wave2 = Math.cos(time * 3.1 + i * 0.25) * 0.6;
          const wave3 = Math.sin(time * 1.2 - i * 0.15) * 0.4;
          const combined = Math.max(0.08, (wave1 + wave2 + wave3 + 2.0) / 4.0);
          const centerEmphasis = 1 - Math.abs((i - barCount / 2) / (barCount / 2)) * 0.25;
          barHeight = Math.max(3, combined * centerEmphasis * (height - 6));
        }

        const x = i * (barWidth + gap);
        const y = height - barHeight;
        const radius = Math.min(barWidth / 2, 3);

        drawRoundedBar(x, y, barWidth, barHeight, radius);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      isMounted = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      window.removeEventListener('resize', resize);
      if (ctx && canvas) {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width || 300, rect.height || 40);
      }
    };
  }, [isPlaying, enabled, barCount]);

  if (!enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      id="player-visualizer-canvas"
      className={`${className} opacity-90`}
      aria-hidden="true"
    />
  );
}

export default Visualizer;
