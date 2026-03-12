import { app, BrowserWindow, shell, ipcMain, session, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { spawn } from "child_process";
import { update } from "./update";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

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

const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

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
  Menu.setApplicationMenu(null)
  createWindow();
});

// ===============================
// APP EVENTS
// ===============================
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
ipcMain.handle("open-whiteboard", () => {
  openWhiteboard();
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
