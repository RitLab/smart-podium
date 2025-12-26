import { X, ZoomIn, ZoomOut, Hand } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const ThreeDimensionViewer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modelUrl = searchParams.get("url") || "";
  const title =
    searchParams.get("title") ||
    "Game Simulasi Proses Sidang Kasus Tindak Pidana Terorisme di Indonesia";

  const [zoom, setZoom] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!modelUrl) return;
    fetch(modelUrl).finally(() => setIsLoading(false));
  }, [modelUrl]);

  return (
    <div className="w-screen h-screen bg-[#cfcfcf] relative overflow-hidden">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-center bg-white z-20">
        <h1 className="text-sm font-semibold truncate px-12 text-center">
          {title}
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="absolute right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* CANVAS */}
      <Canvas
        camera={{ position: [0, 2, zoom], fov: 45 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan
          enableRotate
          enableZoom
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>

      {/* LOADING */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 z-10">
          Memuat 3D Model...
        </div>
      )}
    </div>
  );
};

export default ThreeDimensionViewer;
