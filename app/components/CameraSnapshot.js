"use client";

import { useEffect, useState } from "react";

export default function CameraSnapshot() {
  const [activeImage, setActiveImage] = useState(0);
  const [imageSrc, setImageSrc] = useState(["", ""]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const updateSnapshot = () => {
    const nextIndex = (activeImage + 1) % 2;
    const newSrc = `http://192.168.1.24/capture?timestamp=${Date.now()}`;

    const img = new Image();
    img.src = newSrc;
    img.onload = () => {
      setImageSrc((prev) => {
        const updatedImageSrc = [...prev];
        updatedImageSrc[nextIndex] = newSrc;
        return updatedImageSrc;
      });
      setActiveImage(nextIndex);
      setLastUpdated(new Date());
    };
  };

  useEffect(() => {
    updateSnapshot(); // Initial load

    const interval = setInterval(updateSnapshot, 1000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative w-[900px] h-[480px] border rounded overflow-hidden">
        {imageSrc.map(
          (src, index) =>
            src ? (
              <img
                key={index}
                src={src}
                alt={`Flood Camera Snapshot ${index + 1}`}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                  activeImage === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null // Do not render the image if src is an empty string
        )}
      </div>

      {/* Timestamp Display */}
      {lastUpdated && (
        <p className="mt-2 text-gray-600 text-sm">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      <button
        onClick={updateSnapshot}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Refresh Snapshot
      </button>
    </div>
  );
}
