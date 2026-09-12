// Preload SESI (session.setPreloads) — jalan di tiap renderer di session default,
// termasuk webview browser dalam app. Tugasnya satu: bikin halaman ngeliat
// lingkungan JS yang sama kayak Chrome asli.
//
// Kenapa perlu: header UA & Sec-CH-UA udah bener, tapi Google Sign-In masih
// nolak SETELAH email dikirim — bahkan di profil bersih. Pengiriman email bawa
// token BotGuard, JS Google yang mem-fingerprint browser dari dalam halaman.
// Dari sisi JS, navigator.userAgentData Electron cuma ngaku "Chromium" tanpa
// brand "Google Chrome", nggak konsisten sama UA string — itu yang ketangkep.
//
// Kenapa lewat webFrame.executeJavaScript: preload hidup di dunia terisolasi,
// jadi nimpa navigator di sini nggak kelihatan sama halaman. executeJavaScript
// jalan di DUNIA UTAMA halaman, dan karena preload dieksekusi sebelum skrip
// halaman, patch-nya udah kepasang waktu BotGuard mulai ngintip.
import { webFrame } from "electron";

const full = process.versions.chrome;            // mis. "130.0.6723.191"
const mayor = full.split(".")[0];
const platform =
  process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux";
const platformVersion = process.platform === "win32" ? "15.0.0" : process.platform === "darwin" ? "15.0.0" : "6.5.0";

const kode = `
(() => {
  const brands = [
    { brand: "Chromium", version: "${mayor}" },
    { brand: "Google Chrome", version: "${mayor}" },
    { brand: "Not?A_Brand", version: "99" },
  ];
  const full = "${full}", platform = "${platform}";
  const tinggi = {
    brands, mobile: false, platform,
    architecture: "x86", bitness: "64", model: "", platformVersion: "${platformVersion}",
    uaFullVersion: full, wow64: false, formFactors: ["Desktop"],
    fullVersionList: brands.map(b => ({ brand: b.brand, version: b.brand === "Not?A_Brand" ? "99.0.0.0" : full })),
  };
  const uad = {
    brands, mobile: false, platform,
    getHighEntropyValues: (hints) => Promise.resolve(
      Object.fromEntries(Object.entries(tinggi).filter(([k]) => ["brands","mobile","platform"].includes(k) || (hints || []).includes(k)))
    ),
    toJSON: () => ({ brands, mobile: false, platform }),
  };
  Object.defineProperty(uad, Symbol.toStringTag, { value: "NavigatorUAData" });
  try { Object.defineProperty(Navigator.prototype, "userAgentData", { get: () => uad, configurable: true }); } catch {}

  // window.chrome ala Chrome biasa: app, csi, loadTimes, runtime (stub aman).
  const c = window.chrome || (window.chrome = {});
  if (!c.app) c.app = { isInstalled: false, InstallState: { DISABLED: "disabled", INSTALLED: "installed", NOT_INSTALLED: "not_installed" }, RunningState: { CANNOT_RUN: "cannot_run", READY_TO_RUN: "ready_to_run", RUNNING: "running" }, getDetails: () => null, getIsInstalled: () => false, runningState: () => "cannot_run" };
  if (!c.csi) c.csi = () => ({ startE: Date.now(), onloadT: Date.now(), pageT: performance.now(), tran: 15 });
  if (!c.loadTimes) c.loadTimes = () => ({ requestTime: Date.now() / 1000, startLoadTime: Date.now() / 1000, commitLoadTime: Date.now() / 1000, finishDocumentLoadTime: Date.now() / 1000, finishLoadTime: Date.now() / 1000, firstPaintTime: Date.now() / 1000, firstPaintAfterLoadTime: 0, navigationType: "Other", wasFetchedViaSpdy: true, wasNpnNegotiated: true, npnNegotiatedProtocol: "h2", wasAlternateProtocolAvailable: false, connectionInfo: "h2" });
  if (!c.runtime) c.runtime = { id: undefined, connect: () => { throw new Error("chrome.runtime.connect is not available"); }, sendMessage: () => { throw new Error("chrome.runtime.sendMessage is not available"); } };
})();
`;
try { webFrame.executeJavaScript(kode).catch(() => {}); } catch { /* biarin, bukan fatal */ }
