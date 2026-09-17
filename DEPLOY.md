# Cara Rilis Smart Podium

Catatan ini buat orang yang mau ngeluarin versi baru ke podium di sekolah.
Semua isinya dicocokin sama konfigurasi yang beneran ada di repo
(`package.json`, `electron-builder.json`, `electron/main/update.ts`) — bukan
tebakan.

---

## Gambaran singkat

Podium **update sendiri**. Nggak ada yang keliling sekolah bawa flashdisk.

```
naikin versi  →  npm run publish:win  →  installer ke-upload ke GitHub Release
                                          (masuk sebagai DRAFT)
                                              ↓
                                     kamu publish drafnya
                                              ↓
                         podium ngecek, ngunduh, pasang sendiri
```

Yang bikin ini aman: **selama masih draft, nggak ada podium yang kebagian.**
Jadi drafnya itu rem tangan — installernya udah di GitHub, tapi belum nyebar
sampai kamu yang mutusin.

---

## Sekali doang: nyiapin mesin

| Butuh | Kenapa |
|---|---|
| Node.js 20 | versi yang dipakai selama ini |
| Berkas `.env` di root | isinya alamat API, secret hash, sama token GitHub |
| `wine` (kalau build dari macOS) | electron-builder butuh ini buat ngerakit installer NSIS Windows |

Kunci yang harus ada di `.env` — nilainya tanya yang pegang:

```
VITE_API_URL=
VITE_API_AUTH_URL=
VITE_API_SLMS_URL=
VITE_API_AUTH_CODE=
VITE_API_WHISPER_URL=
VITE_HASH_SECRET=
VITE_GH_TOKEN=
VITE_LOGIN_EMAIL=
VITE_LOGIN_PASSWORD=
```

`VITE_GH_TOKEN` butuh akses tulis ke repo `RitLab/smart-podium`, karena dia yang
dipakai buat bikin release sekaligus dibaca podium waktu ngunduh update.

Pasang wine di macOS:

```bash
brew install --cask wine-stable
```

---

## Langkah rilis

### 1. Pastikan yang mau dirilis udah di `master`

```bash
git checkout master && git pull
```

### 2. Naikin versi di `package.json`

**Wajib naik tiap rilis.** Nomor versi ini yang dipakai buat nentuin ada update
atau nggak, sekaligus jadi nama tag (`v1.2.36`). Kalau nomornya nggak naik,
podium nganggep nggak ada apa-apa.

```bash
npm version patch --no-git-tag-version   # 1.2.36 -> 1.2.37
```

### 3. Cek dulu nggak ada yang rusak

```bash
npx tsc --noEmit
```

### 4. Build + upload

```bash
npm run publish:win
```

Yang dia lakuin, urut: baca `VITE_GH_TOKEN` dari `.env` → `tsc` → `vite build` →
`electron-builder --win --publish always`.

Makan waktu beberapa menit. Kelar sukses kalau ada baris:

```
• creating GitHub release  reason=release doesn't exist tag=v1.2.37 version=1.2.37
```

Hasilnya juga ditaruh lokal di `release/1.2.37/`:

| Berkas | Gunanya |
|---|---|
| `Smart Podium_1.2.37.exe` | installer, ±150 MB |
| `latest.yml` | ini yang dibaca podium buat tahu ada versi baru |
| `*.blockmap` | biar podium ngunduh bagian yang berubah doang |
| `win-unpacked/` | hasil rakitan mentahnya, buat ngintip isi |

### 5. Coba installernya dulu

