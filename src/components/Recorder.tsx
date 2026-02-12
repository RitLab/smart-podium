import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tick } from "@/stores/record";
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

  const minutes = String(Math.floor(duration / 60)).padStart(2, "0");
  const seconds = String(duration % 60).padStart(2, "0");

  if (!isRecording) return null; // opsional: sembunyi kalau belum record

  return (
    <div className="inline-flex px-3 py-2 gap-2 items-center rounded-md font-bold text-sm bg-white border border-[#E5E8EB] text-red-500">
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute w-4 h-4 rounded-full border-2 border-red-500" />

        {/* Pulse ring */}
        <div className="absolute w-4 h-4 rounded-full bg-red-500 opacity-30 animate-ping" />

        {/* Inner solid dot */}
        <div className="w-2 h-2 rounded-full bg-red-500 z-10" />
      </div>

      <span className="whitespace-nowrap">
        Recording {minutes}:{seconds}
      </span>
    </div>
  );
};

export default RecorderComponents;
