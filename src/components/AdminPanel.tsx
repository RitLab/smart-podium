import { GraduationCap, LogOut, Minimize2, RefreshCw, Wrench, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  onChangeClass: () => void;
  onMinimize: () => void;
  onCheckUpdate: () => void;
  onQuit: () => void;
}

type ActionButtonProps = {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  description,
  onClick,
  danger,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-colors ${
      danger
        ? "bg-red-50/60 border-red-100 hover:bg-red-50"
        : "bg-gray-50/80 border-gray-100 hover:bg-blue-50 hover:border-blue-100"
    }`}
  >
    <div
      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        danger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
      }`}
    >
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p
        className={`text-[14px] font-bold leading-tight ${
          danger ? "text-red-700" : "text-gray-800"
        }`}
      >
        {label}
      </p>
      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
        {description}
      </p>
    </div>
  </button>
);

const AdminPanel: React.FC<AdminPanelProps> = ({
  open,
  onClose,
  onChangeClass,
  onMinimize,
  onCheckUpdate,
  onQuit,
}) => {
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (open) openedAtRef.current = Date.now();
  }, [open]);

  // Panel dibuka lewat tekan lama, jadi jari masih menempel saat ia muncul.
  // Lepasan jari itu bisa mendarat di backdrop dan langsung menutup panel,
  // maka klik backdrop diabaikan sesaat setelah panel terbuka.
  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < 500) return;
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[20px]"
        onClick={handleBackdropClick}
      ></div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                Menu Teknisi
              </h3>
              <p className="text-[11px] text-gray-500 leading-tight">
                Pengaturan perangkat podium
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 transition-colors"
            aria-label="Tutup"
          >
            <X size={22} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <ActionButton
            icon={GraduationCap}
            label="Ganti Kelas"
            description="Pilih ulang ruang kelas untuk podium ini"
            onClick={onChangeClass}
          />

          <ActionButton
            icon={Minimize2}
            label="Kecilkan Jendela"
            description="Turun ke desktop Windows, aplikasi tetap jalan"
            onClick={onMinimize}
          />

          <ActionButton
            icon={RefreshCw}
            label="Cek Pembaruan"
            description="Cari versi terbaru Smart Podium"
            onClick={onCheckUpdate}
          />

          <ActionButton
            icon={LogOut}
            label="Keluar Aplikasi"
            description="Tutup Smart Podium sepenuhnya"
            onClick={onQuit}
            danger
          />
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <span className="text-[11px] font-mono font-semibold text-gray-400">
            v{__APP_VERSION__}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
