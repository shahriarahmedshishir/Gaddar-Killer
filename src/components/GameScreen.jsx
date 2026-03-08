import { useState, useCallback } from "react";
import CharacterSVG from "./CharacterSVG";
import { WEAPONS } from "../data/weapons";

const QUOTES = [
  "I will never do it again! 😭",
  "Please forgive me!! 😢",
  "I'm so sorry, I was wrong! 💔",
  "I promise I will change! 😭",
  "No more, never again! 🙏",
  "I beg you, stop! 😭",
  "I'll behave forever! 😿",
];

// ── Each player's reaction state lives here ──────────────────────
const makeInitialStates = (players) =>
  Object.fromEntries(players.map((p) => [p.id, "idle"]));
// states: 'idle' | 'throwing' | 'hit' | 'crying'

export default function GameScreen({
  players,
  weapon: initialWeapon,
  onRestart,
  onBack,
}) {
  const [states, setStates] = useState(() => makeInitialStates(players));
  const [hitCounts, setHitCounts] = useState(() =>
    Object.fromEntries(players.map((p) => [p.id, 0])),
  );
  const [showQuotes, setShowQuotes] = useState(() =>
    Object.fromEntries(players.map((p) => [p.id, false])),
  );
  const [currentWeapon, setCurrentWeapon] = useState(initialWeapon);
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);

  const weaponData = WEAPONS.find((w) => w.id === currentWeapon) ?? WEAPONS[0];

  const isAnyAnimating = Object.values(states).some(
    (s) => s === "throwing" || s === "hit",
  );

  const throwAt = useCallback(
    (playerId) => {
      if (isAnyAnimating) return;

      // reset quote briefly so pop-in re-triggers
      setShowQuotes((prev) => ({ ...prev, [playerId]: false }));
      setStates((prev) => ({ ...prev, [playerId]: "throwing" }));

      // weapon lands → shake
      setTimeout(() => {
        setStates((prev) => ({ ...prev, [playerId]: "hit" }));
        setHitCounts((prev) => ({ ...prev, [playerId]: prev[playerId] + 1 }));

        // crying begins
        setTimeout(() => {
          setStates((prev) => ({ ...prev, [playerId]: "crying" }));
          setShowQuotes((prev) => ({ ...prev, [playerId]: true }));
        }, 480);
      }, 720);
    },
    [isAnyAnimating],
  );

  const quoteForPlayer = (id) =>
    QUOTES[hitCounts[id] % QUOTES.length] ?? QUOTES[0];

  return (
    <div className="h-screen overflow-y-auto flex flex-col bg-linear-to-br from-purple-950 via-red-950 to-orange-950">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          style={{ backgroundColor: "transparent", color: "#fff" }}
          className="text-sm font-semibold transition-colors select-none px-2 py-1"
        >
          ← Back
        </button>

        <h1
          className="text-3xl font-black text-yellow-400 select-none"
          style={{
            fontFamily: "'Bangers', 'Impact', 'Arial Black', sans-serif",
            letterSpacing: "0.06em",
            textShadow: "2px 2px 0px #92400e",
          }}
        >
          GADDAR KILLER
        </h1>

        <button
          onClick={onRestart}
          style={{ backgroundColor: "transparent", color: "#fff" }}
          className="text-sm font-semibold transition-colors select-none px-2 py-1"
        >
          🔄 Restart
        </button>
      </div>

      {/* ── Weapon indicator + inline picker ── */}
      <div className="px-4 pb-3 flex flex-col items-center gap-2">
        <button
          onClick={() => setWeaponPickerOpen((x) => !x)}
          style={{ backgroundColor: "#111827", color: "#fff" }}
          className="rounded-full px-5 py-2 border border-white/10 font-semibold text-sm transition-all select-none"
        >
          {weaponData.emoji} {weaponData.name}
          <span className="text-white/40 ml-2 text-xs">tap to swap</span>
        </button>

        {weaponPickerOpen && (
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {WEAPONS.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setCurrentWeapon(w.id);
                  setWeaponPickerOpen(false);
                }}
                style={{
                  backgroundColor:
                    w.id === currentWeapon ? "#f97316" : "#1f2937",
                  color: "#fff",
                }}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-bold transition-all select-none",
                  w.id === currentWeapon
                    ? "scale-105 ring-2 ring-orange-300"
                    : "",
                ].join(" ")}
              >
                {w.emoji} {w.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Characters area ── */}
      <div className="flex-1 flex items-center justify-around gap-4 flex-wrap px-6">
        {players.map((player) => {
          const state = states[player.id];
          const isCrying = state === "crying";
          const isHit = state === "hit";
          const isThrowing = state === "throwing";

          return (
            <div
              key={player.id}
              className="flex flex-col items-center gap-2 relative flex-1"
              style={{ minWidth: "180px", maxWidth: "480px" }}
            >
              {/* hit count badge */}
              {hitCounts[player.id] > 0 && (
                <div
                  className="absolute -top-1 -right-1 z-20 bg-red-500 text-white
                             rounded-full w-6 h-6 flex items-center justify-center
                             text-xs font-black border-2 border-red-800 select-none"
                >
                  {hitCounts[player.id]}
                </div>
              )}

              {/* quote bubble — key forces re-mount (and animation restart) on each new hit */}
              <div
                key={`quote-${player.id}-${hitCounts[player.id]}`}
                className={[
                  "bg-yellow-300 text-gray-900 rounded-2xl px-3 py-2 text-sm font-black",
                  "text-center max-w-40 shadow-lg relative select-none",
                  showQuotes[player.id] ? "anim-pop-in" : "opacity-0 scale-0",
                ].join(" ")}
              >
                {quoteForPlayer(player.id)}
                {/* speech bubble tail */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid #fde047",
                  }}
                />
              </div>

              {/* flying weapon */}
              <div className="relative">
                {isThrowing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    style={{ top: "-10px" }}
                  >
                    <span className="text-5xl anim-fly leading-none select-none">
                      {weaponData.emoji}
                    </span>
                  </div>
                )}

                {/* character */}
                <div className={isHit ? "anim-shake" : ""}>
                  <CharacterSVG
                    gender={player.gender}
                    height={player.height}
                    fatness={player.fatness}
                    faceImage={player.faceImage}
                    playerId={player.id}
                    isCrying={isCrying}
                    isHit={isHit}
                  />
                </div>
              </div>

              {/* player label */}
              <p className="text-white/50 text-xs font-semibold select-none">
                {player.name ?? `Player ${player.id + 1}`}
              </p>

              {/* THROW button */}
              <button
                onClick={() => throwAt(player.id)}
                disabled={isAnyAnimating}
                style={{
                  backgroundColor: isAnyAnimating ? "#1f2937" : "#ef4444",
                  color: isAnyAnimating ? "rgba(255,255,255,0.3)" : "#fff",
                }}
                className={[
                  "px-5 py-3 font-black rounded-xl text-sm transition-all duration-150 select-none",
                  "shadow-lg active:scale-95",
                  isAnyAnimating
                    ? "cursor-not-allowed"
                    : "hover:scale-105 shadow-red-800/40",
                ].join(" ")}
              >
                {weaponData.emoji} THROW!
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
