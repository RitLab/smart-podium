import { desktopCapturer, ipcMain, webContents } from "electron";
import type { BrowserWindow, WebFrameMain } from "electron";

/**
 * Picker share screen ala Chrome.
 *
 * Sebelumnya handler-nya langsung ambil layar pertama tanpa nanya. Guru nggak
 * punya pilihan: mau share satu jendela atau satu tab pun, yang kebagi tetap
 * seluruh layar — termasuk hal yang nggak mau dilihat kelas.
 *
 * Sekarang tiga kategori, sama kayak Chrome:
 *   - Seluruh Layar  : desktopCapturer types ["screen"]
 *   - Jendela        : desktopCapturer types ["window"]
 *   - Tab            : tiap <webview> di browser dalam app. Ini dikirim ke
 *                      callback sebagai WebFrameMain, BUKAN objek desktopCapturer.
 *                      Terverifikasi jalan di Electron 33: stream-nya hidup dan
 *                      displaySurface-nya "browser".
 *
 * Handler dipasang di session.defaultSession, dan itu juga melayani
 * getDisplayMedia yang dipanggil dari DALAM <webview> — jadi video-room sekolah
 * (LiveKit) dilayani picker yang sama.
 */

type TipeSumber = "layar" | "jendela" | "tab";

type SumberBagi = {
  kunci: string;
  tipe: TipeSumber;
  nama: string;
  thumb: string | null;
  ikon: string | null;
};

type Tertunda = {
  selesai: (kunci: string | null) => void;
};

const tertunda = new Map<string, Tertunda>();
let urutan = 0;

/** Bikin id unik tanpa Math.random — cukup penghitung, ini proses tunggal. */
const idBaru = () => `bagi-${++urutan}`;

/**
 * Pratinjau tab, dibatasi waktu.
 *
 * capturePage() pada <webview> yang lagi disembunyikan (tab non-aktif) bisa
 * menggantung selamanya — halaman yang nggak dikomposit nggak pernah ngasih
 * frame baru. Efeknya fatal: begitu guru punya lebih dari satu tab, picker-nya
 * nggak pernah kebuka sama sekali dan tombol share di video-room mati. Terbukti
 * di Electron 33, promise-nya masih menggantung setelah 25 detik.
 *
 * Jadi pratinjau dikasih batas waktu dan diambil barengan. Tab yang nggak sempat
 * ngasih gambar tetap ditawarkan, cuma tanpa pratinjau — masih kelihatan judul
 * sama alamatnya, cukup buat milih.
 */
const BATAS_PRATINJAU_MS = 900;

function pratinjauTab(wc: Electron.WebContents): Promise<string | null> {
  return new Promise((resolve) => {
    let sudah = false;
    const selesai = (nilai: string | null) => {
      if (sudah) return;
      sudah = true;
      resolve(nilai);
    };
    const jam = setTimeout(() => selesai(null), BATAS_PRATINJAU_MS);
    wc.capturePage()
      .then((gambar) => {
        clearTimeout(jam);
        selesai(gambar.isEmpty() ? null : gambar.resize({ width: 320 }).toDataURL());
      })
      .catch(() => {
        clearTimeout(jam);
        selesai(null);
      });
  });
}

/**
 * Tab = <webview> di browser dalam app. Frame yang MEMINTA dibuang dari daftar:
 * share tab ke dirinya sendiri bikin efek cermin tak berujung, dan Chrome juga
 * nggak menawarkannya.
 */
async function kumpulkanTab(frameMeminta: WebFrameMain | null) {
  const semua = webContents.getAllWebContents().filter((wc) => {
    if (wc.isDestroyed() || wc.getType() !== "webview") return false;
    if (!frameMeminta) return true;
    try {
      return wc.mainFrame.processId !== frameMeminta.processId || wc.mainFrame.routingId !== frameMeminta.routingId;
    } catch {
      return true;
    }
  });

  return Promise.all(
    semua.map(async (wc) => {
      const thumb = await pratinjauTab(wc);
      const judul = (wc.getTitle() || "").trim();
      const url = wc.getURL() || "";
      let asal = "";
      try {
        asal = url ? new URL(url).host : "";
      } catch {
        /* biarin */
      }
      return {
        sumber: {
          kunci: `tab:${wc.id}`,
          tipe: "tab" as TipeSumber,
          nama: judul || asal || "Tab",
          thumb,
          ikon: null,
        },
        wc,
      };
    }),
  );
}

