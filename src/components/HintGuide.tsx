import type { GameStateType } from "@/types/TGames";
import { HelpCircle, Lightbulb } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  //   DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type HintGuideProps = {
  gameState: GameStateType;
  setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
  play: () => void;
  hint: string;
};

const HintGuide = ({
  gameState: _gameState,
  setGameState,
  play,
  hint,
}: HintGuideProps) => {
  const [mode, setMode] = useState<"how" | "hint">("how");
  return (
    <>
      <style>{`
        .custom-scroll { 
          scrollbar-color: #77e3a2 #eefff5; 
          scrollbar-width: auto; 
          scrollbar-gutter: stable both-edges; 
          -webkit-overflow-scrolling: touch; /* iOS momentum + better visibility */
        }
        .custom-scroll::-webkit-scrollbar { width: 12px; height: 12px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #77e3a2; border-radius: 9999px; border: 3px solid #eefff5; }
        .custom-scroll::-webkit-scrollbar-track { background: #eefff5; border-radius: 9999px; }
        @media (max-width: 768px) {
          .custom-scroll::-webkit-scrollbar { width: 14px; height: 14px; }
        }
      `}</style>
      <Dialog>
        {/* Triggers container: fixed top-right, spaced, avoids overlap */}
        <div className="do-no-capture fixed right-4 md:top-3 top-2 lg:top-4 z-10 flex flex-row-reverse  items-center gap-2">
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setMode("how");
                setGameState((prev) => ({ ...prev, isPlaying: false }));
              }}
              className="md:size-12 size-10 lg:size-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-lg touch-none"
              aria-label="Show help"
              title="Show help"
            >
              <HelpCircle className="lg:size-10 md:size-8 size-7 text-white" />
            </button>
          </DialogTrigger>
          {hint && (
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setMode("hint");
                  setGameState((prev) => ({ ...prev, isPlaying: false }));
                }}
                className="md:size-12 size-10 lg:size-14 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors shadow-lg touch-none"
                aria-label="Get Hint"
                title="Get Hint"
              >
                <Lightbulb className="lg:size-10 md:size-8 size-7 text-white" />
              </button>
            </DialogTrigger>
          )}
        </div>
        <DialogContent className="md:max-w-80 max-w-72 lg:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0">
          {/* Fixed, compact title header */}
          <div className="p-2 h-10 w-full flex items-center justify-center bg-white z-10 px-3">
            <DialogTitle className="text-base font-semibold">
              {mode === "how" ? "How to Play" : "Hint Box"}
            </DialogTitle>
            {mode === "how" && (
              <DialogDescription className="sr-only">
                Connect the Dots game instructions
              </DialogDescription>
            )}
          </div>
          {/* Only this content area scrolls; footer stays visible */}
          <div
            className={`flex-1 ${
              mode === "how" ? "border-y" : ""
            } overflow-y-scroll overflow-x-hidden custom-scroll p-2`}
          >
            {mode === "how" ? (
              <ul className="text-left inline-block mx-auto text-base text-gray-700 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-6 text-center">🔢</span>
                  <span>
                    <b>Look</b> at the numbered dots.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-6 text-center">✍️</span>
                  <span>
                    <b>Connect</b> them in order — 1, 2, 3, and so on.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-6 text-center">🔄 </span>
                  <span>
                    When you reach the last dot, join it back to <b>1</b>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-6 text-center">🎉</span>
                  <span>Connect all the dots to complete the picture!</span>
                </li>
              </ul>
            ) : (
              <DialogDescription
                className="text-black text-center"
                style={{ whiteSpace: "pre-line" }}
              >
                {hint || "No help is available for this game."}
              </DialogDescription>
            )}
          </div>
          <DialogFooter className="justify-center bg-white/80 p-1">
            <DialogClose
              onClick={() => {
                setGameState((prev) => ({ ...prev, isPlaying: true }));
                play();
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-blue-400/40 focus-visible:ring-blue-400/40 focus-visible:ring-[3px] shadow-xs aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            >
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HintGuide;
