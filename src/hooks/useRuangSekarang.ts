import { useEffect, useMemo, useState } from "react";

import { authService } from "@/services/auth";
import {
  idRuangTersimpan,
  namaRuangTersimpan,
  punyaVoicemeeter,
  simpanNamaRuang,
} from "@/utils/ruangKelas";

/** Sekali seumur proses. Tanpa ini tiap komponen yang pakai hook ini manggil sendiri-sendiri. */
let sedangAmbil: Promise<string> | null = null;

async function ambilNamaRuang(id: string): Promise<string> {
  if (!sedangAmbil) {
    sedangAmbil = (async () => {
      try {
        const data = await authService.getClassList();
        const daftar = data?.data?.classrooms ?? [];
        const ketemu = daftar.find((c) => c.id === id);
        return ketemu?.name ?? "";
      } catch {
        // Nama ruang itu penyedap, bukan syarat. Gagal ambil ya udah.
        return "";
      }
    })();
  }
  return sedangAmbil;
}

/**
 * Ruang mana yang lagi dipakai podium ini, lengkap sama namanya.
 *
 * Namanya dibaca dari simpanan lokal dulu biar render pertama nggak nunggu
 * jaringan. Kalau belum ada — podium yang udah kadung milih ruang sebelum nama
 * mulai disimpan — daftar ruang diambil sekali, dicocokin id-nya, terus
 * disimpan. Sesudah itu nggak pernah minta lagi.
 *
 * SENGAJA nggak lewat thunk fetchClass: thunk itu nyalain loading global, dan
 * MainLayout ngerender overlay <Loading /> dari flag yang sama. Akibatnya layar
 * ketutup overlay tiap app dibuka sampai namanya ke-cache — kejadian beneran
 * waktu dites. Ini cuma buat nentuin satu menu muncul atau nggak, jadi nggak
 * boleh keliatan sama sekali kalau lagi ngambil, dan nggak boleh nampilin error
 * kalau gagal.
 *
 * Juga sengaja NGGAK ngambil dari jadwal yang lagi jalan (class_room_name di
 * event): menu kayak Voicemeeter justru kepake pas lagi nggak ada kelas, dan
 * pas itu nggak ada event yang bisa dibaca.
 */
export function useRuangSekarang() {
  const id = idRuangTersimpan();
  const [nama, setNama] = useState<string>(() => namaRuangTersimpan());

  useEffect(() => {
    if (nama || !id) return;
    let hidup = true;
    ambilNamaRuang(id).then((hasil) => {
      if (!hidup || !hasil) return;
      simpanNamaRuang(hasil);
      setNama(hasil);
    });
    return () => { hidup = false; };
  }, [nama, id]);

  return useMemo(
    () => ({
      id,
      nama,
      // Default-nya ADA. Kalau namanya belum ketahuan, menunya jangan
      // disembunyiin — lebih baik kelihatan padahal nggak kepasang daripada
      // hilang di ruang yang sebenernya punya.
      adaVoicemeeter: punyaVoicemeeter(nama),
    }),
    [id, nama],
  );
}
