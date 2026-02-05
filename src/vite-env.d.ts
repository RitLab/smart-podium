// /// <reference types="vite/client" />

// interface Window {
//   // expose in the `electron/preload/index.ts`
//   ipcRenderer: import('electron').IpcRenderer
// }

/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
  ipcRenderer: {
    // invoke mengembalikan Promise
    invoke: (channel: string, ...args: any[]) => Promise<any>
    
    // send tidak mengembalikan apa-apa
    send: (channel: string, ...args: any[]) => void
    
    // on mengembalikan fungsi cleanup (PENTING bedanya disini)
    on: (
      channel: string, 
      listener: (event: any, ...args: any[]) => void
    ) => () => void
    
    // off standar
    off: (
      channel: string, 
      listener: (event: any, ...args: any[]) => void
    ) => void
  }
}
