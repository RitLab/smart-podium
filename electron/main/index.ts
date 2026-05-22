import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  session,
  Menu,
  dialog,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { spawn } from "child_process";
import { update } from "./update";

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

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (
      details.url.includes("youtube.com") ||
      details.url.includes("ytimg.com")
    ) {
      details.requestHeaders["Referer"] = "https://www.youtube.com";
    }
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
