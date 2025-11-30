import { Captions, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useSearchParams } from "react-router-dom";

// WORKAROUND: Casting ReactPlayer ke 'any' untuk mengatasi strict typing issue
const Player = ReactPlayer as any;

const VideoPlayer: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const videoUrl = searchParams.get("url") || "";
  const videoTitle = searchParams.get("title") || "Putar Video";

  const playerRef = useRef<any>(null);

  // State Player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // --- HELPER FUNCTIONS ---
  const getSafeDuration = (player: any) => {
    if (!player) return 0;
    if (typeof player.getDuration === "function") {
      return player.getDuration();
    }
    if (typeof player.duration === "number") {
      return player.duration;
    }
    return 0;
  };

  const safeSeekTo = (player: any, time: number) => {
    if (!player) return;
    if (typeof player.seekTo === "function") {
      player.seekTo(time);
    } else if (typeof player.currentTime === "number") {
      player.currentTime = time;
    }
  };

  // Format waktu
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const date = new Date(time * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    if (hours > 0)
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}`;
    return `${minutes}:${seconds}`;
  };

  // --- HANDLERS ---

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // 1. Handler ReactPlayer (Backup)
  const handleProgress = (state: any) => {
    if (!isSeeking) {
      setCurrentTime(state.playedSeconds);
    }
    // Fallback Duration
    if (duration === 0 && playerRef.current) {
      const d = getSafeDuration(playerRef.current);
      if (d && !isNaN(d) && d !== Infinity) setDuration(d);
    }
  };

  // 2. Handler Native HTML5 (UTAMA: Agar slider jalan saat pakai 'src')
  const handleNativeTimeUpdate = (e: any) => {
    // e.target adalah elemen <video> asli
    if (!isSeeking && e.target && typeof e.target.currentTime === "number") {
      setCurrentTime(e.target.currentTime);
    }
  };

  const handleDuration = (duration: number) => {
    if (duration && !isNaN(duration) && duration !== Infinity) {
      setDuration(duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Logic Slider
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = (
    e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>
  ) => {
    setIsSeeking(false);
    const timeToSeek = parseFloat(e.currentTarget.value);
    if (playerRef.current) {
      safeSeekTo(playerRef.current, timeToSeek);
    }
  };

  const progressPercent = (currentTime / duration) * 100 || 0;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex-1"></div>
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center truncate">
          {videoTitle}
        </h1>
        <div className="flex-1 flex justify-end">
          <button
            className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"
            onClick={() => navigate(-1)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MAIN VIDEO AREA */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        <div className="w-full h-full relative">
          <Player
            ref={playerRef}
            src={videoUrl} // Tetap 'src'
            width="100%"
            height="100%"
            playing={isPlaying}
            muted={isMuted}
            controls={false}
            progressInterval={500}
            // Callbacks ReactPlayer
            onProgress={handleProgress}
            onDuration={handleDuration}
            onEnded={handleEnded}
            onReady={() => {
              const d = getSafeDuration(playerRef.current);
              if (d && !isNaN(d) && d !== Infinity) setDuration(d);
            }}
            onError={(e: any) => console.error("ReactPlayer Error:", e)}
            // FIX: Tambahkan Native Event Listener ke props
            // ReactPlayer (FilePlayer) akan meneruskan props ini ke tag <video>
            onTimeUpdate={handleNativeTimeUpdate}
            // Config
            config={
              {
                youtube: {
                  playerVars: {
                    showinfo: 0,
                    controls: 0,
                    modestbranding: 1,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    rel: 0,
                  },
                },
                file: {
                  attributes: {
                    controlsList: "nodownload",
                  },
                },
              } as any
            }
          />

          {/* Click Handler */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={togglePlay}
          />

          {/* Play/Pause Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-300 ${
              !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full">
              {isPlaying ? (
                <Pause className="w-10 h-10 text-white fill-white" />
              ) : (
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-[#f0f0f0] px-6 py-4 border-t border-gray-300">
        <div className="flex items-center gap-4 mb-2">
          {/* Timestamp Kiri */}
          <span className="text-xs font-medium text-gray-600 w-12 text-right">
            {formatTime(currentTime)}
          </span>

          {/* Slider */}
          <div className="relative flex-1 h-1.5 bg-gray-300 rounded-full group cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="any"
              value={currentTime}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekMouseDown}
              onTouchEnd={handleSeekMouseUp}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Visual Orange Line */}
            <div
              className="absolute top-0 left-0 h-full bg-orange-500 rounded-full pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full shadow border border-white"></div>
            </div>
          </div>

          {/* Timestamp Kanan */}
          <span className="text-xs font-medium text-gray-600 w-12 text-left">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-2 px-1">
          <button
            onClick={toggleMute}
            className="text-gray-700 hover:text-black focus:outline-none transition"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button className="text-gray-700 hover:text-black focus:outline-none bg-gray-200 hover:bg-gray-300 p-0.5 rounded transition">
            <Captions size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
