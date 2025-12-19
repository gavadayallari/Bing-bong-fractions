import type { GameStateType } from "@/types/TGames";
import {
  Expand,
  Music,
  Pause,
  Play,
  RotateCcw,
  VolumeX,
} from "lucide-react";
import { handleFullscreenToggle } from "@/utils/handleFullscreenToggle";

type PreviewSidebarProps = {
  gameState: GameStateType;
  showRestartButton?: boolean;
  resetGame?: () => void;
  togglePause: () => void;
  toggleMute: () => void;
};

function PreviewSidebar({
  gameState,
  showRestartButton = true,
  resetGame,
  togglePause,
  toggleMute,
}: PreviewSidebarProps) {
  const { isMuted, isPlaying, hasWon } = gameState;

  return (
    <>
      {/* ================= LEFT SIDEBAR ================= */}
      <div
        className={`pointer-events-none fixed top-0 left-0 bottom-0 z-10 flex items-start p-2 md:p-3 lg:p-4 transition-all duration-300 ${
          !isPlaying ? "bg-violet-500" : ""
        }`}
      >
        <div className="pointer-events-none h-full flex flex-col items-center gap-6">
          {/* Play / Pause */}
          <button
            onClick={togglePause}
            disabled={hasWon}
            title={!isPlaying ? "Resume game" : "Pause game"}
            aria-label={!isPlaying ? "Resume game" : "Pause game"}
            className="pointer-events-auto size-10 md:size-12 lg:size-16 rounded-full bg-violet-500 hover:bg-violet-600 flex items-center justify-center shadow-lg transition-colors touch-none"
          >
            {!isPlaying ? (
              <Play className="size-7 md:size-8 lg:size-10 text-white" />
            ) : (
              <Pause className="size-7 md:size-8 lg:size-10 text-white" />
            )}
          </button>

          {/* Mute + Restart only when paused */}
          {!isPlaying && (
            <>
              <button
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className={`pointer-events-auto size-10 md:size-12 lg:size-16 rounded-full flex items-center justify-center shadow-lg transition-colors touch-none ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isMuted ? (
                  <VolumeX className="size-7 md:size-8 lg:size-10 text-white" />
                ) : (
                  <Music className="size-7 md:size-8 lg:size-10 text-white" />
                )}
              </button>

              {showRestartButton && (
                <button
                  onClick={resetGame}
                  title="Reset game"
                  aria-label="Reset game"
                  className="pointer-events-auto size-10 md:size-12 lg:size-16 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center shadow-lg transition-colors touch-none"
                >
                  <RotateCcw className="size-7 md:size-8 lg:size-10 text-white" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= FULLSCREEN BUTTON ================= */}
      <div className="pointer-events-none fixed bottom-0 right-0 z-10 p-2 md:p-3 lg:p-4">
        <button
          onClick={handleFullscreenToggle}
          title="Toggle fullscreen"
          aria-label="Toggle fullscreen"
          className="fullscreen-btn pointer-events-auto size-10 md:size-12 lg:size-14 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-colors touch-none"
        >
          <Expand className="size-7 md:size-8 text-white" />
        </button>
      </div>
    </>
  );
}

export default PreviewSidebar;
