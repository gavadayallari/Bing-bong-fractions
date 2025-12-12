export type GameStateType = {
  isPlaying: boolean;
  isMuted: boolean;
  hasWon: boolean;
  hasTimeUp: boolean;
  hasStarted: boolean;
  timeLeft: number;
  duration: number;
};

export type GameConfigType = {
  successMessages: string[];
  incorrectMessages: string[];
  levelWinMessages: string[];
  showRestartButton: boolean;
  showAnswers: boolean;
  title: string;
  description?: string;
  instructions: string;
  duration: number; // in seconds
  background:string;
  customAssets: AssetType[];
  audio: {
    instructions: {
      src: string;
    } | null;
  };
};

export type AssetType = {
  isUploadedImage?: boolean;
  src: string;
  title: string;
  isWebImage?: boolean;
};

export type Tags = {
  id: string;
  name: string;
  UID: string;
};