Ambil `.exe` dari `release/<versi>/`, pasang di satu mesin Windows, pastiin
jalan. Ini langkah terakhir sebelum nggak bisa ditarik balik — lihat
[Nggak bisa mundur](#nggak-bisa-mundur-ke-versi-lama) di bawah.

### 6. Publish drafnya

Selama masih draft, **belum ada podium yang kebagian**.

```bash
gh release view v1.2.37 --web
```

Klik **Edit** → **Publish release**. Atau dari terminal:

```bash
gh release edit v1.2.37 --draft=false
```

### 7. Pastiin beneran kepublish

```bash
gh release view v1.2.37 --json isDraft,assets --jq '{draft: .isDraft, berkas: [.assets[].name]}'
```

Yang bener: `draft: false`, dan `berkas` isinya ada `latest.yml` sama file
`.exe`-nya. **Kalau `latest.yml` nggak ada, podium nggak bakal tahu ada update.**

---

## Yang kejadian di podium

Diatur di `electron/main/update.ts`. Cuma jalan di aplikasi yang udah dipaketin
(`app.isPackaged`), jadi waktu `npm run dev` nggak ada update-updatean.

| Kapan | Apa yang terjadi |
|---|---|
| 30 detik sesudah app nyala | ngecek sekali |
| tiap 30 menit sesudahnya | ngecek lagi |
| ketemu versi baru | langsung diunduh sendiri (`autoDownload = true`) |
| kelar diunduh | app ditutup, dipasang, dibuka lagi — otomatis |

**Update nggak akan motong kelas.** Renderer ngirim penanda sibuk
(`update-busy`) selama ada rekaman jalan atau jam pelajaran lagi aktif. Selama
sibuk: pengecekan dilewat, dan kalau ada yang terlanjur siap dipasang, dia
ditahan sampai kelasnya kelar baru dipasang. Guru lihat pesannya di status
app ("Pembaruan siap dipasang setelah kelas selesai").

Podium yang lagi mati atau offline nggak masalah — pengecekan berikutnya jalan
lagi. Error pengecekan sengaja didiemin karena podium sering putus sambungan
sebentar.

---

## Hal yang bikin kepeleset

### Nggak bisa mundur ke versi lama

`autoUpdater.allowDowngrade = false`. Podium **nggak akan mau** turun versi.
Jadi kalau versi baru ternyata bermasalah:

- ❌ publish ulang versi lama — nggak ngefek, podium nolak
- ✅ benerin, naikin versi lagi (1.2.37 → 1.2.38), publish

Kalau belum banyak yang ngunduh dan mau nyetop penyebaran, balikin rilisnya jadi
draft:

```bash
gh release edit v1.2.37 --draft=true
```

Yang udah terlanjur update tetep di versi itu. Cara balikinnya cuma satu: rilis
versi lebih tinggi yang isinya perbaikan.

### Token GitHub ikut masuk ke installer

`VITE_GH_TOKEN` ke-compile ke dalam bundle (dicek: ada di
`dist-electron/main/index.js`), karena podium butuh token itu buat ngunduh
update. Artinya token itu ikut nyebar ke tiap mesin yang dipasangin.

`asar: true` cuma pembungkus, **bukan enkripsi** — gampang dibongkar. Jadi:

- pakai token yang aksesnya sesempit mungkin, sebatas repo ini
- kalau ada installer bocor keluar, anggap tokennya ikut bocor dan ganti

### Installernya per-user, bukan per-mesin

`oneClick: true`, `perMachine: false`. Konsekuensinya:

- kepasang cuma buat user Windows yang lagi login, nggak butuh admin
- nggak ada wizard — sekali klik langsung pasang dan langsung kebuka
  (`runAfterFinish`)
- kalau podium dipakai beberapa akun Windows, tiap akun punya instalasi sendiri

### Data nggak kehapus waktu uninstall

`deleteAppDataOnUninstall: false`. Uninstall nggak ngapus lisensi, ruang kelas
yang kepilih, sama data browser. Bagus buat install ulang, tapi ingat kalau
podiumnya mau dipindah ke sekolah lain — bersihin dulu manual.

### Nomor versi nggak boleh dipakai dua kali

Tag `v<versi>` udah kepakai bikin `publish:win` gagal. Naikin nomornya, atau
hapus dulu rilis sama tag lamanya.

---

## Build doang, tanpa nyebar

Butuh `.exe` buat dites sendiri tanpa nyentuh GitHub:

```bash
npm run build:win
```

Hasilnya di `release/<versi>/`. Nggak ada yang di-upload, nggak ada rilis yang
dibikin.

---

## Kalau gagal

| Gejalanya | Kemungkinan sebabnya |
|---|---|
| `GH_TOKEN is not set` | `VITE_GH_TOKEN` nggak ada di `.env`, atau `.env`-nya nggak di root |
| Gagal pas ngerakit NSIS di macOS | `wine` belum kepasang |
| `release already exists` | versinya belum dinaikin |
| Podium nggak dapet update | rilisnya masih draft, atau `latest.yml` nggak keikut |
| Update kedownload tapi nggak kepasang-pasang | lagi ada kelas jalan — emang ditahan sampai kelar |

---

## Ringkasan buat yang udah hafal

```bash
git checkout master && git pull
npm version patch --no-git-tag-version
npx tsc --noEmit
npm run publish:win
# coba release/<versi>/*.exe di mesin Windows
gh release edit v<versi> --draft=false
gh release view v<versi> --json isDraft,assets
```
