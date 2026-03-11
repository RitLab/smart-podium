import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Card } from "@/components/Card";
import type { AppDispatch, RootState } from "@/stores";
import { fetchReferensi, fetchBahanAjarDetail } from "@/stores/module";

// icon
import iconPdf from "@/assets/images/icon/icon-pdf.png";
import iconMp4 from "@/assets/images/icon/icon-mp4.png";
import iconPng from "@/assets/images/icon/icon-png.png";
import iconJpg from "@/assets/images/icon/icon-jpg.png";
import iconDoc from "@/assets/images/icon/icon-doc.png";
import iconXls from "@/assets/images/icon/icon-xls.png";
import iconPpt from "@/assets/images/icon/icon-ppt.png";
import icon3d from "@/assets/images/icon/icon-3d.png";
import iconFolder from "@/assets/images/icon/icon-folder.png";

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

    if (item.type === "konten_interaktif") {
      navigate(
        `/interactive?url=${encodeURIComponent(
          item.file_url,
        )}&title=${encodeURIComponent(item.file_name)}`,
      );
      return;
    }

    if (item.type === "header") {
      navigate(
        `/file?url=${encodeURIComponent(
          item.file_url,
        )}&title=${encodeURIComponent(item.file_name)}`,
      );
      return;
    }

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

    navigate(
      `/file?url=${encodeURIComponent(
        item.file_url,
      )}&title=${encodeURIComponent(item.file_name)}`,
    );
  };

  /* ================= ICON FALLBACK ================= */

  const getFallbackIcon = (ext?: string) => {
    switch (ext?.toLowerCase()) {
      case "pdf":
        return iconPdf;
      case "mp4":
        return iconMp4;
      case "png":
        return iconPng;
      case "jpg":
      case "jpeg":
        return iconJpg;
      case "doc":
      case "docx":
        return iconDoc;
      case "xls":
      case "xlsx":
        return iconXls;
      case "ppt":
      case "pptx":
        return iconPpt;
      default:
        return iconFolder;
    }
  };

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
              {combinedItems.map((item: any, index: number) => {
                const isFallback = !item.file_thumb;

                const src =
                  item.file_thumb ||
                  (item.type === "konten_interaktif"
                    ? icon3d
                    : getFallbackIcon(item.ext));

                return (
                  <div
                    key={`${item.type}-${item.id}-${index}`}
                    onClick={() => setSelectedItem(item)}
                    className={`cursor-pointer border p-3 rounded-xl ${
                      selectedItem?.id === item.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:shadow"
                    }`}
                  >
                    <div className="w-full h-28 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={src}
                        onError={(e) => {
                          const target = e.currentTarget;

                          if (item.type === "konten_interaktif") {
                            target.src = icon3d;
                          } else {
                            target.src = getFallbackIcon(item.ext);
                          }

                          target.className = "w-24 h-24 object-contain";
                        }}
                        className={
                          isFallback
                            ? "w-24 h-24 object-contain"
                            : "w-full h-full object-cover object-top"
                        }
                      />
                    </div>

                    <p className="text-sm font-semibold line-clamp-2">
                      {item.file_name}
                    </p>
                  </div>
                );
              })}
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
              <div className="w-full h-40 bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                <img
                  src={
                    selectedItem.file_thumb ||
                    (selectedItem.type === "konten_interaktif"
                      ? icon3d
                      : getFallbackIcon(selectedItem.ext))
                  }
                  className={
                    selectedItem.file_thumb
                      ? "w-full h-full object-cover object-top"
                      : "w-24 h-24 object-contain"
                  }
                />
              </div>

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
