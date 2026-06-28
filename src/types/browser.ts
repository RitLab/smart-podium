export interface BrowserTab {
  id: string;
  url: string;
  inputUrl: string;
  isLanding: boolean;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  isDefault?: boolean;
}
