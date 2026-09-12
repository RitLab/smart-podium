import { WebviewTag } from "electron";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Search, 
  Globe, 
  ShieldCheck, 
  Star, 
  Plus, 
  X, 
  BookOpen, 
  Trash2,
  Maximize2,
  Minimize2,
  Video
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFullScreen } from "@/stores/ui";
import type { AppDispatch, RootState } from "@/stores";
import type { BrowserTab, Bookmark } from "@/types/browser";
import {
  setActiveTabId,
  updateActiveTab,
  updateTab,
  addTab,
  closeTab,
  resetBrowser,
} from "@/stores/browser";

/**
 * Ubah apa pun yang diketik guru jadi URL join Google Meet.
 *
 * Guru bisa nempel link lengkap, atau ngetik kodenya aja, dan di layar sentuh
 * tanda hubungnya sering kelewat. Jadi terima semuanya: "abc-defg-hij",
 * "abcdefghij", "meet.google.com/abc-defg-hij", atau URL penuh dengan query.
 *
 * Sengaja NGGAK nerima meet.google.com/new — bikin rapat wajib login Google,
 * dan login di webview ini ditolak Google. Yang dilayani cuma GABUNG rapat,
 * karena cuma itu yang bisa jalan tanpa akun.
 */
export function urlGabungMeet(teks: string): string | null {
  const t = (teks || "").trim();
  if (!t) return null;

  // Ambil bagian kode dari URL kalau yang ditempel link
  let kode = t;
  const cocokUrl = t.match(/meet\.google\.com\/([^/?#\s]+)/i);
  if (cocokUrl) kode = cocokUrl[1];
  else if (/^https?:\/\//i.test(t)) return null; // URL lain, bukan Meet

  kode = kode.toLowerCase().replace(/[\s_]/g, "");
  if (kode === "new" || kode === "" ) return null;

  // Format resmi: 3-4-3 huruf. Terima yang udah ada tanda hubungnya,
  // atau 10 huruf polos yang tinggal dipasangin tanda hubung.
  if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(kode)) return `https://meet.google.com/${kode}`;
  const polos = kode.replace(/-/g, "");
  if (/^[a-z]{10}$/.test(polos)) {
    return `https://meet.google.com/${polos.slice(0, 3)}-${polos.slice(3, 7)}-${polos.slice(7)}`;
  }
  return null;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: "slms-syslink",
    title: "Syslink SLMS (Materi Pelajaran)",
    url: "https://slms.syslink.space/",
    isDefault: true,
  },
  {
    id: "google-classroom",
    title: "Google Classroom",
    url: "https://classroom.google.com",
    isDefault: true,
  },
  {
    id: "wikipedia",
    title: "Wikipedia",
    url: "https://wikipedia.org",
    isDefault: true,
  },
  {
    id: "khan-academy",
    title: "Khan Academy",
    url: "https://www.khanacademy.org",
    isDefault: true,
  }
];

interface WebviewContainerProps {
  tabId: string;
  url: string;
  isActive: boolean;
  onNavigationStateChange: (tabId: string, url: string, canGoBack: boolean, canGoForward: boolean) => void;
  onTitleChange: (tabId: string, title: string) => void;
  onLoadingChange: (tabId: string, isLoading: boolean) => void;
  onEnterFullScreen: () => void;
  onLeaveFullScreen: () => void;
  webviewRefRegistry: React.MutableRefObject<Record<string, WebviewTag | null>>;
  namaTamu?: string;
}

const WebviewContainer = ({
  tabId,
  url,
  isActive,
  onNavigationStateChange,
  onTitleChange,
  onLoadingChange,
  onEnterFullScreen,
  onLeaveFullScreen,
  webviewRefRegistry,
  namaTamu,
}: WebviewContainerProps) => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const lastLoadedUrlRef = useRef("");

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    webviewRefRegistry.current[tabId] = webview;

    const updateNavigation = () => {
      onNavigationStateChange(
        tabId,
        webview.getURL(),
        webview.canGoBack(),
        webview.canGoForward()
      );
    };

    const handleTitleUpdate = (e: any) => {
      if (e.title) {
        onTitleChange(tabId, e.title);
      }
    };

    const handleStartLoading = () => {
      onLoadingChange(tabId, true);
    };

    const handleStopLoading = () => {
      onLoadingChange(tabId, false);
    };

    // Di halaman tamu Meet, isiin nama guru kalau kolomnya masih kosong.
    // Podium itu layar sentuh — ngetik nama tiap mau gabung itu nyebelin.
    // Best-effort: kalau selector Google berubah, ya nggak ngapa-ngapain.
    const isiNamaTamu = () => {
      if (!namaTamu) return;
      const url = webview.getURL() || "";
      if (!/^https:\/\/meet\.google\.com\//i.test(url)) return;
      webview
        .executeJavaScript(
          `(() => {
            const nama = ${JSON.stringify(namaTamu)};
            const cari = () => document.querySelector(
              'input[aria-label*="name" i], input[aria-label*="nama" i], input[placeholder*="name" i], input[placeholder*="nama" i]'
            );
            let sisa = 20;
            const coba = () => {
              const el = cari();
              if (el && !el.value) {
                const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
                set.call(el, nama);
                el.dispatchEvent(new Event("input", { bubbles: true }));
              }
              if (!el && sisa-- > 0) setTimeout(coba, 500);
            };
            coba();
          })();`,
        )
        .catch(() => {});
    };
    webview.addEventListener("did-finish-load", isiNamaTamu);

    const handleFail = (e: any) => {
      if (e.errorCode === -3) return;
      console.error("Webview navigation failed:", e.errorDescription, e.url);
      onLoadingChange(tabId, false);
    };

    webview.addEventListener("did-finish-load", updateNavigation);
    webview.addEventListener("did-navigate", updateNavigation);
    webview.addEventListener("did-navigate-in-page", updateNavigation);
    webview.addEventListener("page-title-updated", handleTitleUpdate);
    webview.addEventListener("did-start-loading", handleStartLoading);
    webview.addEventListener("did-stop-loading", handleStopLoading);
    webview.addEventListener("did-fail-load", handleFail);
    webview.addEventListener("enter-html-full-screen", onEnterFullScreen);
    webview.addEventListener("leave-html-full-screen", onLeaveFullScreen);

    return () => {
      delete webviewRefRegistry.current[tabId];
      
      webview.removeEventListener("did-finish-load", isiNamaTamu);
      webview.removeEventListener("did-finish-load", updateNavigation);
      webview.removeEventListener("did-navigate", updateNavigation);
      webview.removeEventListener("did-navigate-in-page", updateNavigation);
      webview.removeEventListener("page-title-updated", handleTitleUpdate);
      webview.removeEventListener("did-start-loading", handleStartLoading);
      webview.removeEventListener("did-stop-loading", handleStopLoading);
      webview.removeEventListener("did-fail-load", handleFail);
      webview.removeEventListener("enter-html-full-screen", onEnterFullScreen);
      webview.removeEventListener("leave-html-full-screen", onLeaveFullScreen);
    };
  }, [tabId, onNavigationStateChange, onTitleChange, onLoadingChange, onEnterFullScreen, onLeaveFullScreen, webviewRefRegistry, namaTamu]);

  // We rely on Electron's native <webview src={url}> attribute change handling to navigate.

  return (
    <div
      className="absolute inset-0 bg-white"
      // JANGAN pakai display:none buat nyembunyiin tab nonaktif. Di Electron,
      // <webview> yang kena display:none bakal RELOAD halamannya begitu
      // ditampilkan lagi — diuji: penanda JS di halaman hilang setelah pindah
      // tab lalu balik. Itu yang bikin meeting Meet mati dan ngulang tiap ganti
      // tab. visibility:hidden nggak punya efek itu: guest tetep hidup dan
      // halamannya nggak disentuh. Semua tab ditumpuk di posisi yang sama,
      // yang aktif ditaruh paling atas dan yang lain dibikin nggak bisa diklik.
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        visibility: isActive ? "visible" : "hidden",
        pointerEvents: isActive ? "auto" : "none",
        zIndex: isActive ? 1 : 0,
      }}
    >
      <webview
        ref={webviewRef}
        src={url}
        allowFullScreen
        // Tanpa ini, popup dari halaman (window.open, target="_blank") diblokir
        // Electron sebelum sempat nyampe ke handler di main process. Handler di
        // sana yang mutusin popup-nya jadi tab baru, bukan jendela terpisah.
        //
        // Harus string, bukan boolean. React nggak kenal allowpopups sebagai
        // atribut boolean, jadi nilai `true` dibuang diam-diam dan atributnya
        // nggak pernah nyampe ke DOM — beda sama allowFullScreen yang memang
        // ada di daftar bawaan React. Tipe React-nya bilang boolean, makanya
        // dilewatin lewat spread.
        {...({ allowpopups: "true" } as Record<string, string>)}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      />
    </div>
  );
};

