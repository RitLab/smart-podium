import { WebviewTag } from "electron";
import { useEffect, useRef, useState } from "react";

const Internet = () => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    webview.addEventListener("did-finish-load", () => {
      console.log("webview loaded google");
    });

    const updateNavigation = () => {
      setCanGoBack(webview.canGoBack());
    };

    webview.addEventListener("did-finish-load", updateNavigation);
    webview.addEventListener("did-navigate", updateNavigation);
    webview.addEventListener("did-navigate-in-page", updateNavigation);

    return () => {
      webview.removeEventListener("did-finish-load", updateNavigation);
      webview.removeEventListener("did-navigate", updateNavigation);
      webview.removeEventListener("did-navigate-in-page", updateNavigation);
    };
  }, []);

  const handleBack = () => {
    const webview = webviewRef.current;
    if (webview?.canGoBack()) {
      webview.goBack();
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-md shadow-md overflow-hidden">
      <div className="p-2 border-b">
        <button onClick={handleBack} disabled={!canGoBack}>
          Back
        </button>
      </div>
      <webview
        ref={webviewRef}
        src="https://www.google.com"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default Internet;
