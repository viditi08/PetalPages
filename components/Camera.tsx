"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Shot = {
  id: string;
  image: string;
  date: string;
};

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    
    // Capture only the raw camera square
    canvas.width = 600;
    canvas.height = 600;
    ctx.drawImage(videoRef.current!, 0, 0, 600, 600);

    const date = new Date().toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newShot = { 
      id: crypto.randomUUID(), 
      image: canvas.toDataURL("image/png"),
      date: date 
    };

    setShots((prev) => [newShot, ...prev]);
    setTimeout(() => setIsCapturing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 overflow-hidden">
      <div className="relative w-[600px] h-[420px]">
        
        {/* ANIMATED CODE-BASED POLAROID */}
        <div 
          className="absolute overflow-hidden" 
          style={{ top: 120, left: 160, width: 280, height: 600, zIndex: 20, pointerEvents: 'none' }}
        >
          <AnimatePresence>
            {shots.length > 0 && isCapturing && (
              <motion.div
                key={shots[0].id}
                initial={{ y: -400 }}
                animate={{ y: 210 }}
                transition={{ type: "spring", damping: 20, stiffness: 80 }}
                // CSS POLAROID FRAME
                className="w-full bg-white p-4 pb-12 shadow-2xl flex flex-col items-center border border-gray-100"
              >
                {/* Captured Image */}
                <img src={shots[0].image} className="w-full aspect-square object-cover shadow-inner" />
                
                {/* Handwritten Date Effect */}
                <p className="mt-4 text-gray-700 font-serif italic text-lg opacity-80">
                  {shots[0].date}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CAMERA VIEW */}
        <div
          className="absolute overflow-hidden bg-black"
          style={{ top: 120, left: 160, width: 280, height: 210, zIndex: 10 }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-150 ${isCapturing ? 'opacity-30' : 'opacity-100'}`}
          />
        </div>

        {/* CAMERA BODY */}
        <Image
          src="/assets/camera.png"
          alt="Camera Body"
          width={600}
          height={420}
          priority
          className="relative select-none pointer-events-none"
          style={{ zIndex: 30 }}
        />
      </div>

      <button
        onClick={capturePhoto}
        disabled={isCapturing}
        className={`relative z-50 mt-12 px-10 py-4 rounded-full font-bold shadow-lg transition-all active:scale-95 ${
          isCapturing ? 'bg-gray-300' : 'bg-pink-400 hover:bg-pink-500 text-white'
        }`}
      >
        {isCapturing ? "EJECTING..." : "📸 CAPTURE"}
      </button>

      {/* GALLERY OF CODE-BASED POLAROIDS */}
      <div className="mt-24 grid grid-cols-2 gap-8 w-[450px] pb-20">
        {shots.map((shot, index) => (
          (index === 0 && isCapturing) ? null : (
            <motion.div
              layout
              key={shot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-3 pb-8 shadow-xl border border-gray-200 -rotate-2 hover:rotate-0 transition-all flex flex-col items-center"
            >
              <img src={shot.image} className="w-full aspect-square object-cover shadow-sm mb-3" />
              <p className="text-gray-600 font-serif italic text-sm">{shot.date}</p>
            </motion.div>
          )
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}