// `aktif` = rute /internet lagi kebuka. Komponen ini SENGAJA nggak pernah di-
// unmount (dirender permanen di MainLayout) supaya webview — dan meeting Meet di
// dalamnya — tetep hidup pas guru pindah ke Home/Kalender. Konsekuensinya, efek
// yang dulu ngandelin mount/unmount sekarang harus ngikut `aktif`.
const Internet = ({ aktif = true }: { aktif?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const webviewRefs = useRef<Record<string, WebviewTag | null>>({});
  const landingInputRef = useRef<HTMLInputElement>(null);
  
  // Browser state from Redux (persisted across menu switches)
  const { tabs, activeTabId } = useSelector((state: RootState) => state.browser);
  // Nama guru buat ngisi otomatis kolom nama di halaman tamu Meet. Diambil dari
  // jadwal hari ini — sumber yang sama yang dipakai navbar, jadi nggak perlu
  // state baru. Kalau nggak ada jadwal, prefill-nya dilewat aja.
  const headerEvents = useSelector((state: RootState) => state.calendar.headerEvents);
  // Ambil guru dari event yang BENAR-BENAR jalan sekarang, bukan event pertama
  // yang kebetulan punya nama. Sehari bisa diisi beberapa guru; find() polos
  // bakal ngisi nama yang salah di kolom nama tamu Meet.
  const namaGuru = (() => {
    const now = new Date();
    const hariIni = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");
    const punyaGuru = headerEvents.filter((e) => e.event_date === hariIni && e.teacher_name);
    const jalan = punyaGuru.filter((e) => e.start_time <= jam && e.end_time > jam);
    // Kelas belajar menang atas meeting kalau waktunya tumpang tindih — sama
    // kayak cara MainLayout milih activeEvent.
    const dipilih =
      jalan.find((e) => !e.is_meeting) ||
      jalan[0] ||
      punyaGuru.filter((e) => e.end_time <= jam).sort((a, b) => b.end_time.localeCompare(a.end_time))[0];
    return dipilih?.teacher_name || "";
  })();
  const [kodeMeet, setKodeMeet] = useState("");
  const [salahKodeMeet, setSalahKodeMeet] = useState(false);
  const [isWebviewFullScreen, setIsWebviewFullScreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // State for Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem("browser-bookmarks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
    return DEFAULT_BOOKMARKS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("browser-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    // Reset full screen pas pindah halaman. Dulu lewat cleanup unmount; sekarang
    // komponennya nggak pernah unmount, jadi dipicu waktu rute ninggalin /internet.
    if (aktif) return;
    setIsWebviewFullScreen(false);
    setIsMaximized(false);
    dispatch(setFullScreen(false));
  }, [aktif, dispatch]);

  // Escape key to force exit webview fullscreen or maximized mode
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isWebviewFullScreen) {
          const webview = webviewRefs.current[activeTabId];
          if (webview) {
            webview.executeJavaScript('if (document.fullscreenElement) { document.exitFullscreen(); }').catch(() => {});
          }
          setIsWebviewFullScreen(false);
          dispatch(setFullScreen(isMaximized));
        } else if (isMaximized) {
          setIsMaximized(false);
          dispatch(setFullScreen(false));
        }
      }
    };

    if (!aktif) return;
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [aktif, isWebviewFullScreen, isMaximized, activeTabId, dispatch]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || {
    id: "initial-tab",
    url: "",
    inputUrl: "",
    isLanding: true,
    title: "Tab Baru",
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
  } as BrowserTab;
  const isLanding = activeTab.isLanding;
  const canGoBack = activeTab.canGoBack || !isLanding;
  const canGoForward = activeTab.canGoForward;
  const inputUrl = activeTab.inputUrl;
  const isBookmarked = !isLanding && bookmarks.some(b => b.url === activeTab.url);

  // Auto-focus search input when landing page is loaded/active (especially when tab is closed)
  useEffect(() => {
    // Kalau nggak aktif, jangan nyuri fokus — halaman ini mounted terus di
    // belakang Home/Kalender, dan window.focus() di sini bakal ngerebut fokus.
    if (isLanding && aktif) {
      const timer = setTimeout(() => {
        // Safe check and blur current focused element to clean up any Electron webview stuck focus
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        // Force window to regain focus
        window.focus();
        // Set focus to the search input
        if (landingInputRef.current) {
          landingInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLanding, activeTabId]);

  // These now dispatch to Redux (persisted)
  const updateActiveTabLocal = (updates: Partial<BrowserTab>) => {
    dispatch(updateActiveTab(updates));
  };

  const updateTabLocal = (id: string, updates: Partial<BrowserTab>) => {
    dispatch(updateTab({ id, updates }));
  };

  const handleNavigationStateChange = (id: string, url: string, canGoBack: boolean, canGoForward: boolean) => {
    updateTabLocal(id, {
      url,
      inputUrl: url,
      canGoBack,
      canGoForward,
    });
  };

  const handleTitleChange = (id: string, title: string) => {
    updateTabLocal(id, { title });
  };

  const handleLoadingChange = (id: string, isLoading: boolean) => {
    updateTabLocal(id, { isLoading });
  };

  const handleEnterFullScreen = () => {
    setIsWebviewFullScreen(true);
    dispatch(setFullScreen(true));
  };

  const handleLeaveFullScreen = () => {
    setIsWebviewFullScreen(false);
    dispatch(setFullScreen(isMaximized));

    // Try to force exit inner HTML fullscreen (helps with YouTube etc.)
    const webview = webviewRefs.current[activeTabId];
    if (webview) {
      webview.executeJavaScript('if (document.fullscreenElement) { document.exitFullscreen(); }').catch(() => {});
    }
  };

  const gabungMeet = () => {
    const url = urlGabungMeet(kodeMeet);
    if (!url) { setSalahKodeMeet(true); return; }
    setSalahKodeMeet(false);
    setKodeMeet("");
    updateActiveTabLocal({ url, inputUrl: url, isLanding: false, title: "Google Meet" });
  };

  const handleSearch = (query: string) => {
    if (!query) return;
    
    let url = query.trim();
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes(".") && !url.includes(" ")) {
        url = `https://${url}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
    
    updateActiveTabLocal({
      url,
      inputUrl: url,
      isLanding: false,
      title: "Loading...",
    });
  };

  const handleBack = () => {
    if (isLanding) return;

    const webview = webviewRefs.current[activeTabId];
    if (webview && webview.canGoBack()) {
      webview.goBack();
    } else {
      updateActiveTabLocal({
        isLanding: true,
        url: "",
        inputUrl: "",
        title: "Tab Baru",
        canGoBack: false,
        canGoForward: false,
      });
    }
  };

  const handleForward = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  };

  const handleReload = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview) {
      webview.reload();
    }
  };

  const handleNewTab = (initialUrl = "") => {
    dispatch(addTab({ initialUrl }));
  };

  // Popup dari halaman di dalam webview (window.open, target="_blank")
  // dikirim main process ke sini supaya kebuka sebagai tab baru di tab bar
  // kita — perilaku yang sama kayak Chrome.
  useEffect(() => {
    const lepas = window.ipcRenderer.on("browser-open-tab", (_e, url: string) => {
      if (typeof url === "string" && /^https?:\/\//i.test(url)) {
        dispatch(addTab({ initialUrl: url }));
      }
    });
    return () => { if (typeof lepas === "function") lepas(); };
  }, [dispatch]);

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dispatch(closeTab(id));
  };

  // Klik kanan / tahan di tab -> menu native ala tab strip Chrome. Di layar
  // sentuh, tahan (long-press) juga micu onContextMenu, jadi cukup satu jalur.
  const handleTabContextMenu = async (tab: BrowserTab, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const aksi = await window.ipcRenderer.invoke("browser-tab-menu", {
      bisaTutup: tabs.length > 1,
      adaUrl: !tab.isLanding && !!tab.url,
    });
    switch (aksi) {
      case "tab-baru": dispatch(addTab({ initialUrl: "" })); break;
      case "duplikat": dispatch(addTab({ initialUrl: tab.url })); break;
      case "muat-ulang": webviewRefs.current[tab.id]?.reload(); break;
      case "tutup": dispatch(closeTab(tab.id)); break;
      default: break;
    }
  };

  const handleToggleBookmark = () => {
    if (isLanding) return;

    const url = activeTab.url;
    const isAlreadyBookmarked = bookmarks.some(b => b.url === url);

    if (isAlreadyBookmarked) {
      setBookmarks(prev => prev.filter(b => b.url !== url));
    } else {
      const title = activeTab.title || url;
      const newBookmark: Bookmark = {
        id: `bookmark-${Date.now()}`,
        title,
        url,
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const handleBookmarkClick = (url: string) => {
    updateActiveTabLocal({
      url,
      inputUrl: url,
      isLanding: false,
      title: "Loading...",
    });
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className={`w-full flex-col transition-all duration-300 flex overflow-hidden ${
      isWebviewFullScreen 
        ? "h-screen rounded-none border-0 fixed inset-0 z-[9999]" 
        : isMaximized
          ? "h-full rounded-none border-0 shadow-none"
          : "h-full rounded-3xl shadow-2xl border border-gray-100"
    }`}>
      {/* TAB BAR - Sembunyikan kalau lagi Full Screen / Maximized */}
      {!isWebviewFullScreen && !isMaximized && (
        <div className="bg-[#EDF2F7] px-4 pt-2.5 flex items-center gap-1 border-b border-gray-200 overflow-x-auto scrollbar-none shrink-0 select-none">
          <div className="flex items-end gap-1.5 overflow-x-auto scrollbar-none flex-1 max-w-full">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => dispatch(setActiveTabId(tab.id))}
                  onContextMenu={(e) => handleTabContextMenu(tab, e)}
                  className={`group relative flex items-center gap-2 pl-4 pr-10 py-2.5 text-xs font-semibold rounded-t-xl cursor-pointer transition-all duration-200 shrink-0 max-w-[160px] ${
                    isActive 
                      ? "bg-white text-blue-600 shadow-sm border-t border-x border-gray-200" 
                      : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-700"
                  }`}
                >
                  {tab.isLoading ? (
                    <RotateCw size={12} className="animate-spin text-blue-500" />
                  ) : tab.isLanding ? (
                    <Search size={12} className={isActive ? "text-blue-500" : "text-gray-400"} />
                  ) : (
                    <Globe size={12} className={isActive ? "text-blue-500" : "text-gray-400"} />
                  )}
                  
                  <span className="truncate max-w-[90px]">
                    {tab.title || "Tab Baru"}
                  </span>

                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleNewTab()}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors shrink-0 mb-1 active:scale-95"
            title="Buka Tab Baru"
          >
            <Plus size={16} />
          </button>

          {/* Bersihkan data browsing — tab + cookie + cache. Selain jaring
              pengaman, ini juga jalan keluar kalau Google nge-flag sesi gara-
              gara login gagal berkali-kali (state-nya nyimpen di cookie). */}
          <button
            onClick={async () => {
              if (!confirm("Bersihkan semua data browser? Ini menghapus tab, cookie, dan sesi login (mis. Google).")) return;
              await window.ipcRenderer.invoke("browser-clear-data");
              dispatch(resetBrowser());
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 mb-1 active:scale-95 ml-1"
            title="Bersihkan Data Browser (tab, cookie, sesi login)"
          >
            <Trash2 size={15} />
          </button>

          {/* Maximize Window button */}
          <button
            onClick={() => {
              const nextState = !isMaximized;
              setIsMaximized(nextState);
              dispatch(setFullScreen(nextState));
            }}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors shrink-0 mb-1 active:scale-95 ml-1"
            title={isMaximized ? "Pulihkan Ukuran Jendela" : "Maksimalkan Jendela"}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      )}

      {/* ADDRESS BAR - Sembunyikan kalau lagi Full Screen / Maximized */}
      {!isWebviewFullScreen && !isMaximized && (
        <div className="p-3 bg-white border-b flex items-center gap-4 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={isLanding}
              className={`p-2 rounded-full transition-all ${
                !isLanding
                  ? "bg-white text-gray-700 shadow-sm hover:bg-gray-100 active:scale-90" 
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleForward}
              disabled={!canGoForward || isLanding}
              className={`p-2 rounded-full transition-all ${
                canGoForward && !isLanding
                  ? "bg-white text-gray-700 shadow-sm hover:bg-gray-100 active:scale-90" 
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={handleReload}
            disabled={isLanding}
            className={`p-2 rounded-full transition-all ${
              isLanding ? "text-gray-300" : "bg-white text-gray-700 shadow-sm hover:bg-gray-100"
            }`}
          >
            <RotateCw size={18} />
          </button>

          <form 
            className="flex-1 relative group"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(inputUrl);
            }}
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {isLanding ? <Search size={16} /> : <Globe size={16} className="text-blue-500" />}
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => updateActiveTabLocal({ inputUrl: e.target.value })}
              placeholder="Ketik URL atau cari di Google..."
              className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
            />
            
            {!isLanding && (
              <button
                type="button"
                onClick={handleToggleBookmark}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors p-1"
                title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
              >
                <Star
                  size={16}
                  fill={isBookmarked ? "#EAB308" : "none"}
                  className={isBookmarked ? "text-yellow-500" : "text-gray-400 hover:scale-110"}
                />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100 shrink-0">
            <ShieldCheck size={14} />
            Safe
          </div>
        </div>
      )}

      {/* BOOKMARKS BAR - Sembunyikan kalau lagi Full Screen / Maximized */}
      {!isWebviewFullScreen && !isMaximized && (
        <div className="bg-white border-b px-6 py-2 flex items-center gap-3 text-xs text-gray-600 overflow-x-auto scrollbar-none shrink-0 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-1 font-bold text-gray-400 border-r pr-3 mr-1 shrink-0">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span>Bookmarks:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => handleBookmarkClick(bookmark.url)}
                className="px-3 py-1 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-full border border-gray-100 font-medium transition-all duration-200 active:scale-95 whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>{bookmark.title}</span>
              </button>
            ))}
            {bookmarks.length === 0 && (
              <span className="text-gray-400 italic">Belum ada bookmark. Klik bintang di address bar untuk menambahkan.</span>
            )}
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 relative bg-[#F8FAFC]">
        {/* Webview dirender SELALU, apa pun tab aktifnya. Dulu dibungkus
            `activeTab.isLanding ? landing : webview`, jadi begitu tab baru
            (landing) dibuka, SEMUA webview di-unmount dan meeting Meet yang
            lagi jalan di tab lain ikut mati. Landing sekarang jadi overlay di
            atas webview, bukan penggantinya. */}
        {tabs.map((tab) => {
            if (tab.isLanding) return null;
            return (
              <WebviewContainer
                key={tab.id}
                tabId={tab.id}
                url={tab.url}
                isActive={tab.id === activeTabId}
                onNavigationStateChange={handleNavigationStateChange}
                onTitleChange={handleTitleChange}
                onLoadingChange={handleLoadingChange}
                onEnterFullScreen={handleEnterFullScreen}
                onLeaveFullScreen={handleLeaveFullScreen}
                webviewRefRegistry={webviewRefs}
                namaTamu={namaGuru}
              />
            );
          })}
        {activeTab.isLanding && (
          <div className="absolute inset-0 z-10 flex flex-col min-h-0 overflow-auto">

          <div className="absolute inset-0 overflow-y-auto flex flex-col items-center p-6 md:py-16 animate-in fade-in zoom-in duration-500">
             <div className="w-full max-w-2xl flex flex-col justify-center min-h-full space-y-8 text-center">
                <div className="relative inline-block">
                   <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl"></div>
                   <h1 className="text-6xl font-black bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent relative">
                      SMART PODIUM
                   </h1>
                   <p className="text-gray-400 font-medium tracking-[0.3em] uppercase mt-2">Internal Browser System</p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center border border-gray-100">
                    <div className="pl-4 text-gray-400">
                      <Search size={24} />
                    </div>
                    <input 
                      ref={landingInputRef}
                      type="text" 
                      placeholder="Apa yang ingin Anda cari hari ini?"
                      className="flex-1 px-4 py-4 text-xl outline-none text-gray-700 bg-white"
                      value={activeTab.inputUrl}
                      onChange={(e) => updateActiveTabLocal({ inputUrl: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch(e.currentTarget.value);
                      }}
                    />
                    <button 
                      onClick={() => handleSearch(activeTab?.inputUrl || "")}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Gabung Google Meet sebagai TAMU — tanpa login.
                    Login akun Google di dalam webview ditolak Google
                    ("browser may not be secure"), dan itu kontrol keamanan
                    mereka yang nggak bisa diakalin dari sisi kita. Yang bisa
                    jalan cuma gabung anonim: meet.google.com/<kode> disajikan
                    tanpa cookie sama sekali, lengkap sama kolom nama dan
                    tombol "Ask to join". Makanya yang dilayani di sini cuma
                    GABUNG, bukan bikin rapat (meet.google.com/new wajib login). */}
                <div className="relative">
                  <div className="relative bg-white rounded-2xl shadow-lg p-5 border border-gray-100 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Video size={20} className="text-emerald-600" />
                      <span className="font-bold text-gray-700">Gabung Google Meet</span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        tanpa login
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={kodeMeet}
                        onChange={(e) => { setKodeMeet(e.target.value); setSalahKodeMeet(false); }}
                        onKeyDown={(e) => { if (e.key === "Enter") gabungMeet(); }}
                        placeholder="Kode rapat, mis. abc-defg-hij"
                        className={`flex-1 px-4 py-3 rounded-xl outline-none text-base border transition-colors ${
                          salahKodeMeet ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                      />
                      <button
                        onClick={gabungMeet}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shrink-0"
                      >
                        Gabung
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${salahKodeMeet ? "text-red-600" : "text-gray-400"}`}>
                      {salahKodeMeet
                        ? "Kode rapat belum benar. Formatnya 3-4-3 huruf, contoh: abc-defg-hij. Boleh juga tempel link Meet-nya."
                        : "Tempel link Meet atau ketik kodenya. Untuk MEMBUAT rapat baru, harus dari perangkat lain — bikin rapat wajib login Google."}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-8 pt-2">
                   {[
                     { label: "Google", url: "https://google.com" },
                     { label: "Wikipedia", url: "https://wikipedia.org" },
                     { label: "YouTube", url: "https://youtube.com" }
                   ].map((site) => (
                     <button 
                       key={site.label}
                       onClick={() => handleSearch(site.url)}
                       className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                     >
                       {site.label}
                     </button>
                   ))}
                </div>

                {/* Bookmark Cards Grid */}
                <div className="pt-6 text-left">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" />
                    Materi Pelajaran & Bookmarks
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {bookmarks.map((bookmark) => {
                      const initial = bookmark.title ? bookmark.title.charAt(0).toUpperCase() : "B";
                      const colors = [
                        "bg-blue-500 text-white",
                        "bg-emerald-500 text-white",
                        "bg-indigo-500 text-white",
                        "bg-purple-500 text-white",
                        "bg-pink-500 text-white",
                        "bg-amber-500 text-white"
                      ];
                      const colorIndex = bookmark.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                      const colorClass = colors[colorIndex];

                      return (
                        <div
                          key={bookmark.id}
                          onClick={() => handleBookmarkClick(bookmark.url)}
                          className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer flex items-center gap-4 hover:-translate-y-0.5"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner shrink-0 ${colorClass}`}>
                            {initial}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                              {bookmark.title}
                            </h3>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {bookmark.url}
                            </p>
                          </div>

                          {!bookmark.isDefault && (
                            <button
                              onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1 hover:bg-gray-50 rounded-lg"
                              title="Hapus Bookmark"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

             </div>
          </div>
          </div>
        )}
      </div>

      {/* Floating Restore Button when Maximized */}
      {isMaximized && !isWebviewFullScreen && (
        <button
          onClick={() => {
            setIsMaximized(false);
            dispatch(setFullScreen(false));
          }}
          className="fixed top-4 right-4 w-12 h-12 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-[9999] backdrop-blur-sm"
          title="Pulihkan Ukuran Jendela"
        >
          <Minimize2 size={20} />
        </button>
      )}
    </div>
  );
};

export default Internet;
