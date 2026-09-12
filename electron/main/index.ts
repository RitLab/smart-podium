import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  session,
  Menu,
  dialog,
  desktopCapturer,
  clipboard,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { spawn } from "child_process";
import { update } from "./update";
import { susunMenuKonten, susunMenuTab, type AksiTab } from "./browserMenu";

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

  // ===== Supaya browser dalam aplikasi berperilaku kayak Chrome =====
  //
  // 1. User-Agent. Bawaan Electron nyelipin "smart-podium/x.y.z" dan
  //    "Electron/x.y.z" di UA. Beberapa layanan (Google Meet salah satunya)
  //    ngeliat itu terus nganggep browsernya nggak didukung dan matiin fitur.
  //    Dua token itu dibuang biar UA-nya kebaca sebagai Chrome biasa.
  const uaChrome = session.defaultSession
    .getUserAgent()
    .replace(/ smart-podium\/\S+/i, "")
    .replace(/ Electron\/\S+/, "");
  session.defaultSession.setUserAgent(uaChrome);

  // 1b. Client hints. Ini yang bikin Google Sign-In tetep nolak walau UA udah
  //     bersih: UA string bilang "Chrome/130", tapi navigator.userAgentData dan
  //     header Sec-CH-UA cuma ngaku "Chromium" tanpa brand "Google Chrome".
  //     Google ngebandingin keduanya, nggak cocok, terus nganggep browsernya
  //     nggak aman. Brand-nya disamain sama Chrome asli, versinya diambil dari
  //     Chromium yang emang dipakai Electron biar nggak pernah ketinggalan.
  //
  //     Yang dicek Google ternyata header HTTP-nya — diuji langsung: begitu
  //     header ini bener, halaman sign-in Google kebuka normal walau
  //     navigator.userAgentData di JS masih ngaku "Chromium" doang. Menimpa
  //     objek JS-nya sengaja nggak dilakukan: satu-satunya jalur (debugger
  //     protocol) bentrok sama DevTools dan nggak bisa diverifikasi.
  const versiChrome = process.versions.chrome;               // "130.0.6723.191"
  const mayorChrome = versiChrome.split(".")[0];             // "130"
  const platformHint =
    process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux";
  const secChUa = `"Chromium";v="${mayorChrome}", "Google Chrome";v="${mayorChrome}", "Not?A_Brand";v="99"`;
  const platformVersionHint = process.platform === "win32" ? "15.0.0" : process.platform === "darwin" ? "15.0.0" : "6.5.0";

  // 1c. Sisi JavaScript. Header doang nggak cukup buat Google Sign-In: setelah
  //     email dikirim, token BotGuard (JS Google) mem-fingerprint browser dari
  //     dalam halaman. Preload sesi ini nimpa navigator.userAgentData &
  //     window.chrome di dunia utama halaman biar konsisten sama Chrome asli.
  //     Lihat electron/preload/uaPatch.ts.
  session.defaultSession.setPreloads([path.join(__dirname, "../preload/uaPatch.cjs")]);

  // 2. Screen share. getDisplayMedia() di Electron nggak jalan sama sekali
  //    kalau handler ini nggak dipasang — makanya share screen di Google Meet
  //    gagal. Windows nggak punya picker bawaan dari Electron, jadi layar
  //    utama podium yang dipilih otomatis; buat podium itu memang yang
  //    dimau (yang di-share ya layar podiumnya). Audio loopback cuma ada di
  //    Windows, di platform lain dilewat biar nggak error.
  session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
    desktopCapturer
      .getSources({ types: ["screen"] })
      .then((sources) => {
        if (!sources.length) {
          callback({});
          return;
        }
        callback({
          video: sources[0],
          ...(process.platform === "win32" ? { audio: "loopback" as const } : {}),
        });
      })
      .catch(() => callback({}));
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (
      details.url.includes("youtube.com") ||
      details.url.includes("ytimg.com")
    ) {
      details.requestHeaders["Referer"] = "https://www.youtube.com";
    }
    // Client hints ala Chrome (lihat catatan di atas). Electron nggak ngirim
    // ini sama sekali, dan absennya pun udah jadi sinyal buat Google.
    details.requestHeaders["sec-ch-ua"] = secChUa;
    details.requestHeaders["sec-ch-ua-mobile"] = "?0";
    details.requestHeaders["sec-ch-ua-platform"] = `"${platformHint}"`;
    // Entropi tinggi — Google minta lewat Accept-CH setelah halaman pertama;
    // Chrome asli ngirim, Electron nggak. Absennya kebaca sebagai bukan Chrome.
    details.requestHeaders["sec-ch-ua-full-version"] = `"${versiChrome}"`;
    details.requestHeaders["sec-ch-ua-full-version-list"] =
      `"Chromium";v="${versiChrome}", "Google Chrome";v="${versiChrome}", "Not?A_Brand";v="99.0.0.0"`;
    details.requestHeaders["sec-ch-ua-platform-version"] = `"${platformVersionHint}"`;
    details.requestHeaders["sec-ch-ua-arch"] = `"x86"`;
    details.requestHeaders["sec-ch-ua-bitness"] = `"64"`;
    details.requestHeaders["sec-ch-ua-model"] = `""`;
    details.requestHeaders["sec-ch-ua-wow64"] = "?0";
    callback({ requestHeaders: details.requestHeaders });
  });

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

  // Klik kanan / tahan di TAB (tab strip). Renderer yang minta, main yang
  // munculin menu native, hasilnya dikembalikan sebagai string aksi.
  // Bersihin data browsing (cookie, cache, storage) di session default —
  // session yang dipakai webview browser dalam app. Ini yang bikin bisa pulih
  // kalau Google udah nge-flag sesi gara-gara percobaan login gagal berkali-
  // kali: state penolakannya nyimpen di cookie, jadi header doang nggak cukup.
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

  ipcMain.handle(
    "browser-tab-menu",
    (_e, opsi: { bisaTutup: boolean; adaUrl: boolean }) =>
      new Promise<AksiTab | null>((resolve) => {
        const menu = Menu.buildFromTemplate(susunMenuTab(opsi, resolve));
        menu.popup({ window: win ?? undefined, callback: () => resolve(null) });
      }),
  );

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
