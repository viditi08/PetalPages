"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Shot = {
  id: string;
  image: string;
};

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);

  // Start webcam
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    }
    startCamera();
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 400;
    canvas.height = 480;

    const frame = new window.Image();
    frame.src = "/assets/polaroid.png";

    frame.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current!, 40, 40, 320, 300);
      ctx.drawImage(frame, 0, 0, 400, 480);

      const date = new Date().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      ctx.fillStyle = "#333";
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.fillText(date, 200, 440);

      setShots((prev) => [
        { id: crypto.randomUUID(), image: canvas.toDataURL("image/png") },
        ...prev,
      ]);
    };
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16">
      {/* CAMERA STAGE (ISOLATED) */}
      <div className="relative w-[600px] h-[420px] -mt-100">
        {/* CAMERA SCREEN BACKGROUND (IMPORTANT) */}
        <div
          className="absolute"
          style={{
            top: 120,
            left: 95,
            width: 280,
            height: 210,
            borderRadius: "6px",
            zIndex: 1,
          }}
        />

        {/* VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute object-cover rounded-[6px]"
          style={{
            top: 420,
            left: 60,
            width: 280,
            height: 249,
            background: "#000", // blocks text behind
            zIndex: 1,
          }}
        />

        {/* CAMERA IMAGE */}
        <Image
          src="/assets/camera_v2.png"
          alt="Camera"
          width={600}
          height={420}
          draggable={false}
          priority
          className="select-none pointer-events-none"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
          }}
        />
      </div>

      {/* CAPTURE BUTTON — COMPLETELY OUTSIDE CAMERA */}
      <button
        onClick={capturePhoto}
        className="mt-90 px-8 py-4 rounded-full bg-pink-400 text-white font-semibold shadow hover:bg-pink-500 text-lg"
      >
        📸 Capture
      </button>

      {/* TEXT BELOW */}
      <div className="mt-10 text-center">
        <h3 className="font-semibold text-lg">Today’s shots</h3>
        {shots.length === 0 && (
          <p className="text-sm text-gray-400 mt-10">
            No photos yet. Take your first one 📸
          </p>
        )}
      </div>

      {/* POLAROIDS */}
      <div className="mt-6 w-[260px] flex flex-col gap-4">
        {shots.map((shot) => (
          <img
            key={shot.id}
            src={shot.image}
            className="w-full shadow rounded cursor-pointer"
          />
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
