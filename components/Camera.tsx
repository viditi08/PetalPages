"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Shot = {
  id: string;
  image: string;
  date: string;
  status: 'developing' | 'reviewed';
};

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Camera access denied:", err); }
    }
    startCamera();
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 800;
    canvas.height = 800;

    const video = videoRef.current;
    const minSide = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - minSide) / 2;
    const sy = (video.videoHeight - minSide) / 2;

    ctx.drawImage(video, sx, sy, minSide, minSide, 0, 0, 800, 800);

    const newShot: Shot = {
      id: crypto.randomUUID(),
      image: canvas.toDataURL("image/png"),
      date: new Date().toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
      status: 'developing'
    };

    setShots((prev) => [newShot, ...prev]);

    setTimeout(() => {
      setIsCapturing(false);
      setShots(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'reviewed' } : s));
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center py-12 px-6 overflow-hidden select-none">
      
      <div className="flex w-full max-w-7xl items-center justify-center gap-12">
        
      {/* LEFT: MEMORY ROLL SIDEBAR */}
<div className="w-56 hidden xl:flex flex-col items-center justify-start pt-4 gap-6">
  
  {/* The Heading - Now shifted to the very top */}
  <div className="w-full flex justify-center pb-2 border-b border-pink-100">
    <p className="text-[10px] uppercase tracking-[0.3em] text-pink-500 font-black">
      Memory Roll
    </p>
  </div>
  
  {/* The Scrollable List */}
  <div className="flex flex-col gap-10 max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide pt-2">
    {shots.filter(s => s.status === 'reviewed').slice(1).map(shot => (
      <motion.div 
        key={shot.id} 
        initial={{ x: -20, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        // Polaroid Style Card
        className="relative bg-white p-2 pb-10 shadow-xl border border-gray-50 rounded-sm rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 group"
      >
        {/* Tape Effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-pink-50/60 backdrop-blur-[2px] border border-white/30 rotate-1 z-10 shadow-sm" />
        
        <div className="overflow-hidden rounded-sm bg-gray-50">
          <img 
            src={shot.image} 
            className="w-full aspect-square object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-500" 
            alt="Memory"
          />
        </div>
        
        <p className="absolute bottom-3 left-0 right-0 text-center text-[9px] font-mono text-gray-400 uppercase tracking-widest">
          {shot.date}
        </p>
      </motion.div>
    ))}
  </div>
</div>

        {/* CENTER: THE MASTER CAMERA RIG */}
        {/* We use a fixed-size container so internal elements NEVER move relative to the camera */}
        <div className="relative flex-shrink-0" style={{ width: '700px', height: '500px' }}>
          
          {/* 1. THE VIEWFEED - Locked inside the silver screen hole */}
          <div 
            className="absolute bg-black overflow-hidden shadow-inner border-[3px] border-gray-800"
            style={{ 
              top: '28px',   
              left: '158px',   
              width: '348px', 
              height: '260px', 
              zIndex: 10,
              borderRadius: '4px'
            }}
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover transition-opacity duration-700 ${isCapturing ? 'opacity-20' : 'opacity-100'}`}
            />
          </div>

          {/* 2. THE POLAROID - Ejecting from behind the camera */}
          <AnimatePresence>
            {shots.length > 0 && shots[0].status === 'developing' && (
              <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 400, opacity: 1, rotate: [0, -3, 3, -3, 0] }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bg-white p-4 pb-12 shadow-2xl border border-gray-200 flex flex-col items-center"
                style={{ width: '240px', zIndex: 20, left: '100px' }}
              >
                <div className="w-full aspect-square bg-gray-900 overflow-hidden mb-3">
                  <motion.img 
                    src={shots[0].image} 
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 3.5 }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">{shots[0].date}</p>
              </motion.div>
            )}
          </AnimatePresence>


          {/* 3. THE CAMERA OVERLAY */}
<div className="absolute inset-0 z-30 pointer-events-none flex justify-center items-center">
  <div 
    className="-translate-y-20" // Adjust this number (e.g., -y-10, -y-32) to move it higher
    style={{ width: '1000px', height: '1000px', position: 'relative' }}
  >
    <Image 
      src="/assets/camera.png" 
      alt="Canon Rig" 
      fill
      className="object-contain drop-shadow-2xl"
      priority
    />
  </div>
</div>
        
        </div>

        {/* RIGHT: REVIEW PANEL */}
        <div className="w-80">
          <AnimatePresence mode="wait">
            {shots.length > 0 && shots[0].status === 'reviewed' ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white p-6 rounded-[40px] border shadow-2xl">
                <div className="bg-white p-2 shadow-sm border mb-6 rotate-2 transition-transform hover:rotate-0">
                    <img src={shots[0].image} className="w-full rounded-sm" />
                </div>
                <div className="flex flex-col gap-3">
                    <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">Download Polaroid</button>
                    <button className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all">Add to Calendar</button>
                    <button onClick={() => setShots(prev => prev.filter(s => s.id !== shots[0].id))} className="w-full py-2 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">Skip Shot</button>
                </div>
              </motion.div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-[40px] h-[400px] flex flex-col items-center justify-center text-gray-300 p-10 text-center gap-4">
                <div className="text-4xl opacity-50">📸</div>
                <p className="text-sm font-medium italic">Your development options will appear here after capture.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BIG CAPTURE BUTTON -> Now Compact */}
<div className="mt-8 relative"> 
  <button
    onClick={capturePhoto}
    disabled={isCapturing}
    // Reduced px-20 to px-10, py-6 to py-3, and text-2xl to text-base
    className="group relative px-10 py-3 rounded-full bg-pink-500 text-white font-bold text-base shadow-[0_6px_0_#be185d] hover:translate-y-[1px] hover:shadow-[0_4px_0_#be185d] active:translate-y-[6px] active:shadow-none transition-all disabled:bg-gray-200 disabled:shadow-none"
  >
    {isCapturing ? "🎞️ DEVELOPING..." : "📸 CAPTURE"}
  </button>
</div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}