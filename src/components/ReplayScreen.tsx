import ReplayIcon from "@/assets/ReplayIcon";
import type { GameStateType } from "@/types/TGames";
import { Star, Trophy, Clock } from "lucide-react";

const ReplayScreen = ({
  type,
  handleResetGame,
  setGameState,
}: {
  type: "timeUp" | "win" | "";
  handleResetGame: () => void;
  setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
}) => {
  if (type === "") return null;

  return (
    <div
      style={{ pointerEvents: "auto" }}
      className="absolute top-0 h-screen w-screen z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in"
    >
      <div
        className="relative bg-white/95 rounded-3xl p-8 max-w-sm w-[90%] flex flex-col items-center gap-6 shadow-2xl animate-pop hover:scale-[1.01] transition-transform duration-300 border-4 border-violet-100"
      >
        {/* Header Icon */}
        <div className={`-mt-16 p-6 rounded-full shadow-xl border-4 border-white ${type === "win" ? "bg-yellow-400" : "bg-red-400"
          }`}>
          {type === "win" ? (
            <Trophy className="w-12 h-12 text-white fill-white" />
          ) : (
            <Clock className="w-12 h-12 text-white" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-4xl font-black text-gray-800 tracking-tight luckiest-guy-regular uppercase">
          {type === "win" ? "You Won!" : "Time's Up!"}
        </h2>

        {/* Stars (Visual decoration) */}
        {type === "win" && (
          <div className="flex gap-2">
            {[1, 2, 3].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResetGame();
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                isPlaying: true,
                hasStarted: true,
                hasWon: false,
                hasTimeUp: false,
                timeLeft: prev.duration,
              }));
            }, 100);
          }}
          className="group relative flex items-center gap-3 bg-[#e84118] hover:bg-[#c23616] text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full justify-center mt-2"
        >
          <ReplayIcon />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};

export default ReplayScreen;
