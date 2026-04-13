import { WebviewTag } from "electron";
import { ChevronLeft, ChevronRight, RotateCw, Search, Globe, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setFullScreen } from "@/stores/ui";

const Internet = () => {
  const dispatch = useDispatch();
  const webviewRef = useRef<WebviewTag | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  const [currentUrl, setCurrentUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [isLanding, setIsLanding] = useState(true);
  const [isWebviewFullScreen, setIsWebviewFullScreen] = useState(false);

  useEffect(() => {
    // Reset full screen pas pindah halaman
    return () => {
      dispatch(setFullScreen(false));
    };
  }, [dispatch]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const updateNavigation = () => {
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
      setInputUrl(webview.getURL());
    };

    const handleFail = (e: any) => {
      if (e.errorCode === -3) return;
      console.error("Webview navigation failed:", e.errorDescription, e.url);
    };

    const handleEnterFullScreen = () => {
      setIsWebviewFullScreen(true);
      dispatch(setFullScreen(true));
    };

    const handleLeaveFullScreen = () => {
      setIsWebviewFullScreen(false);
      dispatch(setFullScreen(false));
    };

    webview.addEventListener("did-finish-load", updateNavigation);
    webview.addEventListener("did-navigate", updateNavigation);
    webview.addEventListener("did-navigate-in-page", updateNavigation);
    webview.addEventListener("did-fail-load", handleFail);
    webview.addEventListener("enter-html-full-screen", handleEnterFullScreen);
    webview.addEventListener("leave-html-full-screen", handleLeaveFullScreen);

    return () => {
      webview.removeEventListener("did-finish-load", updateNavigation);
      webview.removeEventListener("did-navigate", updateNavigation);
      webview.removeEventListener("did-navigate-in-page", updateNavigation);
      webview.removeEventListener("did-fail-load", handleFail);
      webview.removeEventListener("enter-html-full-screen", handleEnterFullScreen);
      webview.removeEventListener("leave-html-full-screen", handleLeaveFullScreen);
    };
  }, [isLanding]);

  const handleSearch = (query: string) => {
    if (!query) return;
    
    let url = query.trim();
    // Jika tidak diawali protocol, anggap pencarian google atau tambahkan https
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes(".") && !url.includes(" ")) {
        url = `https://${url}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
    
    setCurrentUrl(url);
    setInputUrl(url);
    setIsLanding(false);
  };

  const handleBack = () => {
    const webview = webviewRef.current;
    if (webview?.canGoBack()) {
      webview.goBack();
    } else {
      // Jika sudah mentok di webview, balik ke landing page
      setIsLanding(true);
      setCurrentUrl("");
      setInputUrl("");
    }
  };

  const handleForward = () => webviewRef.current?.goForward();
  const handleReload = () => webviewRef.current?.reload();

  return (
    <div className={`w-full flex-col transition-all duration-300 flex overflow-hidden ${
      isWebviewFullScreen 
        ? "h-screen rounded-none border-0 fixed inset-0 z-[9999]" 
        : "h-full rounded-3xl shadow-2xl border border-gray-100"
    }`}>
      {/* ADDRESS BAR - Sembunyikan kalau lagi Full Screen */}
      {!isWebviewFullScreen && (
        <div className="p-3 bg-gray-50 border-b flex items-center gap-4 px-6 animate-in slide-in-from-top duration-300">
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
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Ketik URL atau cari di Google..."
              className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
            />
          </form>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
            <ShieldCheck size={14} />
            Safe
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 relative bg-[#F8FAFC]">
        {isLanding ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
             <div className="text-center space-y-8 max-w-2xl w-full">
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
                      autoFocus
                      placeholder="Apa yang ingin Anda cari hari ini?"
                      className="flex-1 px-4 py-4 text-xl outline-none text-gray-700"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch(e.currentTarget.value);
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Apa yang ingin Anda cari hari ini?"]') as HTMLInputElement;
                        handleSearch(input.value);
                      }}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-8 pt-4">
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
             </div>
          </div>
        ) : (
          <webview
            ref={webviewRef}
            src={currentUrl}
            className="w-full h-full bg-white"
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
};

export default Internet;
