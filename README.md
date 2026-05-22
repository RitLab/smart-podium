# electron-vite-react

[![awesome-vite](https://awesome.re/mentioned-badge.svg)](https://github.com/vitejs/awesome-vite)
![GitHub stars](https://img.shields.io/github/stars/caoxiemeihao/vite-react-electron?color=fa6470)
![GitHub issues](https://img.shields.io/github/issues/caoxiemeihao/vite-react-electron?color=d8b22d)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/vite-react-electron)
[![Required Node.JS >= 14.18.0 || >=16.0.0](https://img.shields.io/static/v1?label=node&message=14.18.0%20||%20%3E=16.0.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

## 👀 Overview

📦 Ready out of the box  
🎯 Based on the official [template-react-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts), project structure will be familiar to you  
🌱 Easily extendable and customizable  
💪 Supports Node.js API in the renderer process  
🔩 Supports C/C++ native addons  
🐞 Debugger configuration included  
🖥 Easy to implement multiple windows  

## 🛫 Quick Setup

```sh
# clone the project
git clone https://github.com/electron-vite/electron-vite-react.git

# enter the project directory
cd electron-vite-react

# install dependency
npm install

# develop
npm run dev
```

## 🐞 Debug

![electron-vite-react-debug.gif](/electron-vite-react-debug.gif)

## 📂 Directory structure

Familiar React application structure, just with `electron` folder on the top :wink:  
*Files in this folder will be separated from your React application and built into `dist-electron`*  

```tree
├── electron                                 Electron-related code
│   ├── main                                 Main-process source code
│   └── preload                              Preload-scripts source code
│
├── release                                  Generated after production build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                   Contains unpacked application executable
│       └── {app_name}_{version}.{ext}       Installer for the application
│
├── public                                   Static assets
└── src                                      Renderer source code, your React application
```

<!--
## 🚨 Be aware

This template integrates Node.js API to the renderer process by default. If you want to follow **Electron Security Concerns** you might want to disable this feature. You will have to expose needed API by yourself.  

To get started, remove the option as shown below. This will [modify the Vite configuration and disable this feature](https://github.com/electron-vite/vite-plugin-electron-renderer#config-presets-opinionated).

```diff
# vite.config.ts

export default {
  plugins: [
    ...
-   // Use Node.js API in the Renderer-process
-   renderer({
-     nodeIntegration: true,
-   }),
    ...
  ],
}
```
-->

## 🔧 Additional features

1. electron-updater 👉 [see docs](src/components/update/README.md)

## ❔ FAQ

- [C/C++ addons, Node.js modules - Pre-Bundling](https://github.com/electron-vite/vite-plugin-electron-renderer#dependency-pre-bundling)
- [dependencies vs devDependencies](https://github.com/electron-vite/vite-plugin-electron-renderer#dependencies-vs-devdependencies)

---

## 🧾 Smart Podium — Dokumentasi Fitur, API, dan Flow (Step-by-step)

Dokumen ini adalah referensi operasional untuk Smart Podium: fitur apa saja yang ada, API apa saja yang dipanggil (HTTP + IPC), serta flow-case yang perlu dipahami saat debugging (khususnya recording session).

### 0) Scope & Non-scope

**Scope (yang dilakukan aplikasi ini):**
- Menentukan jadwal aktif (polling event).
- Start/stop “recording session” via backend.
- UI state (timer, modal konfirmasi stop, summary).
- Recovery state setelah restart/crash menggunakan localStorage.

**Non-scope (tidak ada di repo ini):**
- Capture layar/audio dan upload video (tidak ada `desktopCapturer`, `MediaRecorder`, ffmpeg, upload blob). Aplikasi ini hanya mengirim sinyal “start/stop session”. Rekaman fisik kemungkinan dilakukan oleh backend/agent di luar repo.

### 1) Arsitektur Singkat

1. **Main process (Electron)**
   - Membuat `BrowserWindow`, mengaktifkan `webviewTag`, meng-handle IPC, menjalankan updater.
   - Lokasi: `electron/main/index.ts`, `electron/main/update.ts`
2. **Preload**
   - Expose IPC API ke renderer via `contextBridge`.
   - Lokasi: `electron/preload/index.ts`
3. **Renderer (React)**
   - UI Smart Podium, routing, Redux store, service layer (axios).
   - Lokasi: `src/**`

### 2) Storage (yang dipakai)

**localStorage**
- `class_id`: filter jadwal kelas (calendar).
- `token`: dipakai axios interceptor tertentu.
- `browser-bookmarks`: bookmark internal browser.
- `smart_podium_recording_state`: recovery recording.

**sessionStorage**
- `token`: sebagian flow auth menyimpan token di sini.

### 3) Fitur (User-facing) — Urutan besar

1. **Home/Dashboard**
   - Menampilkan jam & tanggal, informasi pengajar/materi sesuai event aktif.
   - Tombol **Mulai/Selesai** sesi belajar.
   - Indikator **Recording** (timer) di pojok.
2. **Kalender Akademik**
   - Menampilkan jadwal dan hari libur.
3. **Manajemen Peserta Didik (Absensi)**
   - Menampilkan attendance per event dan update status.
4. **Modul / Bahan Ajar**
   - Referensi, list bahan ajar, detail.
   - Viewer: file/pdf, image viewer, video player, 3D viewer, interactive viewer.
5. **Penampil Web (Internal Browser)**
   - Multi tab, address bar, back/forward/reload, bookmark, fullscreen.
6. **Updater**
   - Check/download/install via electron-updater.
7. **Integrasi App Eksternal (Windows)**
   - Whiteboard, Zoom, WonderCast, Voicemeeter via `spawn`.

### 4) Header Keamanan Request (X-Api-Key)

Request yang memakai `handler` dari `src/services/hash.ts` akan otomatis menambahkan:
- `X-Api-Key = HMAC_SHA256(pathname, VITE_HASH_SECRET)`

### 5) API HTTP — List Lengkap

Base URL dari env:
- `baseWhisperUrl = VITE_API_WHISPER_URL`
- `baseURL = VITE_API_URL`
- `slmsBaseUrl = VITE_API_SLMS_URL`

#### 5.1 Whisper API (`baseWhisperUrl`) — Jadwal + Record

1) **Event list (jadwal)**
- `GET {baseWhisperUrl}/portal/event`
- Params: `{ month: number, year: number }`
- Dipakai oleh: polling jadwal untuk `activeEvent`.

2) **Teacher PIN check (record)**
- `POST {baseWhisperUrl}/portal/teacher/pin/check`
- Body:
```json
{ "teacher_id": "string", "pin": "string" }
```

3) **Start recording session**
- `POST {baseWhisperUrl}/portal/video/{eventId}/start`
- Response minimal:
```json
{ "session_id": "string" }
```

4) **Stop recording session**
- `POST {baseWhisperUrl}/portal/video/stop`
- Body:
```json
{ "session_id": "string", "event_id": "string" }
```

#### 5.2 Core API (`baseURL`) — Auth + Attendance + Classroom

1) **Login**
- `POST {baseURL}/user/login`

2) **Teacher PIN check (auth flow)**
- `POST {baseURL}/portal/teacher/pin/check`
- Body (lihat `TokenPayload`): `{ pin, class_id }`

3) **Classroom list**
- `GET {baseURL}/portal/classroom`

4) **Attendance**
- `GET {baseURL}/portal/event/attendance` (params `{ event_id }`)
- `PUT {baseURL}/portal/event/attendance` (body `UpdateAttendance`)

#### 5.3 SLMS API (`slmsBaseUrl`) — Bahan Ajar

Header:
- `Authorization: VITE_API_AUTH_CODE`

Endpoints:
- `GET /portal/bahan-ajar/referensi`
- `POST /portal/bahan-ajar/list` (body `{ page, limit, search?, category, sub_category? }`)
- `GET /portal/bahan-ajar/{id}`

#### 5.4 External Public API

- `GET https://libur.deno.dev/api?year=YYYY` (hari libur untuk kalender)

### 6) IPC Electron — List Lengkap

Renderer → Main (`window.ipcRenderer.invoke`):
- `minimize-window`
- `close-window`
- `show-quit-dialog`
- `open-whiteboard`
- `open-zoom`
- `open-wondercast`
- `open-voicemeeter`
- `open-win` (buka child window dengan hash route)
- Updater: `check-update`, `start-download`, `quit-and-install`

Main → Renderer (`window.ipcRenderer.on`):
- `request-stop-record-before-quit` (best-effort stop record sebelum app keluar)

### 7) Recording Session — Flow Step-by-step

#### 7.1 Data yang dipersist untuk recovery

Key localStorage:
- `smart_podium_recording_state`

Field penting:
- `isRecording`
- `session_id`
- `recordingEventId`
- `recordingEventEndTime` (string jam; format bisa `"HH:MM"` atau `"HH.MM"`)
- `recordingEventEndAt` (timestamp ms; referensi utama saat recovery)
- `startTime` (timestamp ms; menghitung durasi UI)
- `hasStoppedSession`, `stoppedAt`

#### 7.2 Start Session (user klik “Mulai”)

1) Aplikasi menentukan `activeEvent` dari polling jadwal.
2) User klik **Mulai** → PIN modal muncul.
3) PIN benar → aplikasi memanggil:
   - `POST /portal/teacher/pin/check` (validasi)
   - `POST /portal/video/{eventId}/start` (start session)
