import type { ContextMenuParams, MenuItemConstructorOptions } from "electron";

/**
 * Menu klik-kanan buat browser dalam aplikasi, disusun ngikutin Chrome.
 * Di podium touchscreen, "tahan" (long-press) itu cara Chromium micu event
 * contextmenu, jadi satu handler nutup klik kanan sekaligus hold.
 *
 * Dipisah dari index.ts supaya penyusunan menunya murni fungsi dan bisa diuji
 * tanpa perlu proses Electron beneran.
 */

export type NavigasiWebview = {
  canGoBack: boolean;
  canGoForward: boolean;
};

export type AksiMenuKonten = {
  bukaTab: (url: string) => void;
  salinTeks: (teks: string) => void;
  potong: () => void;
  salin: () => void;
  tempel: () => void;
  pilihSemua: () => void;
  kembali: () => void;
  maju: () => void;
  muatUlang: () => void;
};

const potongLabel = (teks: string, maks = 32) => {
  const rapi = teks.replace(/\s+/g, " ").trim();
  return rapi.length > maks ? rapi.slice(0, maks - 1) + "…" : rapi;
};

const urlPencarian = (kata: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(kata.trim())}`;

export function susunMenuKonten(
  params: Pick<ContextMenuParams, "linkURL" | "srcURL" | "mediaType" | "selectionText" | "isEditable" | "editFlags">,
  nav: NavigasiWebview,
  aksi: AksiMenuKonten,
): MenuItemConstructorOptions[] {
  const menu: MenuItemConstructorOptions[] = [];
  const pisah = () => { if (menu.length && menu[menu.length - 1].type !== "separator") menu.push({ type: "separator" }); };

  // Link — urutan sama kayak Chrome: buka di tab baru dulu, baru salin alamat
  if (params.linkURL) {
    const url = params.linkURL;
    menu.push({ label: "Buka tautan di tab baru", click: () => aksi.bukaTab(url) });
    menu.push({ label: "Salin alamat tautan", click: () => aksi.salinTeks(url) });
    pisah();
  }

  // Gambar
  if (params.mediaType === "image" && params.srcURL) {
    const src = params.srcURL;
    menu.push({ label: "Buka gambar di tab baru", click: () => aksi.bukaTab(src) });
    menu.push({ label: "Salin alamat gambar", click: () => aksi.salinTeks(src) });
    pisah();
  }

  // Kolom isian — Chrome nampilin potong/salin/tempel/pilih semua
  if (params.isEditable) {
    const f = params.editFlags;
    menu.push({ label: "Potong", enabled: !!f?.canCut, click: aksi.potong });
    menu.push({ label: "Salin", enabled: !!f?.canCopy, click: aksi.salin });
    menu.push({ label: "Tempel", enabled: !!f?.canPaste, click: aksi.tempel });
    menu.push({ label: "Pilih semua", enabled: f ? f.canSelectAll !== false : true, click: aksi.pilihSemua });
    pisah();
  } else if (params.selectionText && params.selectionText.trim()) {
    // Teks terseleksi di halaman biasa
    const teks = params.selectionText;
    menu.push({ label: "Salin", click: aksi.salin });
    menu.push({ label: `Cari Google untuk "${potongLabel(teks)}"`, click: () => aksi.bukaTab(urlPencarian(teks)) });
    pisah();
  }

  // Navigasi halaman — selalu ada, sama kayak Chrome
  menu.push({ label: "Kembali", enabled: nav.canGoBack, click: aksi.kembali });
  menu.push({ label: "Maju", enabled: nav.canGoForward, click: aksi.maju });
  menu.push({ label: "Muat ulang", click: aksi.muatUlang });

  return menu;
}

export type AksiTab = "tab-baru" | "muat-ulang" | "duplikat" | "tutup";

/**
 * Menu klik-kanan di TAB (bukan di isi halaman) — ngikutin tab strip Chrome.
 * Balikannya string aksi; yang ngeksekusi renderer, karena state tab ada di
 * Redux sana.
 */
export function susunMenuTab(
  opsi: { bisaTutup: boolean; adaUrl: boolean },
  pilih: (aksi: AksiTab) => void,
): MenuItemConstructorOptions[] {
  return [
    { label: "Tab baru", click: () => pilih("tab-baru") },
    { label: "Muat ulang", enabled: opsi.adaUrl, click: () => pilih("muat-ulang") },
    { label: "Duplikat tab", enabled: opsi.adaUrl, click: () => pilih("duplikat") },
    { type: "separator" },
    { label: "Tutup tab", enabled: opsi.bisaTutup, click: () => pilih("tutup") },
  ];
}
