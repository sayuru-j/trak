/// <reference types="vite/client" />

interface Window {
  api?: {
    apiUrl: string;
    windowMinimize: () => void;
    windowMaximize: () => void;
    windowClose: () => void;
    onNavigate: (callback: (path: string) => void) => void;
  };
}
