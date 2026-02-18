import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Card } from "@/components/Card";
import type { AppDispatch, RootState } from "@/stores";
import {
  fetchReferensi,
  fetchBahanAjarList,
  fetchBahanAjarDetail,
} from "@/stores/module";

/* ================= TYPES ================= */

type ReferensiItem = {
  id: number;
  file_url: string;
  file_name: string;
  description?: string;
  ext?: string;
  mime_type?: string;
};

/* ================= PAGE ================= */

const Module = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { referensi, list, detail, loading, error } = useSelector(
    (state: RootState) => state.module,
  );

  /* ================= LOCAL STATE ================= */

  const [activeBabIndex, setActiveBabIndex] = useState(0);
  const [showBabDropdown, setShowBabDropdown] = useState(false);
  const [activeSubId, setActiveSubId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReferensiItem | null>(null);

  /* ================= FETCH REFERENSI ================= */

  useEffect(() => {
    dispatch(fetchReferensi());
  }, [dispatch]);

  const activeBab = referensi?.[activeBabIndex];

  /* ================= FETCH LIST ================= */

  useEffect(() => {
    if (!activeBab) return;

    dispatch(
      fetchBahanAjarList({
        page: 1,
        limit: 12,
        category: null,
        sub_category: null,
      }),
    );
  }, [dispatch, activeBab]);

  /* ================= UI STATE ================= */

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  // get route by file type
  const getRouteByFileType = (item: ReferensiItem) => {
    const mime = item.mime_type ?? "";
    const ext = item.ext?.toLowerCase();

    if (mime.startsWith("video/")) return "video";

    if (mime.startsWith("image/")) return "image";

    if (
      mime === "application/pdf" ||
      ext === "pdf" ||
      ext === "doc" ||
      ext === "docx"
    )
      return "file";

    if (ext === "glb" || ext === "gltf" || ext === "obj") return "3d";

    return "file"; // default fallback
  };

  /* ================= RENDER ================= */

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* ================= LEFT PANEL ================= */}
      <Card className="col-span-8 h-[780px] p-0 flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="p-6 space-y-4 border-b">
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowBabDropdown((v) => !v)}
                className="flex items-center gap-2 font-bold text-lg"
              >
                <ChevronDown className="w-5 h-5" />
                {activeBab?.label ?? "Pilih Bidang Studi"}
              </button>
            </div>
          </div>

          {/* ===== TAB LIST ===== */}
          <div className="flex gap-2 flex-wrap">
            {list.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSubId(item.id);
                  setSelectedItem(null); // reset right panel
                  dispatch(fetchBahanAjarDetail(item.id));
                }}
                className={`px-4 py-1.5 rounded-full text-sm transition ${
                  item.id === activeSubId
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* ===== CONTENT GRID ===== */}
        {detail && detail?.referensi?.length > 0 && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-4">
              {detail.referensi.map((item: ReferensiItem) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    selectedItem?.id === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:shadow"
                  }`}
                >
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />

                  <p className="text-sm font-semibold line-clamp-2">
                    {item.file_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ================= RIGHT PANEL ================= */}
      <Card className="col-span-4 h-[780px] p-0 flex flex-col sticky top-6">
        {selectedItem ? (
          <>
            <img
              src={selectedItem.file_url}
              className="w-full h-40 object-cover rounded-t-xl"
            />

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedItem.file_name}</h3>

                <p className="text-sm text-gray-600 mt-2">
                  {selectedItem.description ?? "Tidak ada deskripsi tersedia"}
                </p>
              </div>
            </div>

            <div className="p-5 border-t">
              <button
                onClick={() => {
                  if (!selectedItem) return;

                  const route = getRouteByFileType(selectedItem);

                  navigate(
                    `/${route}?url=${encodeURIComponent(
                      selectedItem.file_url,
                    )}&title=${encodeURIComponent(selectedItem.file_name)}`,
                  );
                }}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Open File
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-6">
            Pilih referensi di sebelah kiri untuk melihat detail
          </div>
        )}
      </Card>
    </div>
  );
};

export default Module;
