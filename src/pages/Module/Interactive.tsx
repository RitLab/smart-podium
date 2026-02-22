import { X, ExternalLink } from "lucide-react";
import React from "react";
import { useNavigate, useSearchParams } from "react-router";

const Interactive: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const url = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Konten Interaktif";

  if (!url) {
    return (
      <div className="flex items-center justify-center h-screen">
        URL tidak ditemukan
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow z-10">
        <h1 className="font-semibold text-gray-800 truncate">
          {title}
        </h1>

        <div className="flex items-center gap-3">
          {/* Close */}
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* IFRAME */}
      <div className="flex-1 bg-black">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-none"
          allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default Interactive;