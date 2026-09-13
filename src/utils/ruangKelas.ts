/**
 * Apa yang kepasang di sebuah ruang itu beda-beda.
 *
 * Aula nggak punya Voicemeeter — aplikasinya emang dihapus dari mesin di sana.
 * Ikonnya tetep nongol bikin guru ngeklik sesuatu yang nggak akan pernah kebuka,
 * jadi menunya disembunyiin buat ruang yang kayak gitu.
 *
 * Dicocokin dari NAMA ruang, bukan dari flag di server. Ini bukan pilihan yang
 * paling enak, tapi respons daftar kelas emang belum punya penanda apa pun soal
 * aplikasi yang kepasang — `metadata`-nya balik kosong ({}) buat Aula. Kalau
 * nanti backend nambahin penanda, ganti isi PERIKSA_NAMA di bawah jadi baca
 * penanda itu; sisa kodenya nggak perlu disentuh.
 */

// "class_id" itu warisan penamaan yang nyesatin: isinya sebenernya id RUANG
// (class_room_id), bukan id kelas. Kunci nama sengaja dikasih nama yang bener
// (class_room_name) daripada ikut-ikutan salah — "class_name" udah dipakai
// respons API buat arti yang beda (nama rombel, bukan nama ruang).
const KUNCI_ID = "class_id";
const KUNCI_NAMA = "class_room_name";

/** Ruang yang Voicemeeter-nya nggak kepasang, dicocokin per kata. */
const RUANG_TANPA_VOICEMEETER = ["aula"];

/** Samain dulu bentuknya: beda spasi atau beda besar-kecil huruf jangan bikin meleset. */
const rapikan = (nama: string) => nama.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Dicocokin per KATA, bukan substring. "Aula" cocok, "Aula Barat" juga cocok,
 * tapi "Ruang Maulana" nggak — padahal ngandung "aula".
 */
const PERIKSA_NAMA = (nama: string) => {
  const kata = rapikan(nama).split(/[^a-z0-9]+/).filter(Boolean);
  return RUANG_TANPA_VOICEMEETER.some((t) => kata.includes(t));
};

export const punyaVoicemeeter = (namaRuang: string | null | undefined): boolean =>
  !namaRuang ? true : !PERIKSA_NAMA(namaRuang);

export const idRuangTersimpan = (): string => localStorage.getItem(KUNCI_ID) || "";

export const namaRuangTersimpan = (): string => localStorage.getItem(KUNCI_NAMA) || "";

/**
 * Dipanggil pas guru milih ruang. Namanya ikut disimpan karena sesudah ini
 * daftar kelas nggak pernah diambil lagi — tanpa ini, begitu app di-restart
 * aplikasinya cuma tahu id-nya doang dan nggak bisa tahu ruangnya yang mana.
 */
export const simpanRuangTerpilih = (id: string, nama: string) => {
  localStorage.setItem(KUNCI_ID, id);
  if (nama) localStorage.setItem(KUNCI_NAMA, nama);
};

/** Buat podium yang udah kadung milih ruang sebelum nama mulai disimpan. */
export const simpanNamaRuang = (nama: string) => {
  if (nama) localStorage.setItem(KUNCI_NAMA, nama);
};
