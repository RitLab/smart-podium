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

/* ================= PAGE ================= */

const Module = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { referensi, list, detail, loading, error } = useSelector(
    (state: RootState) => state.module,
  );

  /* ===== LOCAL STATE ===== */
  const [activeBabIndex, setActiveBabIndex] = useState(0);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [showBabDropdown, setShowBabDropdown] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* ================= FETCH REFERENSI ================= */
  useEffect(() => {
    dispatch(fetchReferensi());
  }, [dispatch]);

  const activeBab = referensi[activeBabIndex];
  const activeSub = activeBab?.sub?.[activeSubIndex];

  /* ================= FETCH LIST ================= */
  useEffect(() => {
    if (!activeBab || !activeSub) return;

    dispatch(
      fetchBahanAjarList({
        page: 1,
        limit: 12,
        category: activeBab.value,
        sub_category: activeSub.value,
      }),
    );
  }, [dispatch, activeBab, activeSub]);

  /* ================= STATE UI ================= */
  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  /* ================= RENDER ================= */

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* ================= LEFT PANEL ================= */}
      <Card className="col-span-8 h-[780px] p-0 flex flex-col">
        {/* ===== HEADER & FILTER (FIX) ===== */}
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

              {showBabDropdown && (
                <div className="absolute z-20 mt-2 bg-white border rounded-lg shadow">
                  {referensi.map((bab, idx) => (
                    <button
                      key={bab.value}
                      onClick={() => {
                        setActiveBabIndex(idx);
                        setActiveSubIndex(0);
                        setShowBabDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {bab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {referensi.map((bab, idx) => (
              <button
                key={bab.value}
                onClick={() => {
                  setActiveBabIndex(idx);
                  setActiveSubIndex(0);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  idx === activeBabIndex
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {bab.label}
              </button>
            ))}
          </div>

          <h2 className="text-lg font-bold">
            {activeBab?.label}
          </h2>
        </div>

        {/* ===== CONTENT (SCROLLABLE) ===== */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {list.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  dispatch(fetchBahanAjarDetail(item.id));
                }}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  selectedId === item.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:shadow"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />

                <p className="text-sm font-semibold line-clamp-2">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ================= RIGHT PANEL ================= */}
      {detail && (
        <Card className="col-span-4 h-[780px] p-0 flex flex-col sticky top-6">
          <img
            src={detail.header.image}
            className="w-full h-40 object-cover rounded-t-xl"
          />

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <h3 className="font-bold text-lg">
                {detail.header.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {detail.header.description}
              </p>
            </div>
          </div>

          <div className="p-5 border-t">
            <button
              onClick={() =>
                navigate(
                  `/viewer?url=${encodeURIComponent(
                    detail.header.file_url,
                  )}&title=${encodeURIComponent(
                    detail.header.title,
                  )}`,
                )
              }
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
              Open File
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Module;
