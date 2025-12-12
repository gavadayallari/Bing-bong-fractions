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
  const levelWinRef=useRef<HTMLAudioElement>(
    new Audio("media/level-win.webm")
  );

  const uiClickMusicRef = useRef<HTMLAudioElement>(
    new Audio("media/ui-click.webm")
  );
  const successMusicRef = useRef<HTMLAudioElement>(
    new Audio("media/success.webm")
  );
  const clapMusicRef = useRef<HTMLAudioElement>(new Audio("media/clap.webm"));

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
      instructionsAudioRef.current = new Audio(
        config?.audio?.instructions?.src
          ? uploadedAssetURL({ gameId, src: config.audio.instructions.src })
          : "media/instructions.webm"
      );
      successMusicRef.current = new Audio("media/success.webm");
      clapMusicRef.current = new Audio("media/clap.webm");
      backgroundMusicRef.current = new Audio("media/background.mp3");
    };
  }, [config, gameId]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background: pause all audio
        if (
          backgroundMusicRef.current &&
          !backgroundMusicRef.current.paused
        ) {
          backgroundMusicRef.current.pause();
        }
        if (
          instructionsAudioRef.current &&
          !instructionsAudioRef.current.paused
        ) {
          instructionsAudioRef.current.pause();
        }
        if (uiClickMusicRef.current && !uiClickMusicRef.current.paused) {
          uiClickMusicRef.current.pause();
        }
        if (successMusicRef.current && !successMusicRef.current.paused) {
          successMusicRef.current.pause();
        }
        if (clapMusicRef.current && !clapMusicRef.current.paused) {
          clapMusicRef.current.pause();
        }
        if (levelWinRef.current && !levelWinRef.current.paused) {
          levelWinRef.current.pause();
        }
      } else {
        // App came back to foreground: resume background music
        // only if the game is still playing and not muted
        if (
          !gameState.isMuted &&
          gameState.isPlaying &&
          backgroundMusicRef.current
        ) {
          backgroundMusicRef.current
            .play()
            .catch(() => {
              // ignore autoplay errors
            });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [gameState.isMuted, gameState.isPlaying]);
  // Report game status to parent (e.g., Flutter) for this single-level demo game
  useEffect(() => {
    if (!sendDataToParent) return;

    // For this demo, we treat it as a single-level game
    const totalLevels = 1;
    const currentLevel = 1;
    const isLastLevel = true;

    const duration = gameState.duration || config?.duration || 0;
    const timeLeft = gameState.timeLeft ?? duration;
    const timePlayed = Math.max(0, duration - timeLeft);

    // Simple score: 1 if player has won, otherwise 0
    const score = gameState.hasWon ? 1 : 0;

    const gameEnded = gameState.hasWon || gameState.hasTimeUp;

    sendDataToParent({
      currentLevel,
      score,
      timePlayed,
      gameEnded,
      totalLevels,
      isLastLevel,
    });
  }, [
    sendDataToParent,
    gameState.duration,
    gameState.timeLeft,
    gameState.hasWon,
    gameState.hasTimeUp,
    config?.duration,
  ]);
  const handleTimeUp = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      hasTimeUp: true,
      hasWon: false,
      timeLeft: 0,
    }));
  };
  const playBigConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
    };
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 100 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount: particleCount * 0.5,
          shapes: ["circle"] as Shape[],
          scalar: 2,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount: particleCount * 0.5,
          shapes: ["square"] as Shape[],
          scalar: 1.5,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  const handleResetGame = () => {
    setFreezeTimer(false);
    setGameState((prev) => ({
      isPlaying: false,
      isMuted: prev.isMuted,
      hasWon: false,
      hasTimeUp: false,
      timeLeft: config?.duration ?? 0,
      duration: config?.duration ?? 0,
      hasStarted: false,
    }));
    // Reset bingo game by changing key
    setResetBingoKey(prev => prev + 1);
  };
  useEffect(() => {
    const handleUiClick = () => {
      if (!gameState.isMuted && uiClickMusicRef.current) {
        uiClickMusicRef.current.play();
      }
    };
    window.addEventListener("click", handleUiClick);
    return () => {
      window.removeEventListener("click", handleUiClick);
    };
  }, [gameState]);

  const handleStartGame = () => {
    if (!gameState.isMuted && instructionsAudioRef.current) {
      instructionsAudioRef.current.play();
      instructionsAudioRef.current.addEventListener("ended", () => {
        if (backgroundMusicRef.current && instructionsAudioRef.current) {
          backgroundMusicRef.current.play();
          backgroundMusicRef.current.loop = true;
          instructionsAudioRef.current.currentTime = 0;
        }
      });
    }
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      hasStarted: true,
      timeLeft: config?.duration || 0,
      duration: config?.duration || 0,
    }));
  };

  const togglePause = () => {
    if (
      !gameState.isPlaying &&
      !gameState.isMuted &&
      backgroundMusicRef.current
    ) {
      if (
        instructionsAudioRef.current &&
        instructionsAudioRef.current.currentTime > 0
      ) {
        instructionsAudioRef.current.play();
        instructionsAudioRef.current?.addEventListener("ended", () => {
          if (backgroundMusicRef.current && instructionsAudioRef.current) {
            backgroundMusicRef.current.play();
            backgroundMusicRef.current.loop = true;
            instructionsAudioRef.current.currentTime = 0;
          }
        });
      } else {
        backgroundMusicRef.current.play();
      }
    } else {
      instructionsAudioRef.current?.pause();
      backgroundMusicRef.current?.pause();
    }
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const toggleMute = () => {
    if (
      !gameState.isMuted &&
      backgroundMusicRef.current &&
      instructionsAudioRef.current
    ) {
      backgroundMusicRef.current.pause();
      instructionsAudioRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      instructionsAudioRef.current.currentTime = 0;
    } else if (gameState.isPlaying && backgroundMusicRef.current) {
      backgroundMusicRef.current.play();
    }
    setGameState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleWin = () => {
    setFreezeTimer(true);
    if (
      !gameState.isMuted &&
      backgroundMusicRef.current &&
      successMusicRef.current
    ) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      successMusicRef.current.play();
      successMusicRef.current.addEventListener("ended", () => {
        if (clapMusicRef.current) {
          clapMusicRef.current.play();
          clapMusicRef.current.loop = false;
        }
      });
    }
    playBigConfetti();
    setFloatingText("Congratulations!");
    setTimeout(() => {
      setFloatingText(null);
      setGameState((prev) => ({ ...prev, isPlaying: false, hasWon: true }));
      setFreezeTimer(false);
    }, 3000);
  };

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
      <div ref={gameGridRef} className="h-full w-full flex items-center justify-center">
        <FractionBingo
          key={resetBingoKey}
          isPlaying={gameState.isPlaying}
          onWin={handleWin}
        />
      </div>

      <TapToStart
        firstTap={firstTap}
        setFirstTap={setFirstTap}
        handleStartGame={handleStartGame}
      />
      <div ref={countdownRef} className=" absolute top-0 left-0 w-full z-50">
        {" "}
        <CountdownTimer
          initialTime={gameState?.duration ?? 0}
          onTimeUp={handleTimeUp}
          gameState={gameState}
          setGameState={setGameState}
          gameName={"BIN, BING, BINGO"}
          freeze={freezeTimer}
        />
      </div>
      <PreviewSidebar
        resetGame={handleResetGame}
        showRestartButton={config?.showRestartButton ?? true}
        gameState={gameState}
        setGameState={setGameState}
        togglePause={togglePause}
        toggleMute={toggleMute}
      />
      <ReplayScreen
        type={gameState.hasWon ? "win" : gameState.hasTimeUp ? "timeUp" : ""}
        handleResetGame={handleResetGame}
        setGameState={setGameState}
      />
      {/* Instructions Dialog */}
      <HintGuide
        gameState={gameState}
        setGameState={setGameState}
        play={() => {
          if (!gameState.isMuted && backgroundMusicRef.current) {
            backgroundMusicRef.current.play();
          }
        }}
        hint={""}
      />
      <FloatingText message={floatingText} />
    </div>
  );
});

export default GamePreview;
