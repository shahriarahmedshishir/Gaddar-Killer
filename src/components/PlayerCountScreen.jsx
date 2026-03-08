import { useState } from "react";

export default function PlayerCountScreen({ onSelect }) {
  const [selected, setSelected] = useState(1);

  return (
    <div className="h-screen overflow-y-auto flex flex-col items-center justify-center p-6 bg-linear-to-br from-purple-950 via-red-950 to-orange-950">
      {/* Title */}
      <div className="text-center mb-10 select-none">
        <h1
          className="text-7xl font-black text-yellow-400 leading-none"
          style={{
            fontFamily: "'Bangers', 'Impact', 'Arial Black', sans-serif",
            letterSpacing: "0.06em",
            textShadow: "4px 4px 0px #92400e, 7px 7px 0px rgba(0,0,0,0.3)",
          }}
        >
          GADDAR
          <br />
          KILLER
        </h1>
        <p className="text-orange-300 text-lg font-semibold mt-3">
          The Ultimate Payback Game 💥
        </p>
      </div>

      {/* Card */}
      <div
        style={{ backgroundColor: "#030712", color: "#ffffff" }}
        className="bg-gray-950 rounded-3xl p-8 w-full max-w-sm border border-white/10 shadow-2xl"
      >
        <h2 className="text-white text-xl font-bold text-center mb-6">
          How many traitors to punish? 😤
        </h2>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setSelected(count)}
              style={{
                backgroundColor: selected === count ? "#f97316" : "#581c87",
                color: "#ffffff",
              }}
              className={[
                "aspect-square rounded-2xl text-4xl font-black transition-all duration-200 select-none",
                selected === count
                  ? "bg-orange-500 text-white scale-110 shadow-lg ring-4 ring-orange-300"
                  : "bg-purple-900 text-white hover:bg-purple-800 hover:scale-105 active:scale-95",
              ].join(" ")}
            >
              {count}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSelect(selected)}
          className="w-full py-4 bg-linear-to-r from-orange-500 to-red-600 text-white text-xl font-black rounded-2xl
                     hover:from-orange-400 hover:to-red-500 transition-all duration-200 hover:scale-105 active:scale-95
                     shadow-lg shadow-red-800/40 select-none"
        >
          Let's Go! 🔥
        </button>
      </div>

      <p className="text-white/50 text-xs mt-6">Progress saved automatically</p>
    </div>
  );
}
