"use client";

import { useState, useRef } from 'react';
import { uploadQris } from '@/app/actions/qris';

export default function QrisViewer({ initialUrl, role }: { initialUrl: string | null, role: string }) {
  const [qrisUrl, setQrisUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- State untuk Zoom & Pan ---
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Handle Klik (Pemisah Single & Double Click)
  const handleClick = () => {
    if (clickTimeout.current !== null) {
      // Jika diklik lagi saat timer masih jalan -> Double Click
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (qrisUrl) setIsFullscreen(true); // Buka fullscreen (Admin & User)
    } else {
      // Mulai timer untuk Single Click
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        if (role === 'admin') {
          fileInputRef.current?.click(); // Buka file upload (Hanya Admin)
        }
      }, 250); // Waktu jeda 250ms
    }
  };

  // Handle Upload File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    
    const res = await uploadQris(formData);
    if (res.success && res.url) {
      setQrisUrl(res.url);
    } else {
      alert(res.message);
    }
    setIsUploading(false);
  };

  // --- Handlers untuk Pan & Zoom (Fullscreen) ---
  const handleWheel = (e: React.WheelEvent) => {
    setScale(prev => Math.min(Math.max(0.5, prev - e.deltaY * 0.005), 4)); // Zoom min 0.5x, max 4x
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
      <div className="w-full mb-4">
        <h2 className="text-lg font-bold text-gray-800">Pembayaran Kas via QRIS</h2>
        <p className="text-sm text-gray-500">
          {role === 'admin' 
            ? 'Klik 1x untuk ganti QRIS. Klik 2x untuk perbesar.' 
            : 'Klik 2x pada gambar untuk memperbesar QRIS.'}
        </p>
      </div>

      {/* Container Gambar (Aspect Ratio 1:1) */}
      <div 
        onClick={handleClick}
        className={`relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center transition-all ${
          role === 'admin' ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-50/50' : 'cursor-zoom-in'
        } ${qrisUrl ? 'border-transparent' : 'border-gray-300 bg-gray-50'}`}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <span className="font-semibold text-blue-600 animate-pulse">Mengunggah...</span>
          </div>
        )}

        {qrisUrl ? (
          <img src={qrisUrl} alt="QRIS Kelas" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-gray-400 p-4">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm font-medium">Upload gambar QRIS Anda</p>
          </div>
        )}
      </div>

      {/* Input File Tersembunyi */}
      {role === 'admin' && (
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      )}

      {/* --- Modal Fullscreen dengan Pan & Zoom --- */}
      {isFullscreen && qrisUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center overflow-hidden">
          {/* Tombol Close */}
          <button 
            onClick={closeFullscreen}
            className="absolute top-6 right-6 z-[60] bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl backdrop-blur-sm transition"
          >
            ✕
          </button>
          
          <div className="absolute bottom-6 text-white/50 text-sm z-[60] pointer-events-none">
            Gunakan scroll untuk zoom, dan drag untuk menggeser.
          </div>

          {/* Area Interaktif Gambar */}
          <div 
            className="w-full h-full flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img 
              src={qrisUrl} 
              alt="QRIS Fullscreen" 
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
              }}
              className="max-w-full max-h-[80vh] object-contain origin-center"
            />
          </div>
        </div>
      )}
    </section>
  );
}