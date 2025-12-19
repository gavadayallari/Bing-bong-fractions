import TimerSvg from "@/assets/TimerSvg";
import { formatTime } from "@/lib/utils";
import type { GameStateType } from "@/types/TGames";
import { useEffect, useRef } from "react";

const CountdownTimer = ({
  initialTime,
  gameState,
  setGameState,
  onTimeUp,
  gameName,
  freeze = false,
}: {
  initialTime: number;
  gameState: GameStateType;
  setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
  onTimeUp: () => void;
  gameName?: string;
  freeze?: boolean;
}) => {
  const { isPlaying, timeLeft } = gameState;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      timeLeft: initialTime,
    }));
  }, [initialTime, setGameState]);

  useEffect(() => {
    if (!isPlaying || freeze) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeLeft <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;

            onTimeUp();
            return {
              ...prev,
              timeLeft: 0,
              isPlaying: false,
              hasTimeUp: true,
            };
          }

          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, freeze, setGameState, onTimeUp]);

  // Replace the SVG-based timer with a responsive pill-shaped design
  return (
    <div className={`absolute top-5 left-1/2 -translate-x-1/2  w-fit countdown-container`}>
      {gameName && (
        <div className="text-xl sm:text-xl md:text-2xl lg:text-[30px] sm:tracking-[2px] font-light text-white uppercase luckiest-guy-regular mb-1">
          {gameName}
        </div>
      )}
      <div className="do-no-capture flex gap-6 mt-2 font-bold items-center justify-center text-white">
        <div className="flex items-center gap-2">
          <TimerSvg/>

          <span className="text-white">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
