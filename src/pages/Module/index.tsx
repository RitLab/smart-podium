import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Card } from "@/components/Card";
import type { AppDispatch, RootState } from "@/stores";
import {
  fetchReferensi,
  fetchBahanAjarDetail,
} from "@/stores/module";

/* ================= TYPES ================= */

type ReferensiItem = {
  file_thumb: string | undefined;
  id: number;
  sesi_id: number;
  file_url: string;
  file_name: string;
  description?: string;
  ext?: string;
  mime_type?: string;
};

type SesiItem = {
  id: number;
  title: string;
};

/* ================= PAGE ================= */

const Module = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { referensi, detail, loading, error } = useSelector(
    (state: RootState) => state.module,
  );

  /* ================= LOCAL STATE ================= */

  const [activeBabIndex, setActiveBabIndex] = useState(0);
  const [showBabDropdown, setShowBabDropdown] = useState(false);
  const [activeSesiId, setActiveSesiId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReferensiItem | null>(null);

  /* ================= FETCH REFERENSI ================= */

  useEffect(() => {
    dispatch(fetchReferensi());
  }, [dispatch]);

  const activeBab = referensi?.[activeBabIndex];

  /* ================= FETCH DETAIL ================= */

  useEffect(() => {
    if (!activeBab) return;
    dispatch(fetchBahanAjarDetail(1));
  }, [dispatch, activeBab]);

  /* ================= AUTO SELECT FIRST SESI ================= */

  useEffect(() => {
    if (detail?.sesi?.length) {
      setActiveSesiId(detail.sesi[0].id);
    }
  }, [detail]);

  /* ================= FILTER REFERENSI ================= */

  const filteredReferensi = useMemo(() => {
    if (!detail?.referensi) return [];
    if (!activeSesiId) return detail.referensi;

    return detail.referensi.filter(
      (item: ReferensiItem) => item.sesi_id === activeSesiId
    );
  }, [detail, activeSesiId]);

  /* ================= UI STATE ================= */

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  /* ================= ROUTE HELPER ================= */

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

    return "file";
  };

  /* ================= RENDER ================= */

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* ================= LEFT PANEL ================= */}
      <Card className="col-span-8 h-[780px] p-0 flex flex-col">
        {/* HEADER */}
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

          {/* TAB SESI */}
          <div className="flex gap-2 flex-wrap">
            {detail?.sesi?.map((item: SesiItem) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSesiId(item.id);
                  setSelectedItem(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm transition ${
                  item.id === activeSesiId
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        {filteredReferensi.length > 0 && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-4">
              {filteredReferensi.map((item) => (
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
                    src={item.file_thumb}
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

        {filteredReferensi.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Tidak ada referensi pada sesi ini
          </div>
        )}
      </Card>

      {/* ================= RIGHT PANEL ================= */}
      <Card className="col-span-4 h-[780px] p-0 flex flex-col sticky top-6">
        {selectedItem ? (
          <>
            <img
              src={selectedItem.file_thumb}
              className="w-full h-40 object-cover rounded-t-xl"
            />

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <h3 className="font-bold text-lg">
                  {selectedItem.file_name}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  {selectedItem.description ??
                    "Tidak ada deskripsi tersedia"}
                </p>
              </div>
            </div>

            <div className="p-5 border-t">
              <button
                onClick={() => {
                  const route = getRouteByFileType(selectedItem);

                  navigate(
                    `/${route}?url=${encodeURIComponent(
                      selectedItem.file_url,
                    )}&title=${encodeURIComponent(
                      selectedItem.file_name,
                    )}`,
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
