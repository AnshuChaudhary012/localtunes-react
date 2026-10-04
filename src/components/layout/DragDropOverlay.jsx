import React from 'react';

export function DragDropOverlay({ isDragging = false }) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-cyan-950/85 backdrop-blur-md flex flex-col items-center justify-center p-8 border-4 border-dashed border-cyan-400 transition-opacity duration-200 ${
        isDragging ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow mb-4 animate-bounce">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">Drop audio files to import</h3>
      <p className="text-sm text-cyan-200">Files will be saved directly into your browser's offline storage</p>
    </div>
  );
}
