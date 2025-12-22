import { useState, useEffect, useMemo } from "react";

const GRID_SIZE = 5;

// -----------------------------------------
// FRACTION BOARDS – EXACTLY LIKE YOUR 3 IMAGES
// -----------------------------------------

const LEVELS = {
  1: {
    name: "Level 1",
    fractions: [
      // ROW 1
      { n: 1, d: 5 }, { n: 1, d: 5 }, { n: 3, d: 4 }, { n: 4, d: 5 }, { n: 1, d: 6 },
      // ROW 2
      { n: 3, d: 5 }, { n: 2, d: 5 }, { n: 1, d: 6 }, { n: 1, d: 3 }, { n: 5, d: 6 },
      // ROW 3
      { n: 1, d: 4 }, { n: 5, d: 6 }, { n: 2, d: 5 }, { n: 2, d: 5 }, { n: 2, d: 3 },
      // ROW 4
      { n: 4, d: 5 }, { n: 1, d: 3 }, { n: 1, d: 2 }, { n: 3, d: 4 }, { n: 1, d: 4 },
      // ROW 5
      { n: 2, d: 4 }, { n: 3, d: 5 }, { n: 1, d: 2 }, { n: 3, d: 5 }, { n: 2, d: 3 },
    ],
  },

  2: {
    name: "Level 2",
    fractions: [
      // ROW 1
      { n: 1, d: 4 }, { n: 1, d: 12 }, { n: 3, d: 8 }, { n: 2, d: 3 }, { n: 1, d: 4 },
      // ROW 2
      { n: 5, d: 8 }, { n: 3, d: 4 }, { n: 1, d: 3 }, { n: 1, d: 6 }, { n: 3, d: 8 },
      // ROW 3
      { n: 4, d: 5 }, { n: 2, d: 3 }, { n: 7, d: 12 }, { n: 1, d: 10 }, { n: 1, d: 10 },
      // ROW 4
      { n: 5, d: 8 }, { n: 3, d: 5 }, { n: 7, d: 12 }, { n: 1, d: 8 }, { n: 3, d: 10 },
      // ROW 5
      { n: 1, d: 12 }, { n: 11, d: 12 }, { n: 1, d: 2 }, { n: 5, d: 12 }, { n: 3, d: 4 },
    ],
  },

  3: {
    name: "Level 3",
    fractions: [
      // ROW 1
      { n: 4, d: 6 }, { n: 10, d: 12 }, { n: 4, d: 10 }, { n: 6, d: 8 }, { n: 4, d: 6 },
      // ROW 2
      { n: 6, d: 8 }, { n: 2, d: 10 }, { n: 2, d: 6 }, { n: 9, d: 12 }, { n: 8, d: 10 },
      // ROW 3
      { n: 2, d: 4 }, { n: 8, d: 12 }, { n: 3, d: 9 }, { n: 3, d: 9 }, { n: 1, d: 3 },
      // ROW 4
      { n: 4, d: 10 }, { n: 3, d: 12 }, { n: 2, d: 12 }, { n: 8, d: 12 }, { n: 7, d: 12 },
      // ROW 5
      { n: 2, d: 4 }, { n: 5, d: 12 }, { n: 10, d: 12 }, { n: 6, d: 9 }, { n: 3, d: 12 },
    ],
  },
};

// helper
function fractionValue(n: number, d: number) {
  return n / d;
}

// shuffle helper – returns a new shuffled copy of the array
function shuffleFractions(list: { n: number; d: number }[]) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

interface FractionBingoProps {
  isPlaying: boolean;
  onWin: () => void;
}

