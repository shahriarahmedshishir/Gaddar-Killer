/**
 * CharacterSVG — cartoon character that reacts to being hit
 * Props:
 *  gender    : 'male' | 'female'
 *  height    : 0–100
 *  fatness   : 0–100
 *  faceImage : base64 data URL or null
 *  playerId  : number (used for unique SVG clip-path id)
 *  isCrying  : boolean
 *  isHit     : boolean
 */
export default function CharacterSVG({
  gender = "male",
  height = 50,
  fatness = 50,
  faceImage = null,
  playerId = 0,
  isCrying = false,
  isHit = false,
}) {
  // ── Derived dimensions ────────────────────────────────────────
  const fatF = fatness / 100; // 0 → slim, 1 → fat
  const htF = height / 100; // 0 → short, 1 → tall

  const cx = 55; // horizontal centre of the 110-wide viewBox

  const headR = Math.round(22 + fatF * 5); // 22 – 27
  const headCY = headR + 7;

  const bodyW = Math.round(30 + fatF * 30); // 30 – 60
  const bodyH = Math.round(50 + htF * 22); // 50 – 72
  const bodyX = cx - bodyW / 2;
  const bodyY = headCY + headR + 13;

  const armW = Math.round(10 + fatF * 9); // 10 – 19
  const armH = Math.round(bodyH * 0.78);
  const armY = bodyY + 6;
  const lArmX = bodyX - armW - 2;
  const rArmX = bodyX + bodyW + 2;

  const legW = Math.round(12 + fatF * 8); // 12 – 20
  const legH = Math.round(50 + htF * 22); // 50 – 72
  const legsY = bodyY + bodyH - 3;
  const lLegX = bodyX + 3;
  const rLegX = bodyX + bodyW - legW - 3;

  const totalH = legsY + legH + 16;

  // ── Colours ───────────────────────────────────────────────────
  const skin = "#F5C5A3";
  const hair = gender === "male" ? "#1a1228" : "#5c2900";
  const shirt = gender === "male" ? "#3B82F6" : "#EC4899";
  const bottom = gender === "male" ? "#1F2937" : "#7C3AED";
  const shoeC = "#111";

  const clipId = `faceClip-${playerId}`;

  // eye / mouth coordinates relative to head centre
  const eyeLX = cx - 8;
  const eyeRX = cx + 8;
  const eyeY = headCY + 2;
  const mouthY = headCY + 12;
  const noseY = headCY + 7;

  return (
    <svg
      viewBox={`0 0 110 ${totalH}`}
      className={`w-auto transition-all duration-200`}
      style={{
        height: "clamp(260px, 48vh, 520px)",
        maxHeight: "clamp(260px, 48vh, 520px)",
        filter: isHit
          ? "drop-shadow(0 0 12px #ef4444)"
          : "drop-shadow(0 3px 8px rgba(0,0,0,0.35))",
      }}
      aria-label="Character"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={headCY} r={headR - 2} />
        </clipPath>
      </defs>

      {/* ── Hair (behind head) ── */}
      {gender === "male" ? (
        <ellipse
          cx={cx}
          cy={headCY - headR + 4}
          rx={headR + 1}
          ry={headR * 0.65}
          fill={hair}
        />
      ) : (
        <>
          <ellipse
            cx={cx}
            cy={headCY - headR + 4}
            rx={headR + 3}
            ry={headR * 0.75}
            fill={hair}
          />
          {/* long side locks */}
          <rect
            x={cx - headR - 8}
            y={headCY - 8}
            width={10}
            height={55}
            rx={5}
            fill={hair}
          />
          <rect
            x={cx + headR - 2}
            y={headCY - 8}
            width={10}
            height={55}
            rx={5}
            fill={hair}
          />
        </>
      )}

      {/* ── Head ── */}
      <circle cx={cx} cy={headCY} r={headR} fill={skin} />

      {/* ── Face: photo OR drawn ── */}
      {faceImage ? (
        <>
          <image
            href={faceImage}
            x={cx - headR + 2}
            y={headCY - headR + 2}
            width={(headR - 2) * 2}
            height={(headR - 2) * 2}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
          {/* tears overlaid on photo when crying */}
          {isCrying && (
            <>
              <ellipse
                cx={eyeLX}
                cy={eyeY + 9}
                rx={2.5}
                ry={4}
                fill="#93C5FD"
                opacity="0.9"
              />
              <ellipse
                cx={eyeRX}
                cy={eyeY + 9}
                rx={2.5}
                ry={4}
                fill="#93C5FD"
                opacity="0.9"
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* Eyes */}
          {isCrying ? (
            <>
              <ellipse cx={eyeLX} cy={eyeY} rx={4} ry={5} fill="#222" />
              <ellipse cx={eyeRX} cy={eyeY} rx={4} ry={5} fill="#222" />
              {/* tear streaks */}
              <ellipse
                cx={eyeLX}
                cy={eyeY + 9}
                rx={2.5}
                ry={4}
                fill="#93C5FD"
              />
              <ellipse
                cx={eyeRX}
                cy={eyeY + 9}
                rx={2.5}
                ry={4}
                fill="#93C5FD"
              />
            </>
          ) : (
            <>
              <ellipse cx={eyeLX} cy={eyeY} rx={4.5} ry={4.5} fill="#222" />
              <ellipse cx={eyeRX} cy={eyeY} rx={4.5} ry={4.5} fill="#222" />
              {/* eye shine */}
              <circle cx={eyeLX + 1.5} cy={eyeY - 1.5} r={1.5} fill="white" />
              <circle cx={eyeRX + 1.5} cy={eyeY - 1.5} r={1.5} fill="white" />
            </>
          )}

          {/* Nose */}
          <circle cx={cx} cy={noseY} r={2} fill="#e8a090" />

          {/* Mouth */}
          {isCrying ? (
            /* sad mouth */
            <path
              d={`M${cx - 8} ${mouthY + 2} Q${cx} ${mouthY - 3} ${cx + 8} ${mouthY + 2}`}
              stroke="#c0392b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            /* happy mouth */
            <path
              d={`M${cx - 8} ${mouthY - 2} Q${cx} ${mouthY + 5} ${cx + 8} ${mouthY - 2}`}
              stroke="#c0392b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </>
      )}

      {/* ── Neck ── */}
      <rect
        x={cx - 5}
        y={headCY + headR - 2}
        width={10}
        height={14}
        fill={skin}
      />

      {/* ── Shirt / Torso ── */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        rx={7}
        fill={shirt}
      />

      {/* ── Arms ── */}
      <rect
        x={lArmX}
        y={armY}
        width={armW}
        height={armH}
        rx={armW / 2}
        fill={skin}
      />
      <rect
        x={rArmX}
        y={armY}
        width={armW}
        height={armH}
        rx={armW / 2}
        fill={skin}
      />

      {/* ── Lower body ── */}
      {gender === "female" ? (
        /* flared skirt */
        <path
          d={`M${bodyX} ${legsY} L${bodyX - 12} ${legsY + legH * 0.6} L${bodyX + bodyW + 12} ${legsY + legH * 0.6} L${bodyX + bodyW} ${legsY} Z`}
          fill={bottom}
        />
      ) : (
        /* pants */
        <>
          <rect
            x={lLegX}
            y={legsY}
            width={legW}
            height={legH}
            rx={legW / 2}
            fill={bottom}
          />
          <rect
            x={rLegX}
            y={legsY}
            width={legW}
            height={legH}
            rx={legW / 2}
            fill={bottom}
          />
        </>
      )}

      {/* ── Shoes (male only, female skirt hides feet) ── */}
      {gender === "male" && (
        <>
          <ellipse
            cx={lLegX + legW / 2}
            cy={legsY + legH}
            rx={legW / 2 + 4}
            ry={5}
            fill={shoeC}
          />
          <ellipse
            cx={rLegX + legW / 2}
            cy={legsY + legH}
            rx={legW / 2 + 4}
            ry={5}
            fill={shoeC}
          />
        </>
      )}

      {/* ── Pain stars when hit ── */}
      {isHit && (
        <>
          <text
            x={bodyX - 10}
            y={bodyY - 5}
            fontSize="12"
            className="anim-float-up"
          >
            💥
          </text>
          <text
            x={cx - 5}
            y={bodyY - 18}
            fontSize="10"
            className="anim-float-up"
            style={{ animationDelay: "0.1s" }}
          >
            ⭐
          </text>
          <text
            x={bodyX + bodyW}
            y={bodyY - 8}
            fontSize="10"
            className="anim-float-up"
            style={{ animationDelay: "0.2s" }}
          >
            ✨
          </text>
        </>
      )}
    </svg>
  );
}
