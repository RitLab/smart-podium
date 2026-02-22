import { Download, Minus, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate, useSearchParams } from "react-router";

pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.mjs`;

const File: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pdfUrl = searchParams.get("url") || "";
  const pdfTitle = searchParams.get("title") || "Dokumen";

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fileData, setFileData] = useState<Blob | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ================= PINCH STATE ================= */

  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef<number>(1);

  const getDistance = (touches: TouchList) => {
    const [t1, t2] = [touches[0], touches[1]];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /* ================= FETCH PDF ================= */

  useEffect(() => {
    if (!pdfUrl) return;

    setFileData(null);

    fetch(pdfUrl)
      .then((res) => res.blob())
      .then((blob) => setFileData(blob))
      .catch((err) => console.error("Gagal mengambil file PDF:", err));
  }, [pdfUrl]);

  function onDocumentLoadSuccess(doc: any) {
    setNumPages(doc.numPages);
    pageRefs.current = Array(doc.numPages).fill(null);
  }

  /* ================= PINCH ZOOM ================= */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStartDistance.current = getDistance(e.touches);
        pinchStartScale.current = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistance.current) {
        e.preventDefault();

        const currentDistance = getDistance(e.touches);
        const scaleFactor =
          currentDistance / pinchStartDistance.current;

        let newScale = pinchStartScale.current * scaleFactor;

        newScale = Math.min(Math.max(newScale, 0.5), 3);

        setScale(newScale);
      }
    };

    const handleTouchEnd = () => {
      pinchStartDistance.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scale]);

  /* ================= ZOOM BUTTON ================= */

  const handleZoomIn = () =>
    setScale((prev) => Math.min(prev + 0.1, 3));

  const handleZoomOut = () =>
    setScale((prev) => Math.max(prev - 0.1, 0.5));

  /* ================= PAGE INPUT ================= */

  const handlePageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const page = parseInt(e.target.value, 10);
    if (!numPages) return;

    if (page > 0 && page <= numPages) {
      setPageNumber(page);
      pageRefs.current[page - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  /* ================= AUTO PAGE DETECT ================= */

  useEffect(() => {
    if (!numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number(
              entry.target.getAttribute("data-page"),
            );
            if (pageIndex && pageIndex !== pageNumber) {
              setPageNumber(pageIndex);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      },
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [numPages, pageNumber]);

  /* ================= DOWNLOAD ================= */

  const handleDownload = () => {
    if (!fileData) return;

    const url = URL.createObjectURL(fileData);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfTitle + ".pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-screen bg-gray-300 font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b shadow-sm">
        <h1 className="text-lg font-bold">
          Tampilan Dokumen
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b text-sm">
        <div className="flex items-center gap-2 w-1/2">
          <p className="text-gray-500">Nama Dokumen:</p>
          <div className="bg-white border px-2 py-1 rounded w-full truncate">
            {pdfTitle}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Halaman:</span>
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageChange}
              className="w-12 text-center border rounded p-1"
            />
            <span>dari {numPages || "--"}</span>
          </div>
        </div>
      </div>

      {/* PDF AREA */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center bg-gray-300/80 p-8 touch-none"
      >
        <div className="shadow-2xl">
          {fileData ? (
            <Document
              file={fileData}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {numPages &&
                Array.from(
                  new Array(numPages),
                  (_, index) => (
                    <div
                      key={index}
                      data-page={index + 1}
                      ref={(el) =>
                        (pageRefs.current[index] = el)
                      }
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="bg-white shadow-lg mb-8"
                      />
                    </div>
                  ),
                )}
            </Document>
          ) : (
            <div className="text-center mt-10">
              Mengunduh Dokumen...
            </div>
          )}
        </div>

        {/* FLOATING ZOOM */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 bg-gray-800/80 backdrop-blur rounded-full py-4 px-2 flex flex-col items-center gap-4 shadow-xl">
          <div className="text-white text-xs font-bold">
            {Math.round(scale * 100)}%
          </div>

          <button
            onClick={handleZoomIn}
            className="text-white hover:text-orange-400"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={handleZoomOut}
            className="text-white hover:text-orange-400"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default File;