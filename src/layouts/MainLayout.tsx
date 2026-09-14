import { CheckCircle2, Clock9, Eye, EyeOff, LogOut, Timer } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router";

import bgImage from "@/assets/images/bg-solid.png";
import Logo from "@/assets/images/logo.png";
import {
  BookIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
  WebIcon,
  WhiteboardIcon,
  ZoomIcon,
  VoicemeeterIcon
} from "@/components/Icon";
import { Image } from "@/components/Image";
import Loading from "@/components/Loading";
import { formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth";
import { fetchHeaderEvents } from "@/stores/calendar";
import { stopRecord, clearRecordingOnly, resetStoppedSession, setShowSummary, setShowStopConfirm, setFinishedEvent } from "@/stores/record";
import { beginNewBrowserSession, resetBrowser } from "@/stores/browser";
import RecorderComponents from "@/components/Recorder";
import { eventService } from "@/services/event";
import type { EventDetail, EventRecordStatus } from "@/types/event";
import { isLockedByTwinRoom } from "@/utils/joinClassRoom";

/* =====================================================
   TOAST CONTEXT
===================================================== */

import { useToast } from "@/components/ToastProvider";
import Internet from "@/pages/Internet";
import SharePicker from "@/components/SharePicker";
import { useRuangSekarang } from "@/hooks/useRuangSekarang";
import PagarGalat from "@/components/PagarGalat";

/* =====================================================
   MENUS
===================================================== */

type MenuAccess = "always" | "lesson_plus_15" | "lesson_only";

type MenuItem = {
  label: string;
  icon: any;
  color: keyof typeof colorMap;
  path?: string;
  action?: "whiteboard" | "minimize" | "zoom" | "wondercast" | "voicemeeter";
  access: MenuAccess;
};

const menus: MenuItem[] = [
  {
    path: "/calendar",
    label: "Kalender Akademik",
    icon: CalendarIcon,
    color: "blue",
    access: "always",
  },
  {
    path: "/student",
    label: "Manajemen Peserta Didik",
    icon: UsersIcon,
    color: "green",
    access: "lesson_plus_15",
  },

  {
    path: "/internet",
    label: "Penampil Web",
    icon: WebIcon,
    color: "red",
    access: "lesson_only",
  },
  {
    action: "whiteboard",
    label: "Whiteboard",
    icon: WhiteboardIcon,
    color: "green",
    access: "lesson_only",
  },
  {
    action: "zoom" as const,
    label: "Zoom",
    icon: ZoomIcon,
    color: "blue" as const,
    access: "lesson_only",
  },
  {
    action: "voicemeeter" as const,
    label: "VB Voicemeeter",
    icon: VoicemeeterIcon,
    color: "green" as const,
    // Sengaja "always", sejajar sama Kalender. Setup mikrofon justru dilakuin
    // pas nggak ada kelas, jadi ngunci ini di lesson_only bikin teknisi nggak
    // bisa nyiapin audio sebelum jadwal jalan.
    //
    // Konsekuensinya podium yang kekunci kelas gabungan juga bisa mengklik ini,
    // dan itu MEMANG BOLEH — udah dikonfirmasi. Jadi jangan ditambahin
    // pengecualian isLockedByTwin di sini ngira ini kebocoran.
    access: "always",
  },
];

const colorMap = {
  blue: {
    active: "from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-800",
    inactive: "from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100",
    iconActive: "text-white",
    iconInactive: "text-blue-600",
  },
  green: {
    active:
      "from-green-500 to-green-600 hover:from-green-700 hover:to-green-800",
    inactive: "from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100",
    iconActive: "text-white",
    iconInactive: "text-green-600",
  },
  yellow: {
    active:
      "from-yellow-500 to-yellow-600 hover:from-yellow-700 hover:to-yellow-800",
    inactive:
      "from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-yellow-100",
    iconActive: "text-white",
    iconInactive: "text-yellow-600",
  },
  red: {
    active: "from-red-500 to-red-600 hover:from-red-700 hover:to-red-800",
    inactive: "from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100",
    iconActive: "text-white",
    iconInactive: "text-red-600",
  },
} as const;

/* =====================================================
   NAVBAR
===================================================== */
const Navbar = React.memo(({ time, activeEvent, isStarted, isLessonActive, countdown, hasStoppedSession, graceCountdown }: any) => {
  return (
    <header className="flex items-center justify-between relative">
      <img src={Logo} alt="Logo" className="h-28 w-96 object-contain" />

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-white shadow-md rounded-md p-4">
          <Image
            src={activeEvent?.teacher_image}
            alt={activeEvent?.teacher_name}
            className="h-14 w-14"
          />
          <div className="mx-3">
            <h3 className="font-semibold text-gray-900">
              {activeEvent?.teacher_name || (activeEvent?.is_meeting ? "Meeting" : "Tidak ada jadwal")}
            </h3>
            <p className="text-sm text-gray-600">{activeEvent?.course_name || activeEvent?.title || "Cek kalender"}</p>
          </div>
        </div>

        <div className="flex bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-md shadow-md">
          <div className="p-4 border-r border-white/30">
            <p className="text-sm">{formattedDate(time)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock9 size={16} />
              <span className="text-lg font-bold">{formattedTime(time)}</span>
            </div>
          </div>

          <div className="p-4 min-w-[120px]">
            <p className="text-sm">
              {hasStoppedSession ? "Waktu Jeda" : isLessonActive ? "Sisa Waktu" : "Mulai Dalam"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock9 size={16} className={hasStoppedSession ? "text-orange-400" : "text-white"} />
              <span className={`text-lg font-bold tabular-nums ${hasStoppedSession ? "text-orange-400" : "text-white"}`}>
                {hasStoppedSession ? graceCountdown : countdown}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

/* =====================================================
   SIDEBAR
===================================================== */

type SidebarProps = {
  isLessonActive: boolean;
  isLessonOrGrace: boolean;
  isRecording: boolean;
  hasStoppedSession: boolean;
  stoppedAt: number | null;
};

const Sidebar = React.memo(({ isLessonActive, isLessonOrGrace, isRecording, hasStoppedSession, stoppedAt }: SidebarProps) => {
  const location = useLocation();
  const { showToast } = useToast();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const openWhiteboard = () => {
    window.ipcRenderer.invoke("open-whiteboard");
  };

  const openZoom = () => {
    window.ipcRenderer.invoke('open-zoom');
  };

  const openVoicemeeter = () => {
    window.ipcRenderer.invoke("open-voicemeeter");
  };

  const minimizeApp = () => {
    window.ipcRenderer.invoke("minimize-window");
  };

  const togglePrivacyMode = async () => {
    const next = !isPrivacyMode;
    const mode = next ? "internal" : "clone";
    const res = await window.ipcRenderer.invoke("set-display-mode", mode);
    if (res?.ok) {
      setIsPrivacyMode(next);
      showToast(next ? "Screen share dimatikan" : "Screen share dinyalakan", "info");
      return;
    }
    showToast(res?.message || "Gagal mengubah mode display", "error");
  };

  // Sama kayak di Home: di ruang yang Voicemeeter-nya nggak kepasang, ikonnya
  // DIMATIIN, bukan dihilangin. Lihat src/utils/ruangKelas.ts.
  const { adaVoicemeeter } = useRuangSekarang();

  const isMenuEnabled = (access: MenuAccess): boolean => {
    if (isRecording) return true;

    if (hasStoppedSession && stoppedAt) {
      const graceEndLocal = stoppedAt + 15 * 60 * 1000;
      const isWithinGrace = Date.now() < graceEndLocal;

      if (access === "always") return true;
      if (access === "lesson_plus_15") return isWithinGrace;
      return false;
    }

    return access === "always";
  };

  return (
    <aside className="flex flex-col h-full">
      <div className="w-20 flex-1 flex flex-col items-center py-6 gap-6 bg-white shadow-lg rounded-l-2xl">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const color = colorMap[menu.color];
          const kepasang = menu.action !== "voicemeeter" || adaVoicemeeter;
          const enabled = isMenuEnabled(menu.access) && kepasang;
          const alasanMati = !kepasang
            ? "Voicemeeter nggak terpasang di ruang ini"
            : "Tidak tersedia di luar jadwal pelajaran";

          const disabledWrapper = (child: React.ReactNode) => (
            <div
              key={menu.label}
              className="opacity-30 grayscale cursor-not-allowed"
              title={alasanMati}
            >
              {child}
            </div>
          );

          const iconEl = (
            <div
              className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${color.inactive}`}
            >
              <Icon width={24} height={24} className={color.iconInactive} />
            </div>
          );

          if ("action" in menu) {
            if (menu.action === "whiteboard") {
              if (!enabled) return disabledWrapper(iconEl);
              return (
                <button key={menu.label} type="button" onClick={openWhiteboard}>
                  {iconEl}
                </button>
              );
            }

            if (menu.action === "zoom") {
              if (!enabled) return disabledWrapper(iconEl);
              return (
                <button key={menu.label} type="button" onClick={openZoom}>
                  {iconEl}
                </button>
              );
            }

            if (menu.action === "voicemeeter") {
              if (!enabled) return disabledWrapper(iconEl);
              return (
                <button key={menu.label} type="button" onClick={openVoicemeeter}>
                  {iconEl}
                </button>
              );
            }

            if (menu.action === "minimize") {
              return (
                <button key={menu.label} type="button" onClick={minimizeApp}>
                  {iconEl}
                </button>
              );
            }
          }

          const isActive = location.pathname === menu.path;
          const activeIconEl = (
            <div
              className={`h-12 w-12 flex items-center justify-center rounded-lg transition ${isActive ? color.active : color.inactive} bg-gradient-to-b`}
            >
              <Icon
                width={24}
                height={24}
                className={isActive ? color.iconActive : color.iconInactive}
              />
            </div>
          );

          if (!enabled) return disabledWrapper(activeIconEl);

          return (
            <NavLink key={menu.path} to={menu.path!}>
              {activeIconEl}
            </NavLink>
          );
        })}

        <div className="mt-auto flex flex-col gap-4 items-center">
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? "Nyalakan screen share" : "Matikan screen share"}
            className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${
              isPrivacyMode ? "from-red-500 to-red-600" : "from-gray-50 to-gray-100"
            }`}
          >
            {isPrivacyMode ? (
              <EyeOff width={22} height={22} className="text-white" />
            ) : (
              <Eye width={22} height={22} className="text-gray-700" />
            )}
          </button>
          <NavLink to="/home">
            <HomeIcon width={24} height={24} className="text-orange-600" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
});

/* =====================================================
   MAIN LAYOUT CORE
===================================================== */

/**
 * Penampil Web dirender PERMANEN lewat lapisan ini, bukan lewat rute.
 *
 * Kenapa nggak lewat rute: pindah ke Home bikin komponennya unmount, webview-nya
 * hancur, dan meeting Meet yang lagi jalan ikut mati. Kenapa nggak cukup ditaruh
 * di dalam <main>: MainLayout ngerender DUA pohon berbeda (cabang isHome nggak
 * punya <main> sama sekali), dan React nggak mempertahankan instance lintas
 * struktur induk yang beda. Makanya lapisan ini jadi ANAK PERTAMA Fragment di
 * KEDUA return — posisi pohonnya sama, jadi instance-nya dipertahankan.
 *
 * Posisinya fixed dan disinkronkan ke rect <main> pakai ResizeObserver, biar di
 * /internet dia persis nutup area konten. Disembunyiin pakai visibility, BUKAN
 * display:none — display:none (termasuk di ancestor) bikin webview reload begitu
 * ditampilin lagi, yang justru masalah awalnya.
 */
function LapisanPenampilWeb({ aktif, mainEl }: { aktif: boolean; mainEl: HTMLElement | null }) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Sengaja NGGAK ngosongin rect pas nonaktif: ukuran terakhir dipertahankan
  // supaya lapisannya tetep segede area konten dan capture-nya nggak ngecil.
  useEffect(() => {
    if (!aktif || !mainEl) return;
    const ukur = () => {
      const r = mainEl.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(mainEl);
    window.addEventListener("resize", ukur);
    return () => { ro.disconnect(); window.removeEventListener("resize", ukur); };
  }, [aktif, mainEl]);

  // Cara nyembunyiin lapisan ini udah tiga kali ganti, masing-masing karena
  // jebakan yang beda. Biar nggak kejebak lagi, ini catatannya:
  //
  // - display:none (termasuk di ancestor) bikin webview RELOAD pas ditampilin
  //   lagi. Itu masalah awalnya, makanya nggak pernah dipakai.
  // - visibility:hidden bikin Blink nyimpen nilai "hidden" yang diwarisi
  //   anak-anaknya dari frame pertama dan NGGAK pernah ngitung ulang pas
  //   lapisannya dibalik ke visible. getComputedStyle di halaman bilang hidden
  //   padahal DevTools bilang visible, dan focus() nolak karena percaya nilai
  //   basi itu — input landing jadi nggak bisa diketik sama sekali.
  // - transform:scale(0) nggak boleh: ancestor yang di-transform jadi
  //   containing block buat root fullscreen Penampil Web yang position:fixed.
  // - Digeser ke luar layar (left:-10000, ukuran 1x1) BEBAS dari tiga jebakan
  //   di atas, tapi punya jebakan sendiri yang baru ketahuan: elemen yang
  //   nggak beririsan sama viewport berhenti dikomposit, dan capture nempel ke
  //   compositor. Terukur di app ini — share screen yang lagi jalan langsung
  //   BEKU begitu guru balik ke Home (4 sampel berturut-turut warnanya sama
  //   persis), lalu ngalir lagi pas balik ke /internet. Buat kelas, itu layar
  //   diam tanpa peringatan apa pun.
  //
  // Yang dipakai sekarang: opacity:0, ukuran dan posisi TETAP dipertahankan.
  // Opacity nggak diwarisi sebagai nilai yang bisa basi kayak visibility, nggak
  // bikin containing block kayak transform, nggak nyentuh siklus hidup webview
  // kayak display, dan yang penting elemennya tetep dikomposit — jadi share
  // screen tetep ngalir walaupun guru lagi di Home.
  //
  // Ukurannya WAJIB tetap segede area aslinya. Sempat 1x1 waktu digeser ke luar
  // layar, dan itu bikin resolusi capture ikut ngecil jadi beberapa piksel.
  const tampil = aktif;
  return (
    <div
      aria-hidden={!tampil}
      style={{
        position: "fixed",
        top: rect?.top ?? 0,
        left: rect?.left ?? 0,
        width: rect?.width ?? "100vw",
        height: rect?.height ?? "100vh",
        opacity: tampil ? 1 : 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        pointerEvents: tampil ? "auto" : "none",
        zIndex: tampil ? 20 : 0,
      }}
    >
      <Internet aktif={aktif} />
    </div>
  );
}

function MainLayoutContent() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast, dismissToast } = useToast();
  const navigate = useNavigate();

  const { loading, isFullScreen } = useSelector((state: RootState) => state.ui);
  const { isRecording, session_id, recordingEventId, startedEventId, recordingEventEndTime, recordingEventEndAt, showStopConfirm, showSummary, hasStoppedSession, stoppedAt, finishedEvent } = useSelector((state: RootState) => state.record);

  /**
   * Kelas berhenti -> tab browser ditutup semua.
   *
   * Ini WAJIB, bukan kerapian. Dulu pencet Stop bikin Penampil Web ikut unmount
   * dan webview-nya hancur, jadi kamera sama mic di video-room mati sendiri.
   * Sekarang webview sengaja dipertahankan biar konferensi nggak putus tiap
   * pindah halaman — efek sampingnya, sesudah kelas dinyatakan selesai podium
   * MASIH nyiarin ruang kelas. Terukur: mic-nya tetep readyState "live" setelah
   * balik ke Home. Nggak ada indikator apa pun buat guru.
   *
   * Dipasang di sini, bukan di tiap tombol Stop. Ada enam titik navigate("/home")
   * yang tersebar di dua cabang render yang kembar (auto-stop, stop manual, dan
   * penutup ringkasan) — nambahin satu-satu di situ cepat atau lambat bakal
   * kelewat. Dideteksi dari status rekamannya, jadi jalur stop baru pun otomatis
   * ikut kebersihin.
   */
  const pernahRekam = useRef(false);
  useEffect(() => {
    if (isRecording) {
      pernahRekam.current = true;
      return;
    }
    // Cuma bereaksi ke peralihan rekam -> berhenti. Tanpa penjaga ini, app yang
    // baru dibuka (isRecording awalnya false) bakal ngehapus tab yang tadinya
    // dipulihin dari sesi sebelumnya.
    if (!pernahRekam.current) return;
    pernahRekam.current = false;
    dispatch(resetBrowser());
  }, [isRecording, dispatch]);
  const { headerEvents } = useSelector((state: RootState) => state.calendar);
  const { errorPin: authError } = useSelector((state: RootState) => state.auth);
  const headerEventsRef = useRef(headerEvents);

  useEffect(() => {
    headerEventsRef.current = headerEvents;
  }, [headerEvents]);

  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [isBooting, setIsBooting] = useState(true);

  const [isStarted, setIsStarted] = useState(false);
  const [time, setTime] = useState(new Date());
  const [countdown, setCountdown] = useState("00:00:00");
  const [graceCountdown, setGraceCountdown] = useState<string | null>(null);
  const [showStopPIN, setShowStopPIN] = useState(false);
  // Simpan seluruh detail event dari server, bukan status doang. activeEvent
  // datang dari endpoint list, dan di sana metadata SELALU null — cuma respons
  // detail yang bawa join_event_ids. Dulu cuma status yang diambil, akibatnya
  // gate kelas gabungan nggak pernah kebuka dan kuncinya nggak pernah nyala.
  const [serverEvent, setServerEvent] = useState<EventDetail | null>(null);
  const serverEventStatus: EventRecordStatus | null = serverEvent?.status ?? null;
  // Kelas gabungan: sesi dijalankan dari podium ruang lain, jadi podium ini
  // hanya pengikut pasif — jadwal tetap tampil berjalan, tapi menu dikunci.
  // Selalu false untuk kelas non-gabungan, sehingga alur lama tak berubah.
  const isLockedByTwin = isLockedByTwinRoom(serverEvent, serverEventStatus, startedEventId);
  const isEffectiveRecording =
    (isRecording || serverEventStatus === "recording") && !isLockedByTwin;
  const isMeetingActive = !!activeEvent?.is_meeting;
  const canStartFromServerStatus = serverEventStatus === "" || serverEventStatus === "failed";
  const isStartBlockedByServerStatus =
    serverEventStatus !== null && serverEventStatus !== "recording" && !canStartFromServerStatus;

  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isLessonOrGrace, setIsLessonOrGrace] = useState(false);

  const hasAutoStoppedRef = useRef(false);
  const recordingEventRef = useRef<any>(null);
  const hasClearedGraceRef = useRef(false);

  const getTimeTodayLocal = useCallback((timeStr: string): number | null => {
    const normalized = timeStr.trim().replace(".", ":");
    const [h, m, s] = normalized.split(":").map((p) => p.trim());
    const hours = Number(h);
    const minutes = Number(m ?? "0");
    const seconds = Number(s ?? "0");

    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
      return null;
    }

    const d = new Date();
    d.setHours(hours, minutes, seconds, 0);
    return d.getTime();
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 900));

      const endTime = recordingEventEndAt ?? (recordingEventEndTime ? getTimeTodayLocal(recordingEventEndTime) : null);
      const shouldStopOnBoot =
        isRecording &&
        !!session_id &&
        !!recordingEventId &&
        endTime !== null &&
        Date.now() >= endTime;

      const stopOnBoot = shouldStopOnBoot
        ? (async () => {
            hasAutoStoppedRef.current = true;
            try {
              await dispatch(stopRecord({ session_id: session_id!, event_id: String(recordingEventId), isAuto: true })).unwrap();
            } catch {}
          })()
        : Promise.resolve();

      await Promise.all([minDelay, stopOnBoot]);
      if (!alive) return;
      setIsBooting(false);
    };

    run();
    return () => {
      alive = false;
    };
  }, [dispatch, getTimeTodayLocal, isRecording, recordingEventEndAt, recordingEventEndTime, recordingEventId, session_id]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!isRecording) return;
      if (!recordingEventId) return;

      const recordingEvent = headerEvents.find(
        (event) => String(event.id) === String(recordingEventId),
      );
      if (!recordingEvent?.app_name) return;

      try {
        const res = await eventService.getEventById(
          String(recordingEventId),
          recordingEvent.app_name,
        );
        if (!alive) return;
        // CATATAN: komentar lama di sini bilang status meeting dari server
        // selalu "". Itu nggak akurat — pengecekan ke API nunjukin meeting juga
        // dapet status nyata, termasuk "stopped". Perilakunya SENGAJA nggak
        // diubah karena guard ini nyangkut alur rekaman meeting, tapi dampaknya
        // perlu dicatat: buat meeting, watchdog ini nggak pernah ngebersihin
        // state rekaman lokal walaupun server udah bilang berhenti. Jalur stop
        // manual sama auto-stop tetep jalan, jadi ini cuma jaring pengaman yang
        // mati khusus meeting.
        if (res.data?.is_meeting) return;
        if (res.data?.status !== "recording") {
          dispatch(clearRecordingOnly());
        }
      } catch {}
    };

    run();
    return () => {
      alive = false;
    };
  }, [dispatch, headerEvents, isRecording, recordingEventId]);

  // Associate browser tabs with current lesson session (no reset if same session)
  // This ensures continuity when recovering a recording session after app restart.
  useEffect(() => {
    if (isRecording && recordingEventId) {
      dispatch(beginNewBrowserSession(String(recordingEventId)));
    }
  }, [dispatch, isRecording, recordingEventId]);

  // Sync recordingEventRef — HANYA set saat recording mulai, jangan update saat activeEvent berubah
  // Kalau ref diupdate tiap activeEvent berubah, saat endTime tepat tercapai activeEvent jadi null
  // dan ref juga null → auto-stop crash / tidak jalan
  useEffect(() => {
    if (isRecording) {
      // Set ref hanya jika belum diset (saat recording baru mulai)
      if (!recordingEventRef.current) {
        if (recordingEventId && (recordingEventEndAt || recordingEventEndTime)) {
          recordingEventRef.current = { id: recordingEventId, end_at: recordingEventEndAt, end_time: recordingEventEndTime };
        } else if (activeEvent) {
          recordingEventRef.current = activeEvent;
        }
      }
    } else {
      // Clear saat recording berhenti
      recordingEventRef.current = null;
    }
  }, [isRecording, activeEvent, recordingEventEndAt, recordingEventId, recordingEventEndTime]);

  // 1. Fetch data on mount
  useEffect(() => {
    dispatch(fetchUser());
    let alive = true;
    let timeoutId: number | null = null;
    const retryAttemptRef = { current: 0 };
    const isFetchingRef = { current: false };

    const schedule = (delayMs: number) => {
      if (!alive) return;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      const safeDelay = Math.max(5000, delayMs);
      timeoutId = window.setTimeout(() => {
        void fetchSchedule("scheduled");
      }, safeDelay);
    };

    const getTodayStr = () =>
      new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const computeNextDelayMs = (events: typeof headerEventsRef.current) => {
      const nowMs = Date.now();
      // Batas atas jeda antar-fetch. Kandidat di bawah cuma dihitung dari jadwal
      // yang UDAH diketahui, jadi kalau hari ini kosong yang tersisa cuma tengah
      // malam. Dulu batasnya 2 jam, akibatnya jadwal yang baru dibikin siang
      // nggak kebaca sampai berjam-jam kemudian dan harus restart app dulu.
      // Sekarang paling lama 2 menit, tapi kandidat yang lebih deket tetep menang
      // jadi bangun tepat di batas kelas (mulai/selesai) nggak ilang.
      const maxDelayMs = 2 * 60 * 1000;

      const todayStr = getTodayStr();
      const todayEvents = events.filter((ev) => ev.event_date === todayStr);

      let currentEnd: number | null = null;
      let nextStart: number | null = null;

      for (const ev of todayEvents) {
        const start = getTimeTodayLocal(ev.start_time);
        const end = getTimeTodayLocal(ev.end_time);
        if (start === null || end === null) continue;

        if (nowMs >= start && nowMs < end) {
          if (currentEnd === null || end < currentEnd) currentEnd = end;
        } else if (start > nowMs) {
          if (nextStart === null || start < nextStart) nextStart = start;
        }
      }

      const candidates: number[] = [];

      if (nextStart !== null) {
        candidates.push(nextStart - 15 * 60 * 1000);
        candidates.push(nextStart + 2000);
      }
      if (currentEnd !== null) {
        candidates.push(currentEnd + 2000);
      }

      const midnight = new Date();
      midnight.setHours(24, 0, 30, 0);
      candidates.push(midnight.getTime());

      const future = candidates.filter((t) => t > nowMs + 2000);
      const nextAt = future.length ? Math.min(...future) : nowMs + maxDelayMs;

      return Math.min(nextAt - nowMs, maxDelayMs);
    };

    const fetchSchedule = async (_reason: "scheduled" | "focus" | "online") => {
      if (!alive) return;
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const now = new Date();
        const events = await dispatch(fetchHeaderEvents({ month: now.getMonth() + 1, year: now.getFullYear() })).unwrap();
        headerEventsRef.current = events;
        retryAttemptRef.current = 0;
        schedule(computeNextDelayMs(events));
      } catch {
        retryAttemptRef.current += 1;
        const base = 15000;
        const cappedAttempt = Math.min(retryAttemptRef.current, 5);
        schedule(base * Math.pow(2, cappedAttempt - 1));
      } finally {
        isFetchingRef.current = false;
      }
    };

    void fetchSchedule("scheduled");

    const onFocus = () => void fetchSchedule("focus");
    const onOnline = () => void fetchSchedule("online");
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      alive = false;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [dispatch]);

  useEffect(() => {
    let alive = true;
    let interval: number | null = null;

    const run = async () => {
      if (!activeEvent?.id || !activeEvent?.app_name) {
        setServerEvent(null);
        return;
      }

      const fetchStatus = async () => {
        try {
          const res = await eventService.getEventById(
            String(activeEvent.id),
            activeEvent.app_name,
          );
          if (!alive) return;
          setServerEvent(res.data ?? null);
        } catch {
          if (!alive) return;
          setServerEvent(null);
        }
      };

      await fetchStatus();
      interval = window.setInterval(fetchStatus, 10000);
    };

    run();
    return () => {
      alive = false;
      if (interval !== null) window.clearInterval(interval);
    };
  }, [activeEvent?.id, activeEvent?.app_name]);

  // Reset auto-stop flag when recording starts
  useEffect(() => {
    if (isRecording) {
      hasAutoStoppedRef.current = false;
    }
  }, [isRecording]);

  useEffect(() => {
    if (hasStoppedSession) {
      hasClearedGraceRef.current = false;
    }
  }, [hasStoppedSession]);

  useEffect(() => {
    if (!isRecording) return;
    if (!session_id) return;
    if (!recordingEventId) return;
    if (hasAutoStoppedRef.current) return;

    const endTime = recordingEventEndAt ?? (recordingEventEndTime ? getTimeTodayLocal(recordingEventEndTime) : null);
    if (endTime !== null && Date.now() >= endTime) {
      hasAutoStoppedRef.current = true;
      dispatch(stopRecord({ session_id, event_id: String(recordingEventId), isAuto: true }));
      showToast("Sesi sebelumnya dihentikan otomatis (waktu sudah lewat)", "info");
      if (window.location.pathname !== "/home") {
        navigate("/home");
      }
    }
  }, [dispatch, isRecording, navigate, recordingEventEndAt, recordingEventEndTime, recordingEventId, session_id, showToast]);

  /* ================= AUTO STOP RECORD LOGIC ================= */
  useEffect(() => {
    if (!isRecording) return;

    const checkInterval = setInterval(() => {
      if (hasAutoStoppedRef.current) return;

      const now = Date.now();
      const endTime =
        typeof recordingEventRef.current?.end_at === "number"
          ? recordingEventRef.current.end_at
          : recordingEventRef.current?.end_time
            ? getTimeTodayLocal(recordingEventRef.current.end_time)
            : null;

      if (endTime !== null && now >= endTime && !hasAutoStoppedRef.current) {
        hasAutoStoppedRef.current = true;
        const finished = recordingEventRef.current;

        // Safety check — pastikan event masih valid
        if (!finished) {
          console.warn("[AutoStop] recordingEventRef is null saat auto-stop, skip.");
          return;
        }

        dispatch(stopRecord({ session_id: session_id || "", event_id: String(finished.id), isAuto: true }));
        showToast("Waktu pelajaran habis, sesi dihentikan otomatis", "info");

        if (window.location.pathname !== "/home") {
          navigate("/home");
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isRecording, session_id, dispatch, navigate, showToast]);

  // 2. Update time and countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getTime();
      setTime(now);

      // Grace Countdown (15 min after manual stop)
      if (hasStoppedSession && stoppedAt) {
        const graceEndLocal = stoppedAt + 15 * 60 * 1000;
        const diffGrace = graceEndLocal - currentTime;
        if (diffGrace > 0) {
          const totalSec = Math.floor(diffGrace / 1000);
          const mm = Math.floor(totalSec / 60);
          const ss = totalSec % 60;
          setGraceCountdown(`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`);
        } else {
          setGraceCountdown(null);
          if (!hasClearedGraceRef.current) {
            hasClearedGraceRef.current = true;
            dispatch(setShowSummary(false));
            dispatch(resetStoppedSession());
          }
        }
      } else {
        setGraceCountdown(null);
      }

      if (!activeEvent?.start_time) {
        setCountdown("00:00:00");
        setIsStarted(false);
        setIsLessonActive(false);
        setIsLessonOrGrace(false);
        return;
      }

      const startTime = getTimeTodayLocal(activeEvent.start_time);
      const endTime = getTimeTodayLocal(activeEvent.end_time);
      if (startTime === null || endTime === null) {
        setCountdown("00:00:00");
        setIsStarted(false);
        setIsLessonActive(false);
        setIsLessonOrGrace(false);
        return;
      }
      const graceEnd = endTime + 15 * 60 * 1000;
      const startThreshold = startTime - 15 * 60 * 1000;

      setIsLessonActive(currentTime >= startTime && currentTime < endTime);
      setIsLessonOrGrace(currentTime >= startTime && currentTime < graceEnd);

      let targetTime = 0;
      if (currentTime >= startTime && currentTime < endTime) {
        setIsStarted(true);
        targetTime = endTime;
      } else if (currentTime >= startThreshold && currentTime < startTime) {
        setIsStarted(true);
        targetTime = startTime; // Prep window → hitung mundur ke waktu MULAI, bukan selesai
      } else if (currentTime < startThreshold) {
        setIsStarted(false);
        targetTime = startTime;
      } else {
        setCountdown("00:00:00");
        setIsStarted(false);
        return;
      }

      const diff = targetTime - currentTime;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent, hasStoppedSession, stoppedAt, dispatch]);

  // 3. Logic cari event
  useEffect(() => {
    if (!headerEvents || headerEvents.length === 0) return;
    const now = new Date();
    const todayStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const currentTimeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");

    const todayEvents = headerEvents.filter(ev => {
      if (ev.event_date !== todayStr) return false;
      // Exclude finishedEvent saat user memilih Keluar (hasStoppedSession=false tapi finishedEvent ada)
      if (finishedEvent && String(ev.id) === String(finishedEvent.id) && !hasStoppedSession) return false;
      return true;
    });

    if (hasStoppedSession && finishedEvent) {
      setActiveEvent(finishedEvent);
      return;
    }

    // Kalau meeting overlap dengan jadwal belajar, prioritaskan jadwal belajar
    const running = todayEvents.filter(ev => ev.start_time <= currentTimeStr && ev.end_time > currentTimeStr);
    let current = running.find(ev => !ev.is_meeting) || running[0];

    if (!current) {
      current = todayEvents
        .filter(ev => ev.start_time > currentTimeStr)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    }

    if (!activeEvent || activeEvent.id !== current?.id) {
      setActiveEvent(current || null);
    }
  }, [headerEvents, time, activeEvent, finishedEvent, hasStoppedSession]);

  /* ================= PENANDA SIBUK UNTUK UPDATER ================= */
  // Update dipasang dengan cara nutup app. Tanpa penanda ini, pengecekan
  // otomatis bisa jatuh pas kelas lagi jalan dan rekamannya kepotong.
  useEffect(() => {
    const sibuk = isEffectiveRecording || isLessonActive;
    window.ipcRenderer.send("update-busy", sibuk);
  }, [isEffectiveRecording, isLessonActive]);

  /* ================= ENFORCE START NOTIFICATION ================= */
  useEffect(() => {
    if (
      isLessonActive &&
      !isMeetingActive &&
      !isRecording &&
      !hasStoppedSession &&
      serverEventStatus !== "recording" &&
      !isStartBlockedByServerStatus
    ) {
      let lastToastId: number | null = null;
      const fire = () => {
        lastToastId = showToast("Kelas telah dimulai, silakan klik tombol mulai untuk memulai kelas.", "info");
      };

      fire();
      const interval = setInterval(() => {
        fire();
      }, 10000);
      return () => {
        clearInterval(interval);
        if (lastToastId !== null) dismissToast(lastToastId);
      };
    }
  }, [dismissToast, hasStoppedSession, isLessonActive, isMeetingActive, isRecording, isStartBlockedByServerStatus, serverEventStatus, showToast]);

  useEffect(() => {
    if (authError) showToast(authError, "error");
  }, [authError, showToast]);

  useEffect(() => {
    const cleanup = window.ipcRenderer.on("request-stop-record-before-quit", async () => {
      return;
    });

    return cleanup;
  }, []);

  const isHome = location.pathname === "/home";
  const isInternet = location.pathname === "/internet";

  /**
   * Halaman materi ajar dirender LAYAR PENUH, tanpa sidebar sama navbar.
   *
   * Rute-rute ini dulunya saudara MainLayout, bukan anaknya — jadi buka satu PDF
   * dari Modul bikin MainLayout unmount, lapisan Penampil Web ikut unmount, dan
   * semua <webview> hancur. Konferensi yang lagi jalan putus, persis kegagalan
   * yang mau dihindarin. Sekarang rutenya dipindah jadi anak MainLayout supaya
   * lapisannya selamat.
   *
   * Tapi enam halaman itu semuanya dibikin pakai h-screen alias ngarep seukuran
   * layar. Kalau dijejelin ke dalam <main> yang ada sidebar-nya, layoutnya
   * jebol. Makanya dikasih cabang render sendiri: cuma <Outlet />, tanpa apa-apa
   * di sekelilingnya — tampilannya sama persis kayak sebelum dipindah.
   */
  const RUTE_MATERI = ["/file", "/video", "/image", "/3d", "/interactive", "/viewer"];
  const isMateri = RUTE_MATERI.includes(location.pathname);
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  // useCallback wajib: kalau ref-nya fungsi baru tiap render, React manggil
  // ref lama dengan null lalu ref baru dengan elemennya di SETIAP render —
  // state mainEl bolak-balik null/el terus, dan observer di lapisan permanen
  // ikut dilepas-pasang tiap render.
  const mainRef = useCallback((el: HTMLElement | null) => setMainEl(el), []);


  if (isMateri) {
    // Lapisan Penampil Web WAJIB tetep jadi anak pertama Fragment, sama kayak
    // dua cabang lain. Posisi di pohon React harus sama persis di semua cabang —
    // kalau nggak, instance-nya nggak dipertahankan dan webview-nya dibikin
    // ulang, yang artinya konferensinya putus juga.
    return (
      <>
        <LapisanPenampilWeb aktif={false} mainEl={null} />
        <SharePicker />
        <PagarGalat onKembali={() => navigate("/module")}>
          <Outlet />
        </PagarGalat>
      </>
    );
  }

  if (isHome) {
    return (
      <>
      <LapisanPenampilWeb aktif={false} mainEl={null} />
      <SharePicker />
      <div
        className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {isBooting && <BootSplash isRecording={isRecording} />}
        {!isFullScreen && (
          <div className="absolute top-4 left-24 z-50">
            <RecorderComponents />
          </div>
        )}
        <Outlet />

        {loading && <Loading />}

        <SummaryModal
          open={showSummary}
          event={finishedEvent}
          onClose={() => {
            dispatch(setShowSummary(false));
            dispatch(resetStoppedSession());
            navigate("/home");
          }}
          onCheckAttendance={() => {
            dispatch(setShowSummary(false));
            navigate("/student");
          }}
        />

        <StopConfirmDialog
          open={showStopConfirm}
          onConfirm={() => {
            dispatch(setShowStopConfirm(false));
            // Stop event yang benar-benar direkam, bukan activeEvent yang bisa
            // sudah berganti (mis. ke meeting yang overlap)
            dispatch(setFinishedEvent(
              headerEvents.find(ev => String(ev.id) === String(recordingEventId)) || activeEvent
            ));
            dispatch(stopRecord({
              session_id: session_id || "",
              event_id: String(recordingEventId || activeEvent?.id || ""),
              isAuto: false
            }));
            showToast("Sesi belajar selesai", "success");
            if (window.location.pathname !== "/home") {
              navigate("/home");
            }
          }}
          onCancel={() => dispatch(setShowStopConfirm(false))}
        />
      </div>
      </>
    );
  }

  return (
    <>
    <LapisanPenampilWeb aktif={isInternet} mainEl={mainEl} />
    <SharePicker />
    <div
      className="relative h-screen w-full bg-cover bg-center flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {isBooting && <BootSplash isRecording={isRecording} />}
      {!isFullScreen && (
        <div className="absolute top-4 left-24 z-50">
          <RecorderComponents />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${isFullScreen ? "p-0 m-0" : isInternet ? "pt-8 pl-8 pb-8 pr-0" : "pt-6 pl-12 pr-0 pb-6"
          }`}
      >
        {!isInternet && !isFullScreen && (
          <div className="pr-12">
            <Navbar
              time={time}
              activeEvent={activeEvent}
              isStarted={isStarted}
              isLessonActive={isLessonActive}
              countdown={countdown}
              hasStoppedSession={hasStoppedSession}
              graceCountdown={graceCountdown}
            />
          </div>
        )}

        <div className={`flex-1 flex min-h-0 overflow-hidden ${!isInternet && !isFullScreen ? "mt-4" : ""}`}>
          {/* ref: rect-nya dipakai lapisan Penampil Web permanen (lihat
              LapisanPenampilWeb) buat nempatin diri persis di area konten ini. */}
          <main ref={mainRef} className={`relative flex-1 flex flex-col min-h-0 overflow-hidden ${isFullScreen ? "pr-0" : isInternet ? "pr-8" : "pr-12"}`}>
            <Outlet />
          </main>
          {!isFullScreen && (
            <Sidebar
              isLessonActive={isLessonActive}
              isLessonOrGrace={isLessonOrGrace}
              isRecording={isEffectiveRecording}
              hasStoppedSession={hasStoppedSession}
              stoppedAt={stoppedAt}
            />
          )}
        </div>
      </div>

      {loading && <Loading />}

      <SummaryModal
        open={showSummary}
        event={finishedEvent}
        onClose={() => {
          dispatch(setShowSummary(false));
          dispatch(resetStoppedSession());
          navigate("/home");
        }}
        onCheckAttendance={() => {
          dispatch(setShowSummary(false));
          navigate("/student");
        }}
      />

      <StopConfirmDialog
        open={showStopConfirm}
        onConfirm={() => {
          dispatch(setShowStopConfirm(false));
          // Stop event yang benar-benar direkam, bukan activeEvent yang bisa
          // sudah berganti (mis. ke meeting yang overlap)
          dispatch(setFinishedEvent(
            headerEvents.find(ev => String(ev.id) === String(recordingEventId)) || activeEvent
          ));
          dispatch(stopRecord({
            session_id: session_id || "",
            event_id: String(recordingEventId || activeEvent?.id || ""),
            isAuto: false
          }));
          showToast("Sesi belajar selesai", "success");
          if (window.location.pathname !== "/home") {
            navigate("/home");
          }
        }}
        onCancel={() => dispatch(setShowStopConfirm(false))}
      />
    </div>
    </>
  );
}

const MainLayout = () => {
  const class_id = localStorage.getItem("class_id") || "";
  const token = sessionStorage.getItem("token") || "";

  if (!class_id) return <Navigate to="/setting-pin" replace />;
  // Remove token check here as per user request to go straight to dashboard
  return <MainLayoutContent />;
};

export default MainLayout;

/* ================= MODALS ================= */

const BootSplash = ({ isRecording }: { isRecording: boolean }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <img src={Logo} alt="Smart Podium" className="h-14 w-auto object-contain" />
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-semibold text-gray-500 tracking-wide">
          {isRecording ? "Memulihkan sesi..." : "Memuat sistem..."}
        </div>
      </div>
    </div>
  );
};

type SummaryModalProps = {
  open: boolean;
  onClose: () => void;
  onCheckAttendance: () => void;
  event: any;
};

const SummaryModal = ({ open, onClose, onCheckAttendance, event }: { open: boolean; onClose: () => void; onCheckAttendance: () => void; event: any }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative border border-white/20" style={{ width: 360 }}>
        {/* Premium Glow Effect */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

        {/* Success Icon Section */}
        <div className="pt-8 pb-2 flex flex-col items-center relative z-10">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sesi Selesai</h2>
          <p className="mt-2 text-[12px] text-gray-400 text-center px-6">Pilih tindakan selanjutnya</p>
        </div>

        {/* Data Section */}
        <div className="px-7 pb-8 space-y-4 relative z-10">
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Waktu & Tanggal</label>
              <div className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl text-[13px] font-bold text-gray-700 border border-gray-100 cursor-default flex items-center justify-between">
                <span>{formattedDate(new Date())}</span>
                <span className="text-gray-400 font-medium">|</span>
                <span>{formattedTime(new Date())}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Tenaga Pengajar</label>
              <div className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl text-[13px] font-bold text-gray-700 border border-gray-100 cursor-default truncate">
                {event?.teacher_name || "-"}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Materi Pelajaran</label>
              <div className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl text-[13px] font-bold text-gray-700 border border-gray-100 cursor-default min-h-[60px] max-h-[100px] overflow-y-auto leading-relaxed">
                {event?.course_name || event?.title || "Materi Pembelajaran"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={onCheckAttendance}
              className="w-full py-4 bg-[#1a4fff] hover:bg-[#0037ff] text-white font-extrabold text-sm rounded-2xl transition-all active:scale-[0.97] shadow-xl shadow-blue-500/25 flex flex-col items-center justify-center gap-0.5"
            >
              <div className="flex items-center gap-2">
                <UsersIcon width={18} height={18} />
                Periksa Absensi
              </div>
              <span className="text-[10px] font-medium text-blue-200">+15 menit akses menu</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white hover:bg-gray-50 text-gray-600 font-bold text-sm rounded-2xl transition-all active:scale-[0.97] border border-gray-200 flex flex-col items-center gap-0.5"
            >
              <span>Keluar</span>
              <span className="text-[10px] font-normal text-gray-400">Langsung ke kelas berikutnya</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


type StopConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const StopConfirmDialog = ({ open, onConfirm, onCancel }: StopConfirmDialogProps) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: any;
    if (open && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [open, countdown]);

  useEffect(() => {
    if (!open) setCountdown(3);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden relative p-8 text-center" style={{ width: 360 }}>
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
          <LogOut size={32} className="text-red-500" />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Selesai</h2>
        <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">
          Apakah anda ingin menyelesaikan<br />sesi belajar ini?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={countdown > 0}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.97] shadow-xl ${countdown > 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200/50"
              : "bg-[#1a4fff] text-white hover:bg-blue-700 shadow-blue-500/20"
              }`}
          >
            Konfirmasi {countdown > 0 ? `(${countdown})` : ""}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-500 font-bold text-sm rounded-2xl transition-all active:scale-[0.97] border-2 border-gray-100"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
