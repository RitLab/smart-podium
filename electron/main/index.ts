import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  session,
  Menu,
  dialog,
  clipboard,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { spawn } from "child_process";
import { update } from "./update";
import { susunMenuKonten, susunMenuTab, type AksiTab } from "./browserMenu";
import { pasangSharePicker } from "./sharePicker";

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

if (VITE_DEV_SERVER_URL) {
  app.commandLine.appendSwitch('ignore-certificate-errors');
}

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
let isQuitting = false;

const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

function requestStopRecordBeforeQuit(target?: BrowserWindow | null) {
  const windows = target ? [target] : BrowserWindow.getAllWindows();
  windows.forEach((w) => {
    try {
      w.webContents.send("request-stop-record-before-quit");
    } catch {}
  });
}

// ===============================
// OPEN WHITEBOARD FUNCTION
// ===============================
function openWhiteboard() {
  const exePath =
    "C:\\Program Files (x86)\\Whiteboard_6.4.12.6402\\Main\\Whiteboard.exe";

  try {
    spawn(exePath, [], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } catch (error) {
    console.error("Failed to open Whiteboard:", error);
  }
}

function openZoom() {
  const exePath =
    "C:\\Users\\Smartclass\\AppData\\Roaming\\Zoom\\bin\\Zoom.exe";

  try {
    spawn(exePath, [], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } catch (error) {
    console.error("Failed to open Zoom:", error);
  }
}

function openWonderCast() {
  const exePath = "C:\\Program Files (x86)\\WonderCast\\WonderCast.exe";

  try {
    spawn(exePath, [], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } catch (error) {
    console.error("Failed to open WonderCast:", error);
  }
}

function openVoicemeeter() {
  const exePath = "C:\\Program Files (x86)\\VB\\Voicemeeter\\voicemeeter.exe";

  try {
    spawn(exePath, [], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } catch (error) {
    console.error("Failed to open Voicemeeter:", error);
  }
}

// ===============================
// SETUP SEKALI SEUMUR APLIKASI
// ===============================
// Semua yang nempel ke session atau ke ipcMain cuma boleh dipasang SEKALI.
// createWindow() bisa jalan lagi lewat event "activate" (macOS bikin ulang
// jendela setelah semua ditutup), dan ipcMain.handle yang kedua bikin Electron
// lempar "Attempted to register a second handler" — itu muncul sebagai
// unhandled rejection dan bikin sisa setup di bawahnya batal jalan.
let globalSudahDipasang = false;

function pasangSekali() {
  if (globalSudahDipasang) return;
  globalSudahDipasang = true;

  // ===== Supaya browser dalam aplikasi berperilaku kayak Chrome =====
  //
  // 1. User-Agent. Bawaan Electron nyelipin "smart-podium/x.y.z" dan
  //    "Electron/x.y.z" di UA. Banyak layanan — termasuk SDK WebRTC seperti
  //    LiveKit yang dipakai video-room sekolah — mendeteksi browser dari UA
  //    string. Token "Electron/x" bikin mereka salah deteksi dan mematikan
  //    fitur. Dua token itu dibuang biar UA-nya kebaca sebagai Chrome biasa.
  const versiChrome = process.versions.chrome;               // "130.0.6723.191"
  const mayorChrome = versiChrome.split(".")[0];             // "130"
  const platformHint =
    process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux";
  const uaChrome = session.defaultSession
    .getUserAgent()
    .replace(/ smart-podium\/\S+/i, "")
    .replace(/ Electron\/\S+/, "");
  session.defaultSession.setUserAgent(uaChrome);

  // 1b. Client hints dasar. Wajib ikut dibetulkan karena UA string di atas udah
  //     kita ubah jadi "Chrome/130": kalau brand di Sec-CH-UA masih bilang
  //     "Chromium" doang, dua sumber identitas itu jadi saling bertentangan dan
  //     situs yang mengecek keduanya bisa salah ambil keputusan.
  const secChUa = `"Chromium";v="${mayorChrome}", "Google Chrome";v="${mayorChrome}", "Not?A_Brand";v="99"`;

  // 2. Share screen lewat picker ala Chrome (Seluruh Layar / Jendela / Tab).
  //    Lihat electron/main/sharePicker.ts. Handler-nya dipasang di session
  //    default, dan itu juga melayani getDisplayMedia yang dipanggil dari DALAM
  //    <webview> — jadi video-room sekolah (LiveKit) dilayani picker yang sama.
  pasangSharePicker(() => win, session.defaultSession);

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (
      details.url.includes("youtube.com") ||
      details.url.includes("ytimg.com")
    ) {
      details.requestHeaders["Referer"] = "https://www.youtube.com";
    }
    // Client hints dasar, biar konsisten sama UA string yang udah kita ubah.
    details.requestHeaders["sec-ch-ua"] = secChUa;
    details.requestHeaders["sec-ch-ua-mobile"] = "?0";
    details.requestHeaders["sec-ch-ua-platform"] = `"${platformHint}"`;
    callback({ requestHeaders: details.requestHeaders });
  });

  // Bersihin data browsing (cookie, cache, storage) di session default —
  // session yang dipakai webview browser dalam app. Podium ini dipakai
  // gantian, jadi guru berikutnya nggak boleh kebagian sesi login guru
  // sebelumnya.
  ipcMain.handle("browser-clear-data", async () => {
    try {
      await session.defaultSession.clearStorageData({
        storages: ["cookies", "localstorage", "indexdb", "websql", "serviceworkers", "cachestorage"],
      });
      await session.defaultSession.clearCache();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String((e as Error)?.message || e) };
    }
  });

  // Klik kanan / tahan di TAB (tab strip). Renderer yang minta, main yang
  // munculin menu native, hasilnya dikembalikan sebagai string aksi.
  ipcMain.handle(
    "browser-tab-menu",
    (_e, opsi: { bisaTutup: boolean; adaUrl: boolean }) =>
      new Promise<AksiTab | null>((resolve) => {
        const menu = Menu.buildFromTemplate(susunMenuTab(opsi, resolve));
        menu.popup({ window: win ?? undefined, callback: () => resolve(null) });
      }),
  );
}

// ===============================
// CREATE WINDOW
// ===============================
async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    fullscreen: true,
    webPreferences: {
      preload,
      webviewTag: true,
    },
  });

  pasangSekali();

  if (process.platform !== "darwin") {
    win.on("close", (e) => {
      if (isQuitting) return;
      e.preventDefault();
      isQuitting = true;
      requestStopRecordBeforeQuit(win);
      setTimeout(() => {
        app.quit();
      }, 1500);
    });
  }

  // ===============================
  // CUSTOM MENU
  // ===============================
  // const template = [
  //   {
  //     label: "Applications",
  //     submenu: [
  //       {
  //         label: "Open Whiteboard",
  //         click() {
  //           openWhiteboard();
  //         },
  //       },
  //     ],
  //   },
  // ];

  // const menu = Menu.buildFromTemplate(template as any);
  // Menu.setApplicationMenu(menu);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // ===== Browser dalam aplikasi (<webview> di halaman Penampil Web) =====
  //
  // Handler di atas cuma buat jendela utama. Halaman yang dibuka DI DALAM
  // webview punya webContents sendiri, dan tanpa handler khusus, window.open()
  // maupun link target="_blank" dari situ nggak ngapa-ngapain. Sekarang tiap
  // popup dari webview dialihkan jadi tab baru di tab bar kita — persis kayak
  // Chrome — bukan jendela OS terpisah, dan bukan diblokir diam-diam.
  win.webContents.on("did-attach-webview", (_event, contents) => {
    const bukaTab = (url: string) => {
      if (/^https?:\/\//i.test(url)) win?.webContents.send("browser-open-tab", url);
    };

    contents.setWindowOpenHandler(({ url }) => {
      bukaTab(url);
      return { action: "deny" };
    });

    // Klik kanan / tahan di isi halaman -> menu native ala Chrome. Aksi edit
    // dipanggil langsung di webContents ini, bukan lewat role, supaya nggak
    // salah sasaran ke jendela utama.
    contents.on("context-menu", (_e, params) => {
      const template = susunMenuKonten(
        params,
        { canGoBack: contents.canGoBack(), canGoForward: contents.canGoForward() },
        {
          bukaTab,
          salinTeks: (t) => clipboard.writeText(t),
          potong: () => contents.cut(),
          salin: () => contents.copy(),
          tempel: () => contents.paste(),
          pilihSemua: () => contents.selectAll(),
          kembali: () => contents.goBack(),
          maju: () => contents.goForward(),
          muatUlang: () => contents.reload(),
        },
      );
      Menu.buildFromTemplate(template).popup({ window: win ?? undefined });
    });
  });

  update(win);
}

