import { useCallback, useEffect, useMemo, useState } from "react";
import { Monitor, AppWindow, Globe, X } from "lucide-react";

/**
 * Picker share screen ala Chrome.
 *
 * Dipicu dari main process (electron/main/sharePicker.ts) lewat channel
 * "share-picker-buka", dan menjawab lewat "share-picker-pilih".
 *
 * Komponen ini dirender PERMANEN di MainLayout, bukan lewat rute — permintaan
 * share bisa datang kapan saja dari <webview> mana pun, termasuk saat guru lagi
 * di halaman lain. Modalnya HTML biasa: sudah dibuktikan dengan screenshot
 * bahwa DOM ber-z-index tinggi memang tampil DI ATAS <webview> di Electron 33,
 * jadi nggak perlu jendela terpisah.
 *
 * Ukuran tombol sengaja besar — ini layar sentuh, bukan mouse.
 */

type TipeSumber = "layar" | "jendela" | "tab";

type Sumber = {
  kunci: string;
  tipe: TipeSumber;
  nama: string;
  thumb: string | null;
  ikon: string | null;
};

const TAB: Array<{ tipe: TipeSumber; label: string; Ikon: typeof Monitor }> = [
  { tipe: "layar", label: "Seluruh Layar", Ikon: Monitor },
  { tipe: "jendela", label: "Jendela Aplikasi", Ikon: AppWindow },
  { tipe: "tab", label: "Tab Browser", Ikon: Globe },
];

const SharePicker = () => {
  const [id, setId] = useState<string | null>(null);
  const [sumber, setSumber] = useState<Sumber[]>([]);
  const [tipeAktif, setTipeAktif] = useState<TipeSumber>("layar");
  const [dipilih, setDipilih] = useState<string | null>(null);

  const jawab = useCallback((kunci: string | null) => {
    if (!id) return;
    window.ipcRenderer.send("share-picker-pilih", { id, kunci });
    setId(null);
    setSumber([]);
    setDipilih(null);
  }, [id]);

  useEffect(() => {
    const lepas = window.ipcRenderer.on(
      "share-picker-buka",
      (_e, muatan: { id: string; sumber: Sumber[] }) => {
        if (!muatan?.id || !Array.isArray(muatan.sumber)) return;
        setId(muatan.id);
        setSumber(muatan.sumber);
        setDipilih(null);
        // Buka di kategori yang benar-benar ada isinya, biar guru nggak
        // disambut daftar kosong.
        const pertama = TAB.find((t) => muatan.sumber.some((s) => s.tipe === t.tipe));
        setTipeAktif(pertama?.tipe ?? "layar");
      },
    );
    return () => { if (typeof lepas === "function") lepas(); };
  }, []);

  // Escape = batal, sama seperti picker Chrome.
  useEffect(() => {
    if (!id) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") jawab(null); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [id, jawab]);

  const terlihat = useMemo(() => sumber.filter((s) => s.tipe === tipeAktif), [sumber, tipeAktif]);

  if (!id) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 2147483600 }}
    >
      <div className="w-[860px] max-w-[94vw] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pilih yang ingin dibagikan</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Isi yang kamu pilih akan terlihat oleh peserta kelas.
            </p>
          </div>
          <button
            onClick={() => jawab(null)}
            aria-label="Tutup"
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors active:scale-95"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex gap-2 px-7 border-b border-gray-100">
          {TAB.map(({ tipe, label, Ikon }) => {
            const jumlah = sumber.filter((s) => s.tipe === tipe).length;
            const aktif = tipe === tipeAktif;
            return (
              <button
                key={tipe}
                onClick={() => { setTipeAktif(tipe); setDipilih(null); }}
                disabled={jumlah === 0}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  aktif
                    ? "border-blue-600 text-blue-600"
                    : jumlah === 0
                      ? "border-transparent text-gray-300 cursor-not-allowed"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Ikon size={16} />
                {label}
                {jumlah > 0 && <span className="text-xs font-normal opacity-60">({jumlah})</span>}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {terlihat.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Tidak ada yang bisa dibagikan di kategori ini.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {terlihat.map((s) => {
                const aktif = s.kunci === dipilih;
                return (
                  <button
                    key={s.kunci}
                    onClick={() => setDipilih(s.kunci)}
                    onDoubleClick={() => jawab(s.kunci)}
                    className={`group text-left rounded-2xl border-2 overflow-hidden transition-all active:scale-[0.98] ${
                      aktif ? "border-blue-600 ring-4 ring-blue-500/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                      {s.thumb ? (
                        <img src={s.thumb} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Globe size={28} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-white">
                      {s.ikon ? (
                        <img src={s.ikon} alt="" className="w-4 h-4 shrink-0" />
                      ) : null}
                      <span className="text-xs font-semibold text-gray-700 truncate">{s.nama}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => jawab(null)}
            className="px-7 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={() => dipilih && jawab(dipilih)}
            disabled={!dipilih}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-95 ${
              dipilih ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Bagikan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePicker;
