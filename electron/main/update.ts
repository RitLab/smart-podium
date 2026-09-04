import { app, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater'

const GH_TOKEN = import.meta.env.VITE_GH_TOKEN;

const { autoUpdater } = createRequire(import.meta.url)('electron-updater');

export function update(win: Electron.BrowserWindow) {

  // When set to false, the update download will be triggered through the API
  autoUpdater.autoDownload = true
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = false

  autoUpdater.requestHeaders = { "Authorization": `token ${GH_TOKEN}` };

  // Podium nyala berhari-hari dan dulu pengecekan update CUMA jalan kalau
  // teknisi buka menu tersembunyi lalu tap "Cek Update". Akibatnya unit bisa
  // ketinggalan versi berbulan-bulan tanpa ada yang sadar, dan orang ngetes
  // pakai build lama. Sekarang dicek otomatis.
  //
  // Tapi autoDownload nyala dan quitAndInstall langsung nutup app, jadi kalau
  // dicek sembarangan update bisa motong rekaman di tengah kelas. Makanya ada
  // penanda sibuk dari renderer: selama kelas jalan, pengecekan dilewat dan
  // install yang terlanjur siap ditahan sampai kelasnya kelar.
  const CEK_AWAL_MS = 30 * 1000
  const CEK_BERKALA_MS = 30 * 60 * 1000

  let sedangDipakai = false
  let installTertunda = false

  const pasang = () => {
    // Parameter: (isSilent, isForceRunAfter)
    autoUpdater.quitAndInstall(true, true)
  }

  ipcMain.on('update-busy', (_e, busy: boolean) => {
    sedangDipakai = !!busy
    if (!sedangDipakai && installTertunda) {
      installTertunda = false
      pasang()
    }
  })

  autoUpdater.on('update-downloaded', () => {
    if (sedangDipakai) {
      installTertunda = true
      win.webContents.send('update-status', 'Pembaruan siap dipasang setelah kelas selesai.')
      return
    }
    pasang()
  })

  if (app.isPackaged) {
    const cekOtomatis = () => {
      if (sedangDipakai) return
      autoUpdater.checkForUpdates().catch(() => {
        // Diamkan: podium sering offline sesaat, dan pengecekan berikutnya
        // bakal jalan lagi. Error tetap dikirim lewat listener 'error'.
      })
    }
    setTimeout(cekOtomatis, CEK_AWAL_MS)
    setInterval(cekOtomatis, CEK_BERKALA_MS)
  }

  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update-status', 'Mengecek pembaruan sistem...')
  })
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    win.webContents.send('update-status', `Pembaruan v${info.version} tersedia. Mengunduh...`)
  })
  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-status', 'Sistem sudah versi terbaru.')
  })
  autoUpdater.on('error', (err: any) => {
    win.webContents.send('update-status', `Pembaruan gagal: ${err.message}`)
  })
  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    const percent = Math.floor(progress.percent)
    win.webContents.send('update-status', `Mengunduh pembaruan: ${percent}%`)
  })

  // // start check
  // autoUpdater.on('checking-for-update', function () { })
  // // update available
  // autoUpdater.on('update-available', (arg: UpdateInfo) => {
  //   win.webContents.send('update-can-available', { update: true, version: app.getVersion(), newVersion: arg?.version })
  // })
  // // update not available
  // autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
  //   win.webContents.send('update-can-available', { update: false, version: app.getVersion(), newVersion: arg?.version })
  // })

  let manualChecking = false;

  // Checking for updates
  ipcMain.handle('check-update', async () => {
    if (!app.isPackaged) {
      const error = new Error('The update feature is only available after the package.')
      return { message: error.message, error }
    }

    if (manualChecking) return { message: 'Sudah sedang mengecek...' };
    
    manualChecking = true;
    try {
      const result = await autoUpdater.checkForUpdatesAndNotify()
      return result;
    } catch (error) {
      return { message: 'Network error', error }
    } finally {
      // Tunggu sebentar sebelum boleh klik lagi
      setTimeout(() => { manualChecking = false }, 5000);
    }
  })

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
    
    // Opsional: Cek ulang setiap 1 jam
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 60 * 60 * 1000);
  }

  // Start downloading and feedback on progress
  ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send('update-error', { message: error.message, error })
        } else {
          // feedback update progress message
          event.sender.send('download-progress', progressInfo)
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send('update-downloaded')
      }
    )
  })

  // Install now
  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall(false, true)
  })
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void,
) {
  autoUpdater.on('download-progress', (info: ProgressInfo) => callback(null, info))
  autoUpdater.on('error', (error: Error) => callback(error, null))
  autoUpdater.on('update-downloaded', complete)
  autoUpdater.downloadUpdate()
}
