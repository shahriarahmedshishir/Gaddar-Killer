import { useState, useRef } from "react";
import CharacterSVG from "./CharacterSVG";

// ── Drag-to-crop face modal ─────────────────────────────────────
function FaceCropModal({ imageSrc, panelId, onConfirm, onCancel }) {
  const containerRef = useRef();
  const [center, setCenter] = useState({ x: 0.5, y: 0.35 });
  const [radius, setRadius] = useState(0.28);
  const dragging = useRef(false);
  const lastPtr = useRef(null);
  const maskId = `crop-mask-${panelId}`;

  const onPointerDown = (e) => {
    dragging.current = true;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - lastPtr.current.x) / width;
    const dy = (e.clientY - lastPtr.current.y) / height;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    setCenter((p) => ({
      x: Math.max(radius, Math.min(1 - radius, p.x + dx)),
      y: Math.max(radius, Math.min(1 - radius, p.y + dy)),
    }));
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const handleConfirm = () => {
    const container = containerRef.current;
    if (!container) return;
    const { width: contW, height: contH } = container.getBoundingClientRect();
    const img = new Image();
    img.onload = () => {
      // Compute object-cover scale/offset so we map container → natural pixels
      const scale = Math.max(
        contW / img.naturalWidth,
        contH / img.naturalHeight,
      );
      const dispW = img.naturalWidth * scale;
      const dispH = img.naturalHeight * scale;
      const offX = (dispW - contW) / 2;
      const offY = (dispH - contH) / 2;

      const rPx = radius * contW;
      const srcR = rPx / scale;
      const srcCx = (center.x * contW + offX) / scale;
      const srcCy = (center.y * contH + offY) / scale;

      const OUT = 320;
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      canvas
        .getContext("2d")
        .drawImage(
          img,
          srcCx - srcR,
          srcCy - srcR,
          srcR * 2,
          srcR * 2,
          0,
          0,
          OUT,
          OUT,
        );
      onConfirm(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-purple-950 rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 border border-white/20 shadow-2xl">
        <h3 className="text-white font-black text-lg text-center">
          🖱️ Drag circle over your face
        </h3>

        {/* Image + overlay */}
        <div
          ref={containerRef}
          className="relative select-none rounded-xl overflow-hidden"
          style={{ aspectRatio: "1" }}
        >
          <img
            src={imageSrc}
            alt="crop"
            className="w-full h-full object-cover "
            draggable={false}
          />
          {/* SVG dim overlay with circle cut-out */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <mask id={maskId}>
                <rect width="100" height="100" fill="white" />
                <circle
                  cx={center.x * 100}
                  cy={center.y * 100}
                  r={radius * 100}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100"
              height="100"
              fill="rgba(0,0,0,0.55)"
              mask={`url(#${maskId})`}
            />
            <circle
              cx={center.x * 100}
              cy={center.y * 100}
              r={radius * 100}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </svg>
          {/* Transparent drag handle over the circle */}
          <div
            className="absolute rounded-full cursor-grab active:cursor-grabbing touch-none"
            style={{
              left: `${(center.x - radius) * 100}%`,
              top: `${(center.y - radius) * 100}%`,
              width: `${radius * 200}%`,
              height: `${radius * 200}%`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>

        {/* Circle size slider */}
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
            Circle Size
          </p>
          <input
            type="range"
            min="12"
            max="48"
            value={Math.round(radius * 100)}
            onChange={(e) => {
              const r = Number(e.target.value) / 100;
              setRadius(r);
              setCenter((p) => ({
                x: Math.max(r, Math.min(1 - r, p.x)),
                y: Math.max(r, Math.min(1 - r, p.y)),
              }));
            }}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            style={{ backgroundColor: "#1f2937", color: "#fff" }}
            className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{ backgroundColor: "#f97316", color: "#fff" }}
            className="flex-1 py-3 rounded-xl font-black transition-all active:scale-95"
          >
            Use This ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Per-player panel ────────────────────────────────────────────
function PlayerPanel({ config, onChange, playerId }) {
  const fileRef = useRef();
  const [cropSource, setCropSource] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCropSource(ev.target.result);
    reader.readAsDataURL(file);
  };

  const heightLabel =
    config.height < 33
      ? "Short 🤏"
      : config.height < 66
        ? "Medium 📏"
        : "Tall 🏀";
  const fatnessLabel =
    config.fatness < 33
      ? "Slim 🧘"
      : config.fatness < 66
        ? "Average 💪"
        : "Chubby 🍔";

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* ── Preview ── */}
        <div
          style={{ backgroundColor: "#111827" }}
          className="md:w-36 flex flex-col items-center justify-center gap-2
                      rounded-3xl p-4 border border-white/10 shrink-0"
        >
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            Preview
          </p>
          <CharacterSVG
            gender={config.gender}
            height={config.height}
            fatness={config.fatness}
            faceImage={config.faceImage}
            playerId={playerId}
          />
        </div>

        {/* ── Controls ── */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Gender */}
          <div
            style={{ backgroundColor: "#111827" }}
            className="rounded-2xl p-4 border border-white/10"
          >
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
              Gender
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "male", label: "Male", emoji: "👨" },
                { value: "female", label: "Female", emoji: "👩" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ gender: opt.value })}
                  style={{
                    backgroundColor:
                      config.gender === opt.value ? "#f97316" : "#581c87",
                    color: "#fff",
                  }}
                  className={[
                    "py-3 rounded-xl text-lg font-bold transition-all duration-200 select-none",
                    config.gender === opt.value
                      ? "ring-2 ring-orange-300 scale-105 shadow-md"
                      : "hover:scale-105",
                  ].join(" ")}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div
            style={{ backgroundColor: "#111827" }}
            className="rounded-2xl p-4 border border-white/10"
          >
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
              Height — <span className="text-orange-300">{heightLabel}</span>
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={config.height}
              onChange={(e) => onChange({ height: Number(e.target.value) })}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-white/30 text-xs mt-0.5">
              <span>Short</span>
              <span>Medium</span>
              <span>Tall</span>
            </div>
          </div>

          {/* Body Type */}
          <div
            style={{ backgroundColor: "#111827" }}
            className="rounded-2xl p-4 border border-white/10"
          >
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
              Body Type —{" "}
              <span className="text-orange-300">{fatnessLabel}</span>
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={config.fatness}
              onChange={(e) => onChange({ fatness: Number(e.target.value) })}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-white/30 text-xs mt-0.5">
              <span>Slim</span>
              <span>Average</span>
              <span>Chubby</span>
            </div>
          </div>

          {/* Face Upload */}
          <div
            style={{ backgroundColor: "#111827" }}
            className="rounded-2xl p-4 border border-white/10"
          >
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
              Face Photo (optional)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden bg-black "
            />
            <div className="flex gap-3 items-center">
              {config.faceImage && (
                <img
                  src={config.faceImage}
                  alt="face preview"
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-400 shrink-0"
                />
              )}
              <button
                onClick={() => fileRef.current.click()}
                style={{ backgroundColor: "#1f2937", color: "#fff" }}
                className="flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm active:scale-95"
              >
                {config.faceImage ? "📸 Change Photo" : "📸 Upload a Face"}
              </button>
              {config.faceImage && (
                <button
                  onClick={() => onChange({ faceImage: null })}
                  style={{ backgroundColor: "#7f1d1d", color: "#fca5a5" }}
                  className="py-2.5 px-3 rounded-xl font-semibold transition-all text-sm active:scale-95"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crop modal — rendered outside the card so it overlays everything */}
      {cropSource && (
        <FaceCropModal
          imageSrc={cropSource}
          panelId={playerId}
          onConfirm={(cropped) => {
            onChange({ faceImage: cropped });
            setCropSource(null);
            fileRef.current.value = "";
          }}
          onCancel={() => {
            setCropSource(null);
            fileRef.current.value = "";
          }}
        />
      )}
    </>
  );
}

// ── Main screen ─────────────────────────────────────────────────
export default function CharacterSetupScreen({ players, onSetupAll, onBack }) {
  const [configs, setConfigs] = useState(() =>
    players.map((p) => ({
      gender: p.gender ?? "male",
      height: p.height ?? 50,
      fatness: p.fatness ?? 50,
      faceImage: p.faceImage ?? null,
    })),
  );
  const [activeTab, setActiveTab] = useState(0);

  const updateConfig = (idx, patch) =>
    setConfigs((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    );

  return (
    <div className="h-screen overflow-y-auto flex flex-col bg-linear-to-br from-purple-950 via-red-950 to-orange-950">
      <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 p-4 pt-6">
        {/* Back button */}
        <button
          onClick={onBack}
          style={{ backgroundColor: "transparent", color: "#fff" }}
          className="self-start text-sm font-semibold transition-colors select-none px-2 py-1 mb-2"
        >
          ← Back
        </button>

        {/* Header */}
        <h2
          className="text-white text-2xl font-black text-center mb-4"
          style={{
            fontFamily: "'Bangers', 'Impact', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          Setup Your Players 🎮
        </h2>

        {/* Player Tabs */}
        {players.length > 1 && (
          <div className="flex gap-2 mb-4">
            {players.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  backgroundColor: activeTab === i ? "#f97316" : "#581c87",
                  color: "#fff",
                }}
                className={[
                  "flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-200 select-none flex items-center justify-center gap-1.5",
                  activeTab === i
                    ? "ring-2 ring-orange-300 scale-105 shadow-lg"
                    : "",
                ].join(" ")}
              >
                {configs[i].faceImage ? (
                  <img
                    src={configs[i].faceImage}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover inline-block mr-1.5 align-middle border border-white/40"
                  />
                ) : (
                  <span className="mr-1">
                    {configs[i].gender === "female" ? "👩" : "👨"}
                  </span>
                )}
                Player {i + 1}
                {configs[i].faceImage && (
                  <span className="ml-1 text-green-300 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Active player panel */}
        <PlayerPanel
          key={activeTab}
          config={configs[activeTab]}
          onChange={(patch) => updateConfig(activeTab, patch)}
          playerId={activeTab}
        />

        {/* Done button */}
        <button
          onClick={() => onSetupAll(configs)}
          style={{ backgroundColor: "#f97316", color: "#fff" }}
          className="mt-5 w-full py-4 bg-linear-to-r from-orange-500 to-red-600 text-xl font-black
                     rounded-2xl transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-lg shadow-red-800/40 select-none"
        >
          Choose Weapon! 🔫
        </button>
      </div>
    </div>
  );
}
