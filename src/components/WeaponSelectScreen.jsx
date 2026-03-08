import { useState } from "react";
import { WEAPONS } from "../data/weapons";

export default function WeaponSelectScreen({ onSelect, onBack }) {
  const [selected, setSelected] = useState(WEAPONS[0].id);

  return (
    <div className="h-screen overflow-y-auto flex flex-col items-center justify-center p-6 bg-linear-to-br from-purple-950 via-red-950 to-orange-950">
      <div className="w-full max-w-lg flex items-center mb-2">
        <button
          onClick={onBack}
          style={{ backgroundColor: "transparent", color: "#fff" }}
          className="text-white/50 hover:text-white text-sm font-semibold transition-colors select-none px-2 py-1"
        >
          ← Back
        </button>
      </div>
      <h1
        className="text-5xl font-black text-yellow-400 mb-2 text-center"
        style={{
          fontFamily: "'Bangers', 'Impact', 'Arial Black', sans-serif",
          letterSpacing: "0.06em",
          textShadow: "3px 3px 0px #92400e",
        }}
      >
        Choose Your Weapon!
      </h1>
      <p className="text-orange-300 mb-8 text-center font-semibold">
        Choose wisely... 😈
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 w-full max-w-lg">
        {WEAPONS.map((weapon) => (
          <button
            key={weapon.id}
            onClick={() => setSelected(weapon.id)}
            style={{
              backgroundColor: selected === weapon.id ? "#f97316" : "#581c87",
              color: "#fff",
            }}
            className={[
              "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200 select-none",
              selected === weapon.id
                ? "ring-4 ring-orange-300 scale-110 shadow-xl shadow-orange-800/50"
                : "hover:scale-105 active:scale-95",
            ].join(" ")}
          >
            <span className="text-5xl leading-none">{weapon.emoji}</span>
            <span className="text-white font-bold text-sm">{weapon.name}</span>
            <span className="text-white/60 text-xs text-center leading-tight">
              {weapon.description}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => onSelect(selected)}
        style={{ backgroundColor: "#f97316", color: "#fff" }}
        className="w-full max-w-lg py-4 bg-linear-to-r from-orange-500 to-red-600 text-white text-xl font-black
                   rounded-2xl hover:from-orange-400 hover:to-red-500 transition-all duration-200
                   hover:scale-105 active:scale-95 shadow-lg shadow-red-800/40 select-none"
      >
        Start Punishing! 💥
      </button>
    </div>
  );
}
