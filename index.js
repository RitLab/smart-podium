import { ipcMain as p, app as d, desktopCapturer as L, webContents as j, Menu as v, BrowserWindow as b, dialog as B, shell as O, session as H, clipboard as $ } from "electron";
import { createRequire as q } from "node:module";
import { fileURLToPath as N } from "node:url";
import h from "node:path";
import G from "node:os";
import { spawn as T } from "child_process";
const z = "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", { autoUpdater: c } = q(import.meta.url)("electron-updater");
function K(e) {
  c.autoDownload = !0, c.disableWebInstaller = !1, c.allowDowngrade = !1, c.requestHeaders = { Authorization: `token ${z}` };
  const n = 30 * 1e3, t = 30 * 60 * 1e3;
  let a = !1, r = !1;
  const o = () => {
    c.quitAndInstall(!0, !0);
  };
  if (p.on("update-busy", (i, m) => {
    a = !!m, !a && r && (r = !1, o());
  }), c.on("update-downloaded", () => {
    if (a) {
      r = !0, e.webContents.send("update-status", "Pembaruan siap dipasang setelah kelas selesai.");
      return;
    }
    o();
  }), d.isPackaged) {
    const i = () => {
      a || c.checkForUpdates().catch(() => {
      });
    };
    setTimeout(i, n), setInterval(i, t);
  }
  c.on("checking-for-update", () => {
    e.webContents.send("update-status", "Mengecek pembaruan sistem...");
  }), c.on("update-available", (i) => {
    e.webContents.send("update-status", `Pembaruan v${i.version} tersedia. Mengunduh...`);
  }), c.on("update-not-available", () => {
    e.webContents.send("update-status", "Sistem sudah versi terbaru.");
  }), c.on("error", (i) => {
    e.webContents.send("update-status", `Pembaruan gagal: ${i.message}`);
  }), c.on("download-progress", (i) => {
    const m = Math.floor(i.percent);
    e.webContents.send("update-status", `Mengunduh pembaruan: ${m}%`);
  });
  let s = !1;
  p.handle("check-update", async () => {
    if (!d.isPackaged) {
      const i = new Error("The update feature is only available after the package.");
      return { message: i.message, error: i };
    }
    if (s) return { message: "Sudah sedang mengecek..." };
    s = !0;
    try {
      return await c.checkForUpdatesAndNotify();
    } catch (i) {
      return { message: "Network error", error: i };
    } finally {
      setTimeout(() => {
        s = !1;
      }, 5e3);
    }
  }), d.isPackaged && (c.checkForUpdatesAndNotify(), setInterval(() => {
    c.checkForUpdatesAndNotify();
  }, 60 * 60 * 1e3)), p.handle("start-download", (i) => {
    V(
      (m, g) => {
        m ? i.sender.send("update-error", { message: m.message, error: m }) : i.sender.send("download-progress", g);
      },
      () => {
        i.sender.send("update-downloaded");
      }
    );
  }), p.handle("quit-and-install", () => {
    c.quitAndInstall(!1, !0);
  });
}
function V(e, n) {
  c.on("download-progress", (t) => e(null, t)), c.on("error", (t) => e(t, null)), c.on("update-downloaded", n), c.downloadUpdate();
}
const J = (e, n = 32) => {
  const t = e.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}, Z = (e) => `https://www.google.com/search?q=${encodeURIComponent(e.trim())}`;
