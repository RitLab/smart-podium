// src/types/module.ts

export interface ReferensiSub {
  value: string;
  label: string;
}

export interface ReferensiItem {
  value: string;
  label: string;
  sub?: ReferensiSub[];
}

export interface BahanAjarItem {
  bidang_studi_id: number;
  created_at: string;
  created_by: string;
  description: string;
  file_url: string;
  id: number;
  image: string;
  jumlah_evaluasi: number;
  jumlah_pokok_bahasan: number;
  jumlah_sesi: number;
  sub_bidang_studi_id: number;
  title: string;
  updated_at: string;
  updated_by: string;
}

export interface Pengajar {
  id: number;
  bahan_ajar_id: number;
  user_id: number;
  name: string;
  nip: string;
  no_hp: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
}

export interface Sesi {
  id: number;
  bahan_ajar_id: number;
  title: string;
}

export interface BahanAjarDetail {
  header: BahanAjarItem;
  pengajar: Pengajar[];
  sesi: Sesi[];
  evaluasi: any;
  referensi: any;
  konten_interaktif: any;
}
