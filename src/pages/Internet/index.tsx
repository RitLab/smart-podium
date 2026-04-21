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
  Trash2 
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setFullScreen } from "@/stores/ui";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  isDefault?: boolean;
}

interface BrowserTab {
  id: string;
  url: string;
  inputUrl: string;
  isLanding: boolean;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading?: boolean;
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
  }, [tabId, onNavigationStateChange, onTitleChange, onLoadingChange, onEnterFullScreen, onLeaveFullScreen, webviewRefRegistry]);

  // We rely on Electron's native <webview src={url}> attribute change handling to navigate.

  return (
    <div
      className="absolute inset-0 bg-white"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        display: isActive ? "block" : "none",
      }}
    >
      <webview
        ref={webviewRef}
        src={url}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      />
    </div>
  );
};

const Internet = () => {
  const dispatch = useDispatch();
  const webviewRefs = useRef<Record<string, WebviewTag | null>>({});
  
  // State for Multi-Tabs
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: "initial-tab",
      url: "",
      inputUrl: "",
      isLanding: true,
      title: "Tab Baru",
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("initial-tab");
  const [isWebviewFullScreen, setIsWebviewFullScreen] = useState(false);

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
    // Reset full screen pas pindah halaman
    return () => {
      dispatch(setFullScreen(false));
    };
  }, [dispatch]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const isLanding = activeTab.isLanding;
  const canGoBack = activeTab.canGoBack || !isLanding;
  const canGoForward = activeTab.canGoForward;
  const inputUrl = activeTab.inputUrl;
  const isBookmarked = !isLanding && bookmarks.some(b => b.url === activeTab.url);

  const updateActiveTab = (updates: Partial<BrowserTab>) => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };

  const updateTab = (id: string, updates: Partial<BrowserTab>) => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === id ? { ...tab, ...updates } : tab
    ));
  };

  const handleNavigationStateChange = (id: string, url: string, canGoBack: boolean, canGoForward: boolean) => {
    updateTab(id, {
      url,
      inputUrl: url,
      canGoBack,
      canGoForward,
    });
  };

  const handleTitleChange = (id: string, title: string) => {
    updateTab(id, { title });
  };

  const handleLoadingChange = (id: string, isLoading: boolean) => {
    updateTab(id, { isLoading });
  };

  const handleEnterFullScreen = () => {
    setIsWebviewFullScreen(true);
    dispatch(setFullScreen(true));
  };

  const handleLeaveFullScreen = () => {
    setIsWebviewFullScreen(false);
    dispatch(setFullScreen(false));
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
    
    updateActiveTab({
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
      updateActiveTab({
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
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      url: initialUrl,
      inputUrl: initialUrl,
      isLanding: initialUrl === "",
      title: initialUrl ? "Loading..." : "Tab Baru",
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) {
      setTabs([
        {
          id: "initial-tab",
          url: "",
          inputUrl: "",
          isLanding: true,
          title: "Tab Baru",
          canGoBack: false,
          canGoForward: false,
          isLoading: false,
        }
      ]);
      setActiveTabId("initial-tab");
      return;
    }

    const tabIndex = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      const nextActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
      setActiveTabId(newTabs[nextActiveIndex].id);
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
    updateActiveTab({
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
        : "h-full rounded-3xl shadow-2xl border border-gray-100"
    }`}>
      {/* TAB BAR - Sembunyikan kalau lagi Full Screen */}
      {!isWebviewFullScreen && (
        <div className="bg-[#EDF2F7] px-4 pt-2.5 flex items-center gap-1 border-b border-gray-200 overflow-x-auto scrollbar-none shrink-0 select-none">
          <div className="flex items-end gap-1.5 overflow-x-auto scrollbar-none flex-1 max-w-full">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
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
        </div>
      )}

      {/* ADDRESS BAR - Sembunyikan kalau lagi Full Screen */}
      {!isWebviewFullScreen && (
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
              onChange={(e) => updateActiveTab({ inputUrl: e.target.value })}
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

      {/* BOOKMARKS BAR - Sembunyikan kalau lagi Full Screen */}
      {!isWebviewFullScreen && (
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
        {activeTab.isLanding ? (
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
                      type="text" 
                      placeholder="Apa yang ingin Anda cari hari ini?"
                      className="flex-1 px-4 py-4 text-xl outline-none text-gray-700 bg-white"
                      value={activeTab.inputUrl}
                      onChange={(e) => updateActiveTab({ inputUrl: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch(e.currentTarget.value);
                      }}
                    />
                    <button 
                      onClick={() => handleSearch(activeTab.inputUrl)}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
                    >
                      Search
                    </button>
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
        ) : (
          tabs.map((tab) => {
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
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Internet;