export default function FractionBingo({ isPlaying, onWin }: FractionBingoProps) {
  const [bingoLevel, setBingoLevel] = useState<1 | 2 | 3>(1);
  const [markedCorrect, setMarkedCorrect] = useState<boolean[]>(
    () => Array(25).fill(false)
  );
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number | null>(null);
  const [bingo, setBingo] = useState(false);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [boardFractions, setBoardFractions] = useState(
    () => shuffleFractions(LEVELS[1].fractions)
  );
  const [currentFoodImage, setCurrentFoodImage] = useState<number>(1);
  const [cellFoodImages, setCellFoodImages] = useState<{ [key: number]: number }>({});

  // Reset when component key changes (handled by parent via key prop)
  // Only start when isPlaying becomes true AND game state is fresh
  useEffect(() => {
    if (isPlaying) {
      // Only start if we don't have a current target (game hasn't started)
      if (currentTargetIndex === null) {
        startBingoLevel(1);
      }
    }
  }, [isPlaying]);

  function startBingoLevel(lvl: 1 | 2 | 3) {
    setBingoLevel(lvl);
    setBoardFractions(shuffleFractions(LEVELS[lvl].fractions));
    const fresh = Array(25).fill(false);
    setMarkedCorrect(fresh);
    setBingo(false);
    setShakeIndex(null);
    setWrongIndices([]); // Reset wrong indices
    setCellFoodImages({}); // Reset food images for cells
    // Set initial random food image
    const randomFood = Math.floor(Math.random() * 10) + 1;
    setCurrentFoodImage(randomFood);
    pickNewTarget(fresh);
  }

  function pickNewTarget(marks: boolean[]) {
    const available: number[] = [];
    for (let i = 0; i < 25; i++) {
      if (!marks[i]) available.push(i);
    }
    if (available.length === 0) {
      setCurrentTargetIndex(null);
      return;
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    setCurrentTargetIndex(idx);
    // Set random food image (1-10)
    const randomFood = Math.floor(Math.random() * 10) + 1;
    setCurrentFoodImage(randomFood);
  }

  const currentFraction =
    currentTargetIndex !== null ? boardFractions[currentTargetIndex] : null;

  // ticks based on denominator
  const ticks = useMemo(() => {
    if (!currentFraction) return [];
    const d = currentFraction.d;
    const arr = [];
    for (let i = 0; i <= d; i++) {
      const left = 4 + (i / d) * 92; // 0 -> 4%, 1 -> 96%
      arr.push({ key: i, left });
    }
    return arr;
  }, [currentFraction]);

  // pointer position
  const pointerLeft = useMemo(() => {
    if (!currentFraction) return 4;
    const v = fractionValue(currentFraction.n, currentFraction.d);
    return 4 + v * 92;
  }, [currentFraction]);

  function checkBingo(marks: boolean[]) {
    // rows
    for (let r = 0; r < GRID_SIZE; r++) {
      let all = true;
      for (let c = 0; c < GRID_SIZE; c++) {
        const idx = r * GRID_SIZE + c;
        if (!marks[idx]) {
          all = false;
          break;
        }
      }
      if (all) return true;
    }
    // columns
    for (let c = 0; c < GRID_SIZE; c++) {
      let all = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        const idx = r * GRID_SIZE + c;
        if (!marks[idx]) {
          all = false;
          break;
        }
      }
      if (all) return true;
    }
    return false;
  }

  function handleCellClick(idx: number) {
    if (bingo || currentTargetIndex === null || !isPlaying) return;

    const chosen = boardFractions[idx];
    const target = boardFractions[currentTargetIndex];

    const isCorrect = chosen.n === target.n && chosen.d === target.d;

    if (isCorrect) {
      // Clear wrong indicators when correct answer is selected
      setShakeIndex(null);
      setWrongIndices([]);
      
      // Store the current food image for this correct cell
      setCellFoodImages(prev => ({
        ...prev,
        [idx]: currentFoodImage
      }));
      
      setMarkedCorrect(prev => {
        if (prev[idx]) return prev;
        const updated = [...prev];
        updated[idx] = true;

        if (checkBingo(updated)) {
          setBingo(true);
          setCurrentTargetIndex(null);
          // Trigger win after a short delay
          setTimeout(() => {
            onWin();
          }, 1000);
        } else {
          // Immediately move to the next point without extra message or button.
          pickNewTarget(updated);
        }
        return updated;
      });
    } else {
      // Add this wrong index to the list
      setWrongIndices(prev => {
        const newIndices = [...prev, idx];
        
        // If 3 wrong attempts, restart the game
        if (newIndices.length >= 3) {
          setTimeout(() => {
            startBingoLevel(bingoLevel);
          }, 800);
          return []; // Reset indices
        }
        return newIndices;
      });
      
      setShakeIndex(idx);
      // Keep wrong indicators visible until correct answer
    }
  }

  return (
    <div className="flex p-2 sm:p-3 md:p-4 lg:p-5 max-w-5xl w-full gap-2 sm:gap-3 md:gap-4 fraction-bingo-container">
      {/* LEFT LEVEL CONTAINERS (Diamond-shaped) */}
      <div className="flex flex-col gap-0 mt-[20px] sm:mt-[30px] md:mt-[40px] ml-[-60px] sm:ml-[-90px] md:ml-[-120px] lg:ml-[-150px]">
        {[1, 2, 3].map(lvl => (
          <button
            key={lvl}
            type="button"
            onClick={() => startBingoLevel(lvl as 1 | 2 | 3)}
            disabled={!isPlaying}
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center cursor-pointer transition relative ${
              bingoLevel === lvl
                ? "scale-105"
                : "opacity-70"
            } ${!isPlaying ? "opacity-50 cursor-not-allowed" : ""} ${lvl > 1 ? '-mt-2 sm:-mt-3 md:-mt-4' : ''}`}
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              marginLeft: lvl === 2 ? '40px' : '0px',
            }}
          >
            <img 
              src={`images/svg/level ${lvl}.svg`}
              alt={`Level ${lvl}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1">
        {/* NUMBER LINE */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 number-line-container">
          <div className="relative w-full max-w-xl h-8 sm:h-9 md:h-10">
            {/* main horizontal line */}
            <div className="absolute left-[4%] right-[4%] top-[-50px] sm:top-[-70px] md:top-[-100px] h-0.5 sm:h-1 bg-white -translate-y-1/2" />

            {/* ticks */}
            <div className="absolute inset-0">
              {ticks.map(t => (
                <div
                  key={t.key}
                  className="tick tick-responsive bg-white"
                  style={{ left: `${t.left}%` }}
                />
              ))}
            </div>

            {/* 0 label below first tick */}
            <span 
              className="absolute text-sm sm:text-base md:text-lg font-bold text-white"
              style={{ 
                left: '4%',
                top: '-80px',
                transform: 'translateX(-50%)'
              }}
            >
              0
            </span>

            {/* 1 label below last tick */}
            <span 
              className="absolute text-sm sm:text-base md:text-lg font-bold text-white"
              style={{ 
                left: '96%',
                top: '-80px',
                transform: 'translateX(-50%)'
              }}
            >
              1
            </span>

            {/* orange pointer */}
            {currentFraction && isPlaying && (
              <>
                {/* Orange vertical marker on number line */}
                <div
                  className="pointer-tick pointer-tick-responsive"
                  style={{ left: `${pointerLeft}%` }}
                />
                {/* Food image below orange marker with yellow glow */}
                <div
                  className="absolute food-image-on-line"
                  style={{ 
                    left: `${pointerLeft}%`,
                    top: '-85px',
                    transform: 'translateX(-40%)',
                    filter: 'drop-shadow(0 0 15px rgba(255, 235, 59, 0.8))'
                  }}
                >
                  <img
                    src={`images/svg/food ${currentFoodImage}.svg`}
                    alt={`Food ${currentFoodImage}`}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
                  />
                </div>
              </>
            )}
          </div>
        </div>


        {/* BINGO GRID 5x5 */}
        <div className="flex justify-center items-start gap-2 sm:gap-3 md:gap-4 mt-[-40px] sm:mt-[-60px] md:mt-[-80px] bingo-grid-wrapper">
          <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4 p-1 rounded-lg">
            {boardFractions.map((frac, idx) => {
              const isCorrect = markedCorrect[idx];
              const isWrong = wrongIndices.includes(idx);
              const disabled = isCorrect || bingo || !isPlaying;
              const isShaking = shakeIndex === idx;

              const base =
                "flex items-center justify-center cursor-pointer transition-colors relative bg-cover bg-center bg-no-repeat bingo-cell";
              const correctClass = isCorrect ? "cursor-default opacity-80" : "";
              const disabledClass = disabled ? "cursor-default opacity-70" : "";
              const shakeClass = isShaking ? "animate-shake" : "";

              // Determine background image
              let backgroundImage = `url('images/svg/Property 1=nutral.png')`;
              let cellStyle: React.CSSProperties = {
                backgroundImage: backgroundImage,
                position: 'relative',
              };
              let showFoodImage = false;

              if (isCorrect) {
                // Show the same food image as was on number line when clicked
                showFoodImage = true;
                backgroundImage = `url('images/svg/Property 1=correct.png')`;
                cellStyle.backgroundImage = backgroundImage;
              } else if (isWrong) {
                // Red circular badge style matching the image
                cellStyle = {
                  ...cellStyle,
                  backgroundImage: 'none',
                  backgroundColor: '#ff6b9d', // Light translucent reddish-pink inner
                  borderRadius: '50%',
                  border: '3px solid #ff0000', // Bright red outline - more vibrant
                  boxShadow: `
                    inset 0 0 0 2px rgba(255, 0, 0, 0.4),
                    0 0 0 2px rgba(255, 255, 255, 0.9)
                  `, // Darker ring and white outline
                };
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCellClick(idx)}
                  className={`${base} ${correctClass} ${disabledClass} ${shakeClass}`}
                  style={cellStyle}
                >
                  {/* Wrong X icon overlay */}
                  {isWrong && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center z-20"
                      style={{
                        pointerEvents: 'none'
                      }}
                    >
                      <svg 
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                        viewBox="0 0 60 60" 
                        fill="none"
                        style={{
                          filter: 'drop-shadow(0 0 3px rgba(255, 107, 157, 0.6))'
                        }}
                      >
                        <path
                          d="M12 12 L48 48 M48 12 L12 48"
                          stroke="white"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  
                  {/* Food image overlay for correct answers - same as number line */}
                  {showFoodImage && cellFoodImages[idx] && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center z-15"
                      style={{
                        pointerEvents: 'none'
                      }}
                    >
                      <img
                        src={`images/svg/food ${cellFoodImages[idx]}.svg`}
                        alt={`Food ${cellFoodImages[idx]}`}
                        className="object-contain w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 235, 59, 0.6))'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Fraction text - hide when showing food image */}
                  {!showFoodImage && (
                    <div className={`text-center text-sm sm:text-base md:text-lg lg:text-xl leading-tight relative z-10 ${isWrong ? 'text-red-900' : 'text-black'}`}>
                      <span className="block">{frac.n}</span>
                      <div className={`h-0.5 w-full my-0.1 ${isWrong ? 'bg-red-900' : 'bg-black'}`} />
                      <span className="block">{frac.d}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side message - outside grid box */}
        <div className="flex justify-end items-center mt-[-150px] sm:mt-[-200px] md:mt-[-250px] lg:mt-[-300px] mr-[-40px] sm:mr-[-60px] md:mr-[-80px] lg:mr-[-100px] bingo-right-text">
          <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold italic" style={{ fontFamily: 'serif' }}>
            {/* "what's that fraction" */}
          </p>
        </div>

        {/* BINGO BANNER */}
        {/* {bingo && (
          <div className="mt-4 flex justify-center items-center gap-1 animate-pop">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md border-4 border-black bg-[#8a2be2] text-white text-3xl sm:text-4xl font-extrabold">
              B
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md border-4 border-black bg-[#007b7f] text-white text-3xl sm:text-4xl font-extrabold">
              I
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md border-4 border-black bg-[#c00062] text-white text-3xl sm:text-4xl font-extrabold">
              N
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md border-4 border-black bg-[#ff7a19] text-white text-3xl sm:text-4xl font-extrabold">
              G
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md border-4 border-black bg-[#0075ff] text-white text-3xl sm:text-4xl font-extrabold">
              O
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

