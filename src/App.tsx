import GamePreview from "./pages/GamePreview";
import { useCallback, useState } from "react";
import type { GameConfigType } from "./types/TGames";
import defaultConfig from "./config/defaultConfig.json";

export type RefType = {
  triggerSave: () => Promise<GameConfigType | null>;
  triggerSaveAsDraft: () => Promise<GameConfigType | null>;
  captureScreenShot?: () => Promise<string | undefined>;
};

function App() {
  // Standalone mode: use defaultConfig directly, no remote config or query params
  const [config] = useState<GameConfigType>(defaultConfig as GameConfigType);
  const gameID = "demo-preview";

  const sendDataToParent = useCallback(
    (status: {
      currentLevel: number;
      score: number | null;
      timePlayed: number;
      gameEnded: boolean;
      totalLevels: number;
      isLastLevel: boolean;
    }) => {
      try {
        (window as any)?.flutter_inappwebview?.callHandler(
          "gameStatus",
          status
        );
      } catch (error) {
        console.error("Failed to send data to Flutter", error);
      }
    },
    []
  );

  return (
    <GamePreview
      gameId={gameID}
      config={config}
      sendDataToParent={sendDataToParent}
    />
  );
}

export default App;
