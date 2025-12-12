import type { GameStateType } from "@/types/TGames";
import { Music, Pause, Play, RotateCcw, VolumeX } from "lucide-react";
import "./PreviewSidebarCopy.css";

type PreviewSidebarCopyProps = {
  gameState: GameStateType;
  setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
  resetGame?: () => void;
  togglePause: () => void;
  toggleMute: () => void;
};

const PreviewSidebarCopy = ({
  gameState,
  resetGame,
  togglePause,
  toggleMute,
}: PreviewSidebarCopyProps) => {
  const { isMuted, isPlaying, hasWon } = gameState;

  return (
    <div className={`sidebar-container ${!isPlaying ? "paused" : ""}`}>
      <div className="sidebar-inner">
        {/* Play/Pause Button */}
        <button
          onClick={togglePause}
          className="sidebar-btn play-pause"
          aria-label={!isPlaying ? "Resume game" : "Pause game"}
          disabled={hasWon}
          title={!isPlaying ? "Resume game" : "Pause game"}
        >
          {!isPlaying ? (
            <Play className="sidebar-icon" />
          ) : (
            <Pause className="sidebar-icon" />
          )}
        </button>

        {/* Mute and Reset buttons - only show when paused */}
        {!isPlaying && (
          <>
            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className={`sidebar-btn mute ${isMuted ? "muted" : "unmuted"}`}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="sidebar-icon" />
              ) : (
                <Music className="sidebar-icon" />
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => resetGame?.()}
              className={`sidebar-btn reset`}
              aria-label="Reset game"
              title="Reset game"
            >
              <RotateCcw className="sidebar-icon" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewSidebarCopy;
