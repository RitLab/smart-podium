import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  // tampilkan max 5 page number (contoh sederhana)
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - 2 && currentPage > 3) ||
      (i === currentPage + 2 && currentPage < totalPages - 2)
    ) {
      pages.push("...");
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border text-sm bg-white flex items-center gap-1"
      >
        <ChevronLeft size={16} />
        <div className="mr-2">Prev</div>
      </button>

      {pages.map((p, idx) =>
        typeof p === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded border text-sm ${
              p === currentPage
                ? "bg-blue-800 bg-opacity-10 border-blue-800 text-blue-800"
                : "bg-white"
            }`}
          >
            {p}
          </button>
        ) : (
          <span key={idx} className="px-2">
            ...
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border text-sm bg-white flex items-center gap-1"
      >
        <div className="ml-2">Next</div>
        <ChevronRight size={16} className="text-blue-800" />
      </button>
    </div>
  );
};

export default Pagination;