/**
 * `ambilJendela` sengaja berupa fungsi, bukan objek BrowserWindow. Di macOS
 * jendela bisa dibikin ulang lewat event "activate", dan picker harus nempel ke
 * jendela yang lagi hidup — bukan yang udah mati.
 */
export function pasangSharePicker(
  ambilJendela: () => BrowserWindow | null,
  sesi: Electron.Session,
) {
  // Renderer mengirim balik pilihan guru (atau null kalau dibatalkan).
  ipcMain.on("share-picker-pilih", (_e, muatan: { id?: string; kunci?: string | null }) => {
    const t = muatan?.id ? tertunda.get(muatan.id) : undefined;
    if (!t) return;
    tertunda.delete(muatan.id!);
    t.selesai(muatan.kunci ?? null);
  });

  sesi.setDisplayMediaRequestHandler(async (request, callback) => {
    // callback-nya SEKALI PAKAI: dipanggil dua kali, Electron lempar
    // "One-time callback was called more than once" dan itu keluar sebagai
    // unhandled rejection di main process. Jalur keluarnya ada banyak (batal,
    // tab, layar, error), jadi dikunci di satu pintu.
    let sudahJawab = false;
    const jawab = (aliran: Parameters<typeof callback>[0]) => {
      if (sudahJawab) return;
      sudahJawab = true;
      callback(aliran);
    };

    const batal = () => {
      // WAJIB dipanggil di SETIAP jalur keluar. Kalau callback nggak pernah
      // dipanggil, promise getDisplayMedia di halaman nggak pernah selesai —
      // bukan gagal, tapi menggantung — dan tombol "Bagikan layar" di
      // video-room ikut mati sampai halamannya di-reload.
      //
      // Objek kosong bikin halaman nerima AbortError ("Error starting
      // capture"), yang di sisi LiveKit diperlakukan sama kayak guru menekan
      // batal di picker Chrome.
      jawab({});
    };

    try {
      const frameMeminta = (request as { frame?: WebFrameMain }).frame ?? null;

      const [layarJendela, tab] = await Promise.all([
        desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 320, height: 180 },
          fetchWindowIcons: true,
        }),
        kumpulkanTab(frameMeminta),
      ]);

      const petaDesktop = new Map<string, Electron.DesktopCapturerSource>();
      const daftar: SumberBagi[] = [];

      for (const s of layarJendela) {
        const tipe: TipeSumber = s.id.startsWith("screen:") ? "layar" : "jendela";
        // Jendela tanpa nama biasanya jendela sistem yang nggak berguna dibagikan.
        if (tipe === "jendela" && !(s.name || "").trim()) continue;
        petaDesktop.set(s.id, s);
        daftar.push({
          kunci: s.id,
          tipe,
          nama: tipe === "layar" ? s.name || "Seluruh Layar" : s.name,
          thumb: s.thumbnail && !s.thumbnail.isEmpty() ? s.thumbnail.toDataURL() : null,
          ikon: s.appIcon && !s.appIcon.isEmpty() ? s.appIcon.resize({ width: 32 }).toDataURL() : null,
        });
      }

      const petaTab = new Map<string, Electron.WebContents>();
      for (const t of tab) {
        petaTab.set(t.sumber.kunci, t.wc);
        daftar.push(t.sumber);
      }

      if (daftar.length === 0) {
        batal();
        return;
      }

      const jendela = ambilJendela();
      if (!jendela || jendela.isDestroyed()) {
        batal();
        return;
      }

      const id = idBaru();
      const dipilih = await new Promise<string | null>((resolve) => {
        tertunda.set(id, { selesai: resolve });
        jendela.webContents.send("share-picker-buka", { id, sumber: daftar });
      });

      if (!dipilih) {
        batal();
        return;
      }

      if (dipilih.startsWith("tab:")) {
        const wc = petaTab.get(dipilih);
        if (!wc || wc.isDestroyed()) {
          batal();
          return;
        }
        // WebFrameMain, bukan objek desktopCapturer — ini jalur khusus share tab.
        jawab({ video: wc.mainFrame });
        return;
      }

      const sumber = petaDesktop.get(dipilih);
      if (!sumber) {
        batal();
        return;
      }
      // Audio sengaja nggak dikirim. Video-room memanggil getDisplayMedia dengan
      // audio:false, dan Electron memang MEMBUANG audio kalau audioRequested
      // false — jadi "loopback" yang dulu ada di sini nggak pernah berpengaruh.
      jawab({ video: sumber });
    } catch {
      batal();
    }
  });
}
