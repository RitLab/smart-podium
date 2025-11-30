import { Image as ImageIcon, Minus, Plus, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const ImageViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get("url") || "";
  const imageTitle = searchParams.get("title") || "Lihat Gambar";

  console.log(imageUrl);
  

  // State
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [fileSize, setFileSize] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);

  // --- EFFECT: Ambil File Size ---
  useEffect(() => {
    if (!imageUrl) return;

    // Kita fetch head/blob untuk mendapatkan ukuran file
    fetch(imageUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat gambar");
        return res.blob();
      })
      .then((blob) => {
        const sizeInKB = blob.size / 1024;
        if (sizeInKB > 1024) {
          setFileSize(`${(sizeInKB / 1024).toFixed(2)} MB`);
        } else {
          setFileSize(`${sizeInKB.toFixed(1)} KB`);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setFileSize("Unknown");
        setIsLoading(false);
      });
  }, [imageUrl]);

  // --- HANDLERS ---

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3.0)); // Max 300%
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1)); // Min 10%
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  // Persentase untuk slider background (Range 0.1 sampai 3.0)
  // Kita normalisasi agar 0% slider = zoom 0.1, 100% slider = zoom 3.0
  const minZoom = 0.1;
  const maxZoom = 3.0;
  const progressPercent = ((zoom - minZoom) / (maxZoom - minZoom)) * 100;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-gray-800">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex-1"></div>
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center truncate">
          {imageTitle}
        </h1>
        <div className="flex-1 flex justify-end">
          <button
            className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"
            onClick={() => window.close()}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- MAIN IMAGE AREA --- */}
      <div className="flex-1 relative overflow-hidden bg-[#e5e5e5] flex items-center justify-center">
        {isLoading && (
          <div className="absolute z-10 text-gray-500">Memuat Gambar...</div>
        )}

        {/* Container scrollable jika di-zoom */}
        <div className="w-full h-full overflow-auto flex items-center justify-center p-8">
          <img
            src={imageUrl}
            alt={imageTitle}
            onLoad={handleImageLoad}
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 0.1s ease-out",
            }}
            className="max-w-full max-h-full object-contain shadow-lg bg-white"
          />
        </div>
      </div>

      {/* --- FOOTER / CONTROLS --- */}
      <div className="bg-[#f0f0f0] px-6 py-3 border-t border-gray-300 flex justify-between items-center text-sm">
        {/* KIRI: Metadata Info */}
        <div className="flex items-center gap-6 text-gray-600">
          {/* Dimensi */}
          <div className="flex items-center gap-2">
            <ImageIcon size={18} strokeWidth={2} />
            <span>
              {dimensions
                ? `${dimensions.width} x ${dimensions.height}`
                : "-- x --"}
            </span>
          </div>

          {/* File Size */}
          <div className="flex items-center gap-2">
            <Save size={18} strokeWidth={2} />
            <span>{fileSize}</span>
          </div>
        </div>

        {/* KANAN: Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Persentase Text */}
          <span className="text-gray-600 font-medium min-w-[3rem] text-right mr-2">
            {Math.round(zoom * 100)}%
          </span>

          {/* Minus Button */}
          <button
            onClick={handleZoomOut}
            className="text-gray-500 hover:text-orange-500 transition focus:outline-none"
          >
            <Minus size={18} />
          </button>

          {/* Orange Slider */}
          <div className="relative w-32 h-1.5 bg-gray-300 rounded-full group cursor-pointer">
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step="0.1"
              value={zoom}
              onChange={handleSliderChange}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Visual Orange Line */}
            <div
              className="absolute top-0 left-0 h-full bg-orange-500 rounded-full pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Knob Bulat */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full shadow border border-white"></div>
            </div>
          </div>

          {/* Plus Button */}
          <button
            onClick={handleZoomIn}
            className="text-gray-500 hover:text-orange-500 transition focus:outline-none"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
