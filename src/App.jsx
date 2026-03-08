import { useState, useEffect } from "react";
import PlayerCountScreen from "./components/PlayerCountScreen";
import CharacterSetupScreen from "./components/CharacterSetupScreen";
import WeaponSelectScreen from "./components/WeaponSelectScreen";
import GameScreen from "./components/GameScreen";

const STORAGE_KEY = "gaddar-killer-v1";

const makeDefaultPlayers = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    gender: "male",
    height: 50,
    fatness: 50,
    faceImage: null,
  }));

const DEFAULT_STATE = {
  screen: "playerCount", // 'playerCount' | 'characterSetup' | 'weaponSelect' | 'game'
  playerCount: 1,
  currentPlayerIndex: 0,
  players: [],
  selectedWeapon: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full (large face images) — ignore silently
  }
}

export default function App() {
  const [state, setState] = useState(loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  // ── Screen handlers ───────────────────────────────────────────

  const handlePlayerCount = (count) => {
    update({
      playerCount: count,
      players: makeDefaultPlayers(count),
      currentPlayerIndex: 0,
      screen: "characterSetup",
    });
  };

  const handleCharacterSetup = (allConfigs) => {
    const newPlayers = state.players.map((p, i) => ({
      ...p,
      ...allConfigs[i],
    }));
    update({ players: newPlayers, screen: "weaponSelect" });
  };

  const handleWeaponSelect = (weapon) => {
    update({ selectedWeapon: weapon, screen: "game" });
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      {state.screen === "playerCount" && (
        <PlayerCountScreen onSelect={handlePlayerCount} />
      )}

      {state.screen === "characterSetup" && (
        <CharacterSetupScreen
          players={state.players}
          onSetupAll={handleCharacterSetup}
          onBack={() => update({ screen: "playerCount" })}
        />
      )}

      {state.screen === "weaponSelect" && (
        <WeaponSelectScreen
          onSelect={handleWeaponSelect}
          onBack={() => update({ screen: "characterSetup" })}
        />
      )}

      {state.screen === "game" && (
        <GameScreen
          players={state.players}
          weapon={state.selectedWeapon}
          onRestart={handleRestart}
          onBack={() => update({ screen: "weaponSelect" })}
        />
      )}
    </>
  );
}
