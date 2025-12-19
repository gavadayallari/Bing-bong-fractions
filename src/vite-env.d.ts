/// <reference types="vite/client" />

// Screen Orientation API types
interface ScreenOrientation extends EventTarget {
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
  readonly angle: number;
  readonly type: OrientationType;
}

type OrientationLockType = 
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

type OrientationType =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

interface Screen {
  orientation: ScreenOrientation;
}
