import { Download, Minus, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate, useSearchParams } from "react-router";

// Worker react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

const File: React.FC = () => {
  const navigate = useNavigate();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const [fileData, setFileData] = useState<Blob | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [searchParams] = useSearchParams();
  const pdfUrl = searchParams.get("url") || "";
  const pdfTitle = searchParams.get("title") || "Dokumen";

  // Fetch manual PDF blob
  useEffect(() => {
    if (!pdfUrl) return;

    setFileData(null);
    fetch(pdfUrl)
      .then((response) => response.blob())
      .then((blob) => setFileData(blob))
      .catch((err) => console.error("Gagal mengambil file PDF:", err));
  }, [pdfUrl]);

  // Saat PDF selesai dimuat
  function onDocumentLoadSuccess(doc: any): void {
    setNumPages(doc.numPages);
    pageRefs.current = Array(doc.numPages).fill(null);
  }

  // Zoom Control
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  // Manual Page Change dari input
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!numPages) return;
    if (page > 0 && page <= numPages) {
      setPageNumber(page);

      // Scroll otomatis ke halaman tersebut
      pageRefs.current[page - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // AUTO DETECT HALAMAN SAAT SCROLL
  useEffect(() => {
    if (!numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number(entry.target.getAttribute("data-page"));
            if (pageIndex && pageIndex !== pageNumber) {
              setPageNumber(pageIndex);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.5], // halaman dianggap aktif jika 50% terlihat
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [numPages, pageNumber]);

  return (
    <div className="flex flex-col h-screen bg-gray-300 font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-300 shadow-sm z-10">
        <h1 className="text-lg font-bold text-gray-800">Tampilan Dokumen</h1>
        <button
          className="p-1 hover:bg-gray-100 rounded-full transition"
          onClick={() => navigate(-1)}
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-300 text-sm">
        <div className="flex items-center gap-2 w-1/2">
          <p className="text-gray-500">Nama Dokumen:</p>
          <div className="bg-white border px-2 py-1 rounded w-full truncate">
            {pdfTitle}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Halaman:</span>

            <input
              type="number"
              value={pageNumber}
              onChange={handlePageChange}
              className="w-12 text-center border border-gray-300 rounded p-1"
            />

            <span className="text-gray-500">dari {numPages || "--"}</span>
          </div>

          <button className="text-gray-600 hover:text-black">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto flex justify-center bg-gray-300/80 p-8"
      >
        <div className="shadow-2xl">
          {fileData ? (
            <Document
              file={fileData}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="text-center">Memproses PDF...</div>}
              error={<div className="text-red-500">Gagal memuat PDF</div>}
            >
              {numPages &&
                Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={index}
                    data-page={index + 1}
                    ref={(el) => {
                      pageRefs.current[index] = el;
                    }}
                  >
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="bg-white shadow-lg mb-8"
                    />
                  </div>
                ))}
            </Document>
          ) : (
            <div className="text-center mt-10 text-gray-600">
              Mengunduh Dokumen...
            </div>
          )}
        </div>

        {/* ZOOM FLOATING */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm rounded-full py-4 px-2 flex flex-col items-center gap-4 shadow-xl z-50">
          <div className="relative h-32 w-2 bg-gray-500 rounded-full">
            <div
              className="absolute w-4 h-4 bg-orange-400 rounded-full -left-1 shadow border border-white"
              style={{ bottom: `${((scale - 0.5) / 1.5) * 100}%` }}
            />
          </div>

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
