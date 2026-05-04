import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tick, setShowStopConfirm } from "@/stores/record";
import { RootState } from "@/stores";

const RecorderComponents: React.FC = () => {
  const dispatch = useDispatch();
  const { isRecording, duration } = useSelector(
    (state: RootState) => state.record
  );

  // jalan tiap 1 detik selama recording aktif
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      dispatch(tick());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, dispatch]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setShowStopConfirm(true));
  };

  if (!isRecording) return null;

  return (
    <div className="inline-flex px-3 py-2 gap-3 items-center rounded-xl font-bold text-sm bg-white shadow-xl border border-red-100 text-red-500 animate-in fade-in slide-in-from-top-4 duration-500 z-50 relative">
      <div className="flex items-center gap-2">
        <div className="relative w-3 h-3 flex items-center justify-center">
          <div className="absolute w-3 h-3 rounded-full bg-red-500 opacity-30 animate-ping" />
          <div className="w-2 h-2 rounded-full bg-red-500 z-10" />
        </div>
        <span className="whitespace-nowrap tabular-nums">
          Recording {formatDuration(duration)}
        </span>
      </div>
      
      <button 
        onClick={handleStop}
        className="ml-1 p-1 hover:bg-red-50 rounded-md transition-colors group"
        title="Stop Recording"
      >
        <div className="w-4 h-4 bg-red-500 rounded-sm group-hover:bg-red-600 transition-colors" />
      </button>
    </div>
  );
};

export default RecorderComponents;