// ===============================
// APP READY
// ===============================
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

// ===============================
// APP EVENTS
// ===============================
app.on("before-quit", (e) => {
  if (isQuitting) return;
  e.preventDefault();
  isQuitting = true;
  requestStopRecordBeforeQuit();
  setTimeout(() => app.quit(), 1500);
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();

  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// ===============================
// IPC
// ===============================
ipcMain.handle("minimize-window", () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.minimize();
  }
});

ipcMain.handle("close-window", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) ?? BrowserWindow.getFocusedWindow();
  isQuitting = true;
  requestStopRecordBeforeQuit(win);
  setTimeout(() => app.quit(), 1500);
});

ipcMain.handle("show-quit-dialog", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const result = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["Batal", "Ya, Tutup"],
    defaultId: 1,
    title: "Konfirmasi",
    message: "Apakah Anda yakin ingin menutup aplikasi?",
    icon: path.join(process.env.APP_ROOT, "src/assets/images/logo.png"),
  });

  if (result.response === 1) {
    isQuitting = true;
    requestStopRecordBeforeQuit(win);
    setTimeout(() => app.quit(), 1500);
  }
});

ipcMain.handle("set-display-mode", async (_event, mode: "internal" | "clone" | "extend" | "external") => {
  if (process.platform !== "win32") {
    return { ok: false, message: "Fitur ini hanya tersedia di Windows" };
  }

  const arg = `/${mode}`;
  const exe = path.join(process.env.WINDIR || "C:\\Windows", "System32", "DisplaySwitch.exe");

  try {
    spawn(exe, [arg], { detached: true, stdio: "ignore" }).unref();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Gagal mengubah mode display" };
  }
});

ipcMain.handle("open-whiteboard", () => {
  openWhiteboard();
});

ipcMain.handle("open-zoom", () => {
  openZoom();
});

ipcMain.handle("open-wondercast", () => {
  openWonderCast();
});

ipcMain.handle("open-voicemeeter", () => {
  openVoicemeeter();
});

ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