4) Backend mengembalikan `session_id`.
5) Aplikasi set Redux state `record` dan simpan recovery ke localStorage:
   - `recordingEventId = eventId`
   - `recordingEventEndTime/endAt` (untuk auto-stop & recovery)
   - `startTime = Date.now()`
6) UI indikator “Recording” muncul dan durasi bertambah tiap detik (ticking).

#### 7.3 Stop Session (manual)

1) User klik **Selesai** → modal konfirmasi.
2) User konfirmasi → aplikasi memanggil:
   - `POST /portal/video/stop` dengan `{ session_id, event_id, isAuto:false }`
3) Setelah sukses:
   - `isRecording=false`
   - `showSummary=true`, `hasStoppedSession=true`, `stoppedAt=Date.now()`

#### 7.4 Stop Session (auto — waktu habis)

1) Selama `isRecording=true`, aplikasi mengecek tiap 1 detik:
   - bandingkan `Date.now()` vs `recordingEventEndAt`
2) Jika lewat → aplikasi memanggil:
   - `POST /portal/video/stop` dengan `{ session_id, event_id, isAuto:true }`
3) UI recording berhenti tanpa menampilkan summary seperti stop manual.

#### 7.5 Recovery setelah app ditutup & dibuka lagi

Target: jika user keluar saat masih recording, lalu buka lagi setelah waktu kelas lewat, app wajib memaksa stop ke backend saat boot.

1) Saat app dibuka:
   - Redux `record` state rehydrate dari localStorage.
2) Boot/recovery check:
   - Jika `isRecording=true` dan `Date.now() >= recordingEventEndAt` → aplikasi memanggil stop (auto).
   - Jika `Date.now() < recordingEventEndAt` → aplikasi melanjutkan mode recording (duration dihitung dari `startTime`).

#### 7.6 Failure handling (stop API gagal)

Jika stop API gagal, aplikasi tetap mematikan state recording lokal agar UI tidak stuck.

### 8) Checklist Test (QA)

1) **Normal**: Mulai → tunggu 5 detik → Selesai manual → backend stop terpanggil.
2) **Auto-stop**: Mulai → tunggu sampai `end_time` lewat → backend stop terpanggil otomatis.
3) **Recovery stop**: Mulai → close app sebelum end_time → buka lagi setelah end_time → backend stop terpanggil saat boot.
4) **Recovery continue**: Mulai → close app → buka lagi sebelum end_time → masih recording dan tidak stop.
5) **Stop fail**: simulasi backend down → stop → UI tetap berhenti (lokal), tidak stuck.