function Q(e, n, t) {
  const a = [], r = () => {
    a.length && a[a.length - 1].type !== "separator" && a.push({ type: "separator" });
  };
  if (e.linkURL) {
    const o = e.linkURL;
    a.push({ label: "Buka tautan di tab baru", click: () => t.bukaTab(o) }), a.push({ label: "Salin alamat tautan", click: () => t.salinTeks(o) }), r();
  }
  if (e.mediaType === "image" && e.srcURL) {
    const o = e.srcURL;
    a.push({ label: "Buka gambar di tab baru", click: () => t.bukaTab(o) }), a.push({ label: "Salin alamat gambar", click: () => t.salinTeks(o) }), r();
  }
  if (e.isEditable) {
    const o = e.editFlags;
    a.push({ label: "Potong", enabled: !!(o != null && o.canCut), click: t.potong }), a.push({ label: "Salin", enabled: !!(o != null && o.canCopy), click: t.salin }), a.push({ label: "Tempel", enabled: !!(o != null && o.canPaste), click: t.tempel }), a.push({ label: "Pilih semua", enabled: o ? o.canSelectAll !== !1 : !0, click: t.pilihSemua }), r();
  } else if (e.selectionText && e.selectionText.trim()) {
    const o = e.selectionText;
    a.push({ label: "Salin", click: t.salin }), a.push({ label: `Cari Google untuk "${J(o)}"`, click: () => t.bukaTab(Z(o)) }), r();
  }
  return a.push({ label: "Kembali", enabled: n.canGoBack, click: t.kembali }), a.push({ label: "Maju", enabled: n.canGoForward, click: t.maju }), a.push({ label: "Muat ulang", click: t.muatUlang }), a;
}
function X(e, n) {
  return [
    { label: "Tab baru", click: () => n("tab-baru") },
    { label: "Muat ulang", enabled: e.adaUrl, click: () => n("muat-ulang") },
    { label: "Duplikat tab", enabled: e.adaUrl, click: () => n("duplikat") },
    { type: "separator" },
    { label: "Tutup tab", enabled: e.bisaTutup, click: () => n("tutup") }
  ];
}
const S = /* @__PURE__ */ new Map();
let Y = 0;
const ee = () => `bagi-${++Y}`, te = 900;
function ne(e) {
  return new Promise((n) => {
    let t = !1;
    const a = (o) => {
      t || (t = !0, n(o));
    }, r = setTimeout(() => a(null), te);
    e.capturePage().then((o) => {
      clearTimeout(r), a(o.isEmpty() ? null : o.resize({ width: 320 }).toDataURL());
    }).catch(() => {
      clearTimeout(r), a(null);
    });
  });
}
async function ae(e) {
  const n = j.getAllWebContents().filter((t) => {
    if (t.isDestroyed() || t.getType() !== "webview") return !1;
    if (!e) return !0;
    try {
      return t.mainFrame.processId !== e.processId || t.mainFrame.routingId !== e.routingId;
    } catch {
      return !0;
    }
  });
  return Promise.all(
    n.map(async (t) => {
      const a = await ne(t), r = (t.getTitle() || "").trim(), o = t.getURL() || "";
      let s = "";
      try {
        s = o ? new URL(o).host : "";
      } catch {
      }
      return {
        sumber: {
          kunci: `tab:${t.id}`,
          tipe: "tab",
          nama: r || s || "Tab",
          thumb: a,
          ikon: null
        },
        wc: t
      };
    })
  );
}
function oe(e, n) {
  p.on("share-picker-pilih", (t, a) => {
    const r = a != null && a.id ? S.get(a.id) : void 0;
    r && (S.delete(a.id), r.selesai(a.kunci ?? null));
  }), n.setDisplayMediaRequestHandler(async (t, a) => {
    let r = !1;
    const o = (i) => {
      r || (r = !0, a(i));
    }, s = () => {
      o({});
    };
    try {
      const i = t.frame ?? null, [m, g] = await Promise.all([
        L.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 320, height: 180 },
          fetchWindowIcons: !0
        }),
        ae(i)
      ]), A = /* @__PURE__ */ new Map(), k = [];
      for (const u of m) {
        const R = u.id.startsWith("screen:") ? "layar" : "jendela";
        R === "jendela" && !(u.name || "").trim() || (A.set(u.id, u), k.push({
          kunci: u.id,
          tipe: R,
          nama: R === "layar" ? u.name || "Seluruh Layar" : u.name,
          thumb: u.thumbnail && !u.thumbnail.isEmpty() ? u.thumbnail.toDataURL() : null,
          ikon: u.appIcon && !u.appIcon.isEmpty() ? u.appIcon.resize({ width: 32 }).toDataURL() : null
        }));
      }
      const _ = /* @__PURE__ */ new Map();
      for (const u of g)
        _.set(u.sumber.kunci, u.wc), k.push(u.sumber);
      if (k.length === 0) {
        s();
        return;
      }
      const P = e();
      if (!P || P.isDestroyed()) {
        s();
        return;
      }
      const I = ee(), y = await new Promise((u) => {
        S.set(I, { selesai: u }), P.webContents.send("share-picker-buka", { id: I, sumber: k });
      });
      if (!y) {
        s();
        return;
      }
      if (y.startsWith("tab:")) {
        const u = _.get(y);
        if (!u || u.isDestroyed()) {
          s();
          return;
        }
        o({ video: u.mainFrame });
        return;
      }
      const U = A.get(y);
      if (!U) {
        s();
        return;
      }
      o({ video: U });
    } catch {
      s();
    }
  });
}
const f = process.env.VITE_DEV_SERVER_URL, se = "persist:browser";
f && d.commandLine.appendSwitch("ignore-certificate-errors");
q(import.meta.url);
const D = h.dirname(N(import.meta.url));
process.env.APP_ROOT = h.join(D, "../..");
const fe = h.join(process.env.APP_ROOT, "dist-electron"), x = h.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = f ? h.join(process.env.APP_ROOT, "public") : x;
G.release().startsWith("6.1") && d.disableHardwareAcceleration();
process.platform === "win32" && d.setAppUserModelId(d.getName());
d.requestSingleInstanceLock() || (d.quit(), process.exit(0));
let l = null, w = !1;
const E = h.join(D, "../preload/index.mjs"), M = h.join(x, "index.html");
function C(e) {
  (e ? [e] : b.getAllWindows()).forEach((t) => {
    try {
      t.webContents.send("request-stop-record-before-quit");
    } catch {
    }
  });
}
function re() {
  const e = "C:\\Program Files (x86)\\Whiteboard_6.4.12.6402\\Main\\Whiteboard.exe";
  try {
    T(e, [], {
      detached: !0,
      stdio: "ignore"
    }).unref();
  } catch (n) {
    console.error("Failed to open Whiteboard:", n);
  }
}
function ie() {
  const e = "C:\\Users\\Smartclass\\AppData\\Roaming\\Zoom\\bin\\Zoom.exe";
  try {
    T(e, [], {
      detached: !0,
      stdio: "ignore"
    }).unref();
  } catch (n) {
    console.error("Failed to open Zoom:", n);
  }
}
function le() {
  const e = "C:\\Program Files (x86)\\WonderCast\\WonderCast.exe";
  try {
    T(e, [], {
      detached: !0,
      stdio: "ignore"
    }).unref();
  } catch (n) {
    console.error("Failed to open WonderCast:", n);
  }
}
let W = !1;
function ue() {
  if (W) return;
  W = !0;
  const e = H.fromPartition(se), t = process.versions.chrome.split(".")[0], a = process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux", r = e.getUserAgent().replace(/ smart-podium\/\S+/i, "").replace(/ Electron\/\S+/, "");
  e.setUserAgent(r);
  const o = `"Chromium";v="${t}", "Google Chrome";v="${t}", "Not?A_Brand";v="99"`;
  oe(() => l, e), e.webRequest.onBeforeSendHeaders((s, i) => {
    (s.url.includes("youtube.com") || s.url.includes("ytimg.com")) && (s.requestHeaders.Referer = "https://www.youtube.com"), s.requestHeaders["sec-ch-ua"] = o, s.requestHeaders["sec-ch-ua-mobile"] = "?0", s.requestHeaders["sec-ch-ua-platform"] = `"${a}"`, i({ requestHeaders: s.requestHeaders });
  }), p.handle("browser-clear-data", async () => {
    try {
      return await e.clearStorageData({
        storages: ["cookies", "localstorage", "indexdb", "websql", "serviceworkers", "cachestorage"]
      }), await e.clearCache(), { ok: !0 };
    } catch (s) {
      return { ok: !1, error: String((s == null ? void 0 : s.message) || s) };
    }
  }), p.handle(
    "browser-tab-menu",
    (s, i) => new Promise((m) => {
      v.buildFromTemplate(X(i, m)).popup({ window: l ?? void 0, callback: () => m(null) });
    })
  );
}
async function F() {
  l = new b({
    title: "Main window",
    icon: h.join(process.env.VITE_PUBLIC, "favicon.ico"),
    fullscreen: !0,
    webPreferences: {
      preload: E,
      webviewTag: !0
    }
  }), ue(), process.platform !== "darwin" && l.on("close", (e) => {
    w || (e.preventDefault(), w = !0, C(l), setTimeout(() => {
      d.quit();
    }, 1500));
  }), f ? (l.loadURL(f), l.webContents.openDevTools()) : l.loadFile(M), l.webContents.on("did-finish-load", () => {
    l == null || l.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), l.webContents.setWindowOpenHandler(({ url: e }) => (e.startsWith("https:") && O.openExternal(e), { action: "deny" })), l.webContents.on("did-attach-webview", (e, n) => {
    const t = (a) => {
      /^https?:\/\//i.test(a) && (l == null || l.webContents.send("browser-open-tab", a));
    };
    n.setWindowOpenHandler(({ url: a }) => (t(a), { action: "deny" })), n.on("context-menu", (a, r) => {
      const o = Q(
        r,
        { canGoBack: n.canGoBack(), canGoForward: n.canGoForward() },
        {
          bukaTab: t,
          salinTeks: (s) => $.writeText(s),
          potong: () => n.cut(),
          salin: () => n.copy(),
          tempel: () => n.paste(),
          pilihSemua: () => n.selectAll(),
          kembali: () => n.goBack(),
          maju: () => n.goForward(),
          muatUlang: () => n.reload()
        }
      );
      v.buildFromTemplate(o).popup({ window: l ?? void 0 });
    });
  }), K(l);
}
d.whenReady().then(() => {
  v.setApplicationMenu(null), F();
});
d.on("before-quit", (e) => {
  w || (e.preventDefault(), w = !0, C(), setTimeout(() => d.quit(), 1500));
});
d.on("window-all-closed", () => {
  l = null, process.platform !== "darwin" && d.quit();
});
d.on("second-instance", () => {
  l && (l.isMinimized() && l.restore(), l.focus());
});
d.on("activate", () => {
  const e = b.getAllWindows();
  e.length ? e[0].focus() : F();
});
p.handle("minimize-window", () => {
  const e = b.getFocusedWindow();
  e && e.minimize();
});
p.handle("close-window", (e) => {
  const n = b.fromWebContents(e.sender) ?? b.getFocusedWindow();
  w = !0, C(n), setTimeout(() => d.quit(), 1500);
});
p.handle("show-quit-dialog", async (e) => {
  const n = b.fromWebContents(e.sender);
  if (!n) return;
  (await B.showMessageBox(n, {
    type: "question",
    buttons: ["Batal", "Ya, Tutup"],
    defaultId: 1,
    title: "Konfirmasi",
    message: "Apakah Anda yakin ingin menutup aplikasi?",
    icon: h.join(process.env.APP_ROOT, "src/assets/images/logo.png")
  })).response === 1 && (w = !0, C(n), setTimeout(() => d.quit(), 1500));
});
p.handle("set-display-mode", async (e, n) => {
  if (process.platform !== "win32")
    return { ok: !1, message: "Fitur ini hanya tersedia di Windows" };
  const t = `/${n}`, a = h.join(process.env.WINDIR || "C:\\Windows", "System32", "DisplaySwitch.exe");
  try {
    return T(a, [t], { detached: !0, stdio: "ignore" }).unref(), { ok: !0 };
  } catch (r) {
    return { ok: !1, message: (r == null ? void 0 : r.message) || "Gagal mengubah mode display" };
  }
});
p.handle("open-whiteboard", () => {
  re();
});
p.handle("open-zoom", () => {
  ie();
});
p.handle("open-wondercast", () => {
  le();
});
p.handle("open-win", (e, n) => {
  const t = new b({
    webPreferences: {
      preload: E,
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  f ? t.loadURL(`${f}#${n}`) : t.loadFile(M, { hash: n });
});
export {
  fe as MAIN_DIST,
  se as PARTISI_BROWSER,
  x as RENDERER_DIST,
  f as VITE_DEV_SERVER_URL
};
