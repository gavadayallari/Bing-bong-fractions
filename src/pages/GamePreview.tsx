import CountdownTimer from "@/components/Countdown";
import { forwardRef, useEffect, useRef, useState } from "react";
import PreviewSidebar from "@/components/PreviewSidebar";
import confetti, { type Shape } from "canvas-confetti";
import type { GameConfigType, GameStateType } from "@/types/TGames";
import Image from "@/components/ui/image";
import FloatingText from "@/components/FloatingText";
import type { RefType } from "@/App";
import { uploadedAssetURL } from "@/lib/utils";
import TapToStart from "@/components/TapToStart";
import ReplayScreen from "@/components/ReplayScreen";
import HintGuide from "@/components/HintGuide";
import FractionBingo from "@/components/FractionBingo";
import { handleFullscreenToggle } from "@/utils/handleFullscreenToggle";

const GamePreview = forwardRef<
  RefType,
  {
    gameId: string;
    config: GameConfigType;
    sendDataToParent?: (status: {
      currentLevel: number;
      score: number | null;
      timePlayed: number;
      gameEnded: boolean;
      totalLevels: number;
      isLastLevel: boolean;
    }) => void;
  }
>(({ gameId, config, sendDataToParent }) => {

  /* =====================================================
     ADDED: ORIENTATION STATE (PORTRAIT ONLY)
  ===================================================== */
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia("(orientation: portrait)").matches
  );

  useEffect(() => {
    const handleOrientation = () => {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    };

    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);
  /* ================= END ADD ================= */

  const [gameState, setGameState] = useState<GameStateType>({
    isPlaying: false,
    isMuted: false,
    hasWon: false,
    hasTimeUp: false,
    timeLeft: 0,
    duration: 0,
    hasStarted: false,
  });

  const [freezeTimer, setFreezeTimer] = useState(false);
  const [firstTap, setFirstTap] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);
  const [floatingText, setFloatingText] = useState<string | null>(null);

  const gameGridRef = useRef<HTMLDivElement | null>(null);
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const [resetBingoKey, setResetBingoKey] = useState(0);

  const backgroundMusicRef = useRef<HTMLAudioElement>(
    new Audio("media/background.mp3")
  );

  const instructionsAudioRef = useRef<HTMLAudioElement>(
    new Audio(
      config?.audio?.instructions?.src
        ? uploadedAssetURL({ gameId, src: config.audio.instructions.src })
        : "media/instructions.webm"
    )
  );

  const levelWinRef = useRef<HTMLAudioElement>(
    new Audio("media/level-win.webm")
  );

  const uiClickMusicRef = useRef<HTMLAudioElement>(
    new Audio("media/ui-click.webm")
  );

  const successMusicRef = useRef<HTMLAudioElement>(
    new Audio("media/success.webm")
  );

  const clapMusicRef = useRef<HTMLAudioElement>(
    new Audio("media/clap.webm")
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      instructionsAudioRef.current?.pause();
      successMusicRef.current?.pause();
      clapMusicRef.current?.pause();
      backgroundMusicRef.current?.pause();
    };
  }, [config, gameId]);

  /* =====================================================
     ADDED: BLOCK GAME IN LANDSCAPE
  ===================================================== */
  if (!isPortrait) {
    return (
      <div className="orientation-overlay">
        <div className="orientation-box">
          🔄
          <p>
            Please rotate your device to <br />
            <strong>portrait mode</strong> to play
          </p>
        </div>
      </div>
    );
  }
  /* ================= END ADD ================= */

  if (showSplashScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Image
          src="images/eklavya.png"
          alt="eklavya - making learning accessible"
          className="w-full h-full object-contain animate-fade-in"
        />
      </div>
    );
  }

  return (
    <div
      ref={gameGridRef}
      className="h-screen w-screen overflow-hidden relative game-preview-container"
      style={{
        backgroundImage: `url('images/BIn-Bing-bingo.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingTop: `72px`,
      }}
    >
      <div className="h-full w-full flex items-center justify-center">
        <FractionBingo
          key={resetBingoKey}
          isPlaying={gameState.isPlaying}
          onWin={() => {}}
        />
      </div>

      <TapToStart
        firstTap={firstTap}
        setFirstTap={setFirstTap}
        handleStartGame={() =>
          setGameState((prev) => ({
            ...prev,
            isPlaying: true,
            hasStarted: true,
            timeLeft: config?.duration || 0,
            duration: config?.duration || 0,
          }))
        }
      />

      <div ref={countdownRef} className="absolute top-0 left-0 w-full z-50">
        <CountdownTimer
        initialTime={gameState.duration ?? 0}
        gameState={gameState}
        setGameState={setGameState}
        gameName="BIN, BING, BINGO"
        freeze={freezeTimer}
        onTimeUp={() => {
        setGameState(prev => ({
        ...prev,
        isPlaying: false,
        hasTimeUp: true,
        timeLeft: 0,
        }));
        }}
        />
      </div>

      <PreviewSidebar
        resetGame={() => setResetBingoKey((k) => k + 1)}
        gameState={gameState}
        togglePause={() =>
          setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
        }
        toggleMute={() =>
          setGameState((prev) => ({ ...prev, isMuted: !prev.isMuted }))
        }
        toggleFullscreen={() =>
          handleFullscreenToggle(gameGridRef.current ?? undefined)
        }
      />

      <ReplayScreen
        type={gameState.hasWon ? "win" : gameState.hasTimeUp ? "timeUp" : ""}
        handleResetGame={() => setResetBingoKey((k) => k + 1)}
        setGameState={setGameState}
      />

      <HintGuide
        gameState={gameState}
        setGameState={setGameState}
        play={() => {}}
        hint={""}
      />

      <FloatingText message={floatingText} />
    </div>
  );
});

export default GamePreview;
