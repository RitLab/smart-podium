import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Card } from "@/components/Card";
import type { AppDispatch, RootState } from "@/stores";
import { fetchReferensi, fetchBahanAjarDetail } from "@/stores/module";

/* ================= PAGE ================= */

const Module = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { referensi, detail, loading, error } = useSelector(
    (state: RootState) => state.module,
  );

  const [activeBabIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<number | "header" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    dispatch(fetchReferensi());
  }, [dispatch]);

  const activeBab = referensi?.[activeBabIndex];

  useEffect(() => {
    if (!activeBab) return;
    dispatch(fetchBahanAjarDetail(1));
  }, [dispatch, activeBab]);

  useEffect(() => {
    if (detail?.sesi?.length) {
      setActiveTab(detail.sesi[0].id);
    }
  }, [detail]);

  /* ================= FILTER LOGIC ================= */

  const combinedItems = useMemo(() => {
    if (!detail) return [];

    // HEADER TAB
    if (activeTab === "header" && detail.header) {
      return [
        {
          ...detail.header,
          type: "header",
          file_name: detail.header.title,
          file_thumb: detail.header.file_thumb,
          file_url: detail.header.file_url,
        },
      ];
    }

    if (!activeTab) return [];

    const referensiItems =
      detail.referensi?.filter((item: any) => item.sesi_id === activeTab) ?? [];

    const interaktifItems =
      detail.konten_interaktif?.filter(
        (item: any) => item.sesi_id === activeTab,
      ) ?? [];

    return [
      ...interaktifItems.map((item: any) => ({
        ...item,
        type: "konten_interaktif",
        file_name: item.title,
      })),
      ...referensiItems.map((item: any) => ({
        ...item,
        type: "referensi",
      })),
    ];
  }, [detail, activeTab]);

  /* ================= ROUTE HANDLER ================= */

  const openItem = (item: any) => {
    const ext = item.ext?.toLowerCase();

    // ================= KONTEN INTERAKTIF =================
    if (item.type === "konten_interaktif") {
      navigate(
        `/interactive?url=${encodeURIComponent(
          item.file_url,
        )}&title=${encodeURIComponent(item.file_name)}`,
      );
      return;
    }

    // ================= HEADER =================
    if (item.type === "header") {
      navigate(
        `/file?url=${encodeURIComponent(
          item.file_url,
        )}&title=${encodeURIComponent(item.file_name)}`,
      );
      return;
    }

    // ================= REFERENSI =================
    if (item.type === "referensi") {
      if (ext === "pdf") {
        navigate(
          `/file?url=${encodeURIComponent(
            item.file_url,
          )}&title=${encodeURIComponent(item.file_name)}`,
        );
        return;
      }

      if (ext === "mp4") {
        navigate(
          `/video?url=${encodeURIComponent(
            item.file_url,
          )}&title=${encodeURIComponent(item.file_name)}`,
        );
        return;
      }

      if (ext === "png" || ext === "jpg" || ext === "jpeg") {
        navigate(
          `/image?url=${encodeURIComponent(
            item.file_url,
          )}&title=${encodeURIComponent(item.file_name)}`,
        );
        return;
      }
    }

    // ================= DEFAULT FALLBACK =================
    navigate(
      `/file?url=${encodeURIComponent(
        item.file_url,
      )}&title=${encodeURIComponent(item.file_name)}`,
    );
  };

  /* ================= UI ================= */

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* LEFT PANEL */}
      <Card className="col-span-8 h-[780px] p-0 flex flex-col">
        <div className="p-6 space-y-4 border-b">
          <button className="flex items-center gap-2 font-bold text-lg">
            <ChevronDown className="w-5 h-5" />
            {activeBab?.label ?? "Pilih Bidang Studi"}
          </button>

          {/* HEADER TAB */}
          {detail?.header && (
            <button
              onClick={() => {
                setActiveTab("header");
                setSelectedItem(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm ${
                activeTab === "header" ? "bg-black text-white" : "bg-gray-100"
              }`}
            >
              {detail.header.title}
            </button>
          )}

          {/* SESI TAB */}
          <div className="flex gap-2 flex-wrap">
            {detail?.sesi?.map((item: any) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedItem(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  item.id === activeTab ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        {combinedItems.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-4">
              {combinedItems.map((item: any, index: number) => (
                <div
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer border p-3 rounded-xl ${
                    selectedItem?.id === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:shadow"
                  }`}
                >
                  <img
                    src={item.file_thumb}
                    className="w-full h-28 object-cover object-top rounded-lg mb-2"
                  />
                  <p className="text-sm font-semibold line-clamp-2">
                    {item.file_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Tidak ada konten pada sesi ini
          </div>
        )}
      </Card>

      {/* RIGHT PANEL */}
      <Card className="col-span-4 h-[780px] p-0 flex flex-col sticky top-6">
        {selectedItem ? (
          <>
            <div className="flex-1 p-5 space-y-4">
              <img
                src={selectedItem.file_thumb}
                className="w-full h-40 object-cover object-top rounded-t-xl"
              />
              <h3 className="font-bold text-lg">{selectedItem.file_name}</h3>

              <p className="text-sm text-gray-600">
                {selectedItem.description ?? "Tidak ada deskripsi tersedia"}
              </p>
            </div>

            <div className="p-5 border-t">
              <button
                onClick={() => openItem(selectedItem)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
              >
                Open
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-6">
            Pilih konten di sebelah kiri
          </div>
        )}
      </Card>
    </div>
  );
};

export default Module;
