import { Captions, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useSearchParams } from "react-router";

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
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && !isSeeking) {
      startTimer();
    } else {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
    }

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, isSeeking]);

  const handleUserActivity = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowControls(true);
    if (isPlaying && !isSeeking) {
      startTimer();
    }
  };

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

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Biar nggak mental ke container
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
    <div 
      className="flex flex-col h-screen bg-black font-sans text-gray-800 overflow-hidden"
      onMouseMove={() => handleUserActivity()}
    >
      {/* HEADER */}
      <div className={`flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-30 transition-all duration-500 absolute top-0 left-0 w-full ${
        showControls ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}>
        <div className="flex-1"></div>
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center truncate">
          {videoTitle}
        </h1>
        <div className="flex-1 flex justify-end">
          <button
            className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"
            onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MAIN VIDEO AREA */}
      <div 
        className="flex-1 relative flex items-center justify-center bg-black overflow-hidden"
        onClick={() => setShowControls(!showControls)}
      >
        <div className="w-full h-full relative">
          <Player
            ref={playerRef}
            src={videoUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            muted={isMuted}
            controls={false}
            progressInterval={500}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onEnded={handleEnded}
            onReady={() => {
              const d = getSafeDuration(playerRef.current);
              if (d && !isNaN(d) && d !== Infinity) setDuration(d);
            }}
            onTimeUpdate={handleNativeTimeUpdate}
            config={{
                file: { attributes: { controlsList: "nodownload" } }
            }}
          />

          {/* Play/Pause Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center z-20 transition-all duration-300 ${
              showControls ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
            }`}
          >
            <button 
                onClick={togglePlay}
                className="bg-black/40 backdrop-blur-md p-6 rounded-full hover:bg-black/60 transition-all active:scale-90 shadow-2xl border border-white/20"
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white fill-white" />
              ) : (
                <Play className="w-12 h-12 text-white fill-white ml-2" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className={`bg-white/90 backdrop-blur-md px-6 py-4 border-t border-gray-200 z-30 transition-all duration-500 absolute bottom-0 left-0 w-full ${
        showControls ? "translate-y-0 opacity-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" : "translate-y-full opacity-0"
      }`}>
        <div className="flex items-center gap-4 mb-2">
          {/* Timestamp Kiri */}
          <span className="text-xs font-semibold text-gray-600 w-12 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          {/* Slider */}
          <div className="relative flex-1 h-2 bg-gray-200 rounded-full cursor-pointer group">
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
              onClick={(e) => e.stopPropagation()}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Visual Orange Line */}
            <div
              className="absolute top-0 left-0 h-full bg-orange-500 rounded-full pointer-events-none transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full shadow-lg border-2 border-white"></div>
            </div>
          </div>

          {/* Timestamp Kanan */}
          <span className="text-xs font-semibold text-gray-600 w-12 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-2 px-1">
          <button
            onClick={(e) => {
                e.stopPropagation();
                toggleMute();
            }}
            className="text-gray-600 hover:text-black focus:outline-none transition active:scale-90"
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <div className="flex items-center gap-4">
             <button className="text-gray-500 hover:text-black focus:outline-none transition">
                <Captions size={20} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
