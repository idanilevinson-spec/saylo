"use client";

import { motion } from "framer-motion";

export type AvatarExpression = "idle" | "listening" | "thinking" | "speaking" | "error";
export type AvatarGender = "female" | "male";

interface SayloAvatarProps {
  expression: AvatarExpression;
  gender?: AvatarGender;
  /** Azure's raw viseme ID from the actual speech audio (0 = silence,
   *  1-21 each map to a phoneme's mouth shape — see MOUTH_POSE below).
   *  When provided during "speaking", the mouth morphs through the real
   *  shapes as they're actually said — omit it (the static chat-bubble
   *  avatar has no audio playing) to fall back to a decorative loop. */
  visemeId?: number;
  size?: number;
  className?: string;
}

const FEATURE = "#3a2a20";
const LIP = "#c06f5e";

// A handful of visually distinct mouth poses rather than one shape per
// viseme ID — plenty for a 200px illustrated face, where "ɔ" and "u"
// would look identical anyway. cy/rx/ry describe the open-mouth ellipse;
// teeth fades in for poses where the teeth would actually show.
const MOUTH_POSE = {
  closed: { rx: 6, ry: 0.6, cy: 60, teeth: 0 }, // 0 silence, 21 p/b/m
  wide: { rx: 5.5, ry: 6.4, cy: 61, teeth: 0.9 }, // 2 ɑ, 9 aʊ, 11 aɪ
  round: { rx: 3.2, ry: 4, cy: 60.5, teeth: 0.15 }, // 3 ɔ, 7 w/u, 8 o, 10 ɔɪ, 13 ɹ
  narrow: { rx: 7.2, ry: 1.8, cy: 59.5, teeth: 0.85 }, // 15 s/z, 16 sh/ch, 19 t/d/n
  mid: { rx: 6.2, ry: 4.4, cy: 60, teeth: 0.7 }, // everything else — the general "talking" shape
} as const;
type MouthPoseKey = keyof typeof MOUTH_POSE;

const VISEME_POSE: Record<number, MouthPoseKey> = {
  0: "closed",
  2: "wide",
  3: "round",
  7: "round",
  8: "round",
  9: "wide",
  10: "round",
  11: "wide",
  13: "round",
  15: "narrow",
  16: "narrow",
  19: "narrow",
  21: "closed",
};

function poseForViseme(id: number): MouthPoseKey {
  return VISEME_POSE[id] ?? "mid";
}

// Decorative cadence for when there's no live viseme feed — cycles
// through the same shape set so the fallback still looks like it's
// forming different sounds instead of just flapping open and shut.
const DECORATIVE_POSES: MouthPoseKey[] = ["closed", "mid", "wide", "round", "mid", "narrow", "closed"];

const GENDER_STYLE: Record<
  AvatarGender,
  { skinBase: string; skinLight: string; hair: string; hairShine: string; browWeight: number }
> = {
  female: { skinBase: "#f0b78a", skinLight: "#fbd7ab", hair: "#5a3624", hairShine: "#8a5a3a", browWeight: 2 },
  male: { skinBase: "#e4a67c", skinLight: "#f6c99b", hair: "#2a1d15", hairShine: "#48331f", browWeight: 2.8 },
};

// An illustrated tutor bust — a character, not an abstract shape. Flat
// vector rather than a photo or 3D render (this toolset has no
// image-generation model), but drawn to hold up at the large size the
// voice call now displays it at: layered shading on the face, a glossy
// two-tone hair pass, and a real open/closed mouth pair — the mouth
// swaps shape on Azure's actual viseme signal during speech (see
// `mouthOpen`), not a generic loop. Gender ties to the same female/male
// preference the voice picker already exposes, so the face and the
// voice agree.
export default function SayloAvatar({
  expression,
  gender = "female",
  visemeId,
  size = 64,
  className = "",
}: SayloAvatarProps) {
  const isSpeaking = expression === "speaking";
  const isThinking = expression === "thinking";
  const isError = expression === "error";
  const isListening = expression === "listening";
  const isFemale = gender === "female";
  const style = GENDER_STYLE[gender];
  const uid = gender;
  const isLive = isSpeaking && visemeId !== undefined;

  const eyeLook = isThinking ? { x: 2.5, y: -1.5 } : { x: 0, y: 0 };
  const browRotate = isError ? 12 : isListening ? -5 : isThinking ? -7 : 0;
  const browY = isListening ? -1.5 : 0;

  // Mouth shape while speaking: with real viseme data (isLive) each
  // render just snaps to the phoneme actually being said, on a fast
  // transition. Without it — the static chat-bubble avatar, or the
  // rare browser-TTS fallback mid-call — a keyframed pose sequence
  // fakes the same idea, since there's no live target to morph toward.
  const livePose = isLive ? MOUTH_POSE[poseForViseme(visemeId)] : null;
  const speakingAnimate = livePose
    ? { rx: livePose.rx, ry: livePose.ry, cy: livePose.cy, opacity: 1 }
    : isSpeaking
      ? {
          rx: DECORATIVE_POSES.map((p) => MOUTH_POSE[p].rx),
          ry: DECORATIVE_POSES.map((p) => MOUTH_POSE[p].ry),
          cy: DECORATIVE_POSES.map((p) => MOUTH_POSE[p].cy),
          opacity: 1,
        }
      : { rx: 6, ry: 0.6, cy: 60, opacity: 0 };
  const speakingTransition = isLive
    ? { duration: 0.09 }
    : isSpeaking
      ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 0.2 };
  const teethOpacity = livePose
    ? livePose.teeth
    : isSpeaking
      ? DECORATIVE_POSES.map((p) => MOUTH_POSE[p].teeth)
      : 0;
  const restOpacity = isSpeaking ? 0 : 1;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`saylo-shirt-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <radialGradient id={`saylo-face-${uid}`} cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor={style.skinLight} />
          <stop offset="100%" stopColor={style.skinBase} />
        </radialGradient>
        <clipPath id={`saylo-clip-${uid}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>

      <g clipPath={`url(#saylo-clip-${uid})`}>
        {/* shoulders / shirt */}
        <path d="M 0 100 Q 50 62 100 100 Z" fill={`url(#saylo-shirt-${uid})`} />
        {isFemale ? (
          <path d="M 36 68 Q 50 78 64 68 L 64 84 Q 50 90 36 84 Z" fill="#ffffff" opacity="0.24" />
        ) : (
          <path d="M 43 66 L 50 75 L 57 66 L 57 100 L 43 100 Z" fill="#ffffff" opacity="0.2" />
        )}

        {/* neck */}
        <rect x="40" y="56" width="20" height="18" rx="7" fill={style.skinBase} />
        <ellipse cx="50" cy="58" rx="10" ry="2.4" fill={FEATURE} opacity="0.1" />

        {/* head */}
        <ellipse cx="50" cy="40" rx="27" ry="27" fill={`url(#saylo-face-${uid})`} />
        {/* far-side shading for dimension */}
        <path d="M 63 22 Q 77 34 70 60 Q 68 46 63 39 Z" fill={FEATURE} opacity="0.07" />
        <ellipse cx="35" cy="46" rx="5.5" ry="3.5" fill="#f5807a" opacity="0.32" />
        <ellipse cx="65" cy="46" rx="5.5" ry="3.5" fill="#f5807a" opacity="0.32" />

        {/* ears */}
        <ellipse cx="24" cy="43" rx="2.8" ry="4.2" fill={style.skinBase} />
        <ellipse cx="76" cy="43" rx="2.8" ry="4.2" fill={style.skinBase} />
        {isFemale && (
          <>
            <circle cx="24" cy="47.5" r="1.2" fill="#e7c07a" />
            <circle cx="76" cy="47.5" r="1.2" fill="#e7c07a" />
          </>
        )}

        {/* hair */}
        {isFemale ? (
          <>
            <path
              d="M 20 42 Q 15 6 50 5 Q 85 6 80 42 Q 82 24 68 17 Q 62 27 50 18 Q 38 27 32 17 Q 18 24 20 42 Z"
              fill={style.hair}
            />
            <path d="M 18 30 Q 10 58 19 84 Q 26 72 24 52 Q 25 40 20 30 Z" fill={style.hair} />
            <path d="M 82 30 Q 90 58 81 84 Q 74 72 76 52 Q 75 40 80 30 Z" fill={style.hair} />
            <path
              d="M 50 5 Q 65 6 74 16 Q 62 10 50 11 Q 38 10 26 16 Q 35 6 50 5 Z"
              fill={style.hairShine}
              opacity="0.65"
            />
            <path d="M 24 24 Q 20 34 22 44" stroke={style.hairShine} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
          </>
        ) : (
          <>
            <path
              d="M 21 38 Q 17 8 50 7 Q 83 8 79 38 Q 78 20 65 15 Q 62 22 50 17 Q 38 22 35 15 Q 22 20 21 38 Z"
              fill={style.hair}
            />
            <path d="M 20 34 Q 18 44 21 52 Q 15 42 17 30 Z" fill={style.hair} />
            <path d="M 80 34 Q 82 44 79 52 Q 85 42 83 30 Z" fill={style.hair} />
            <path
              d="M 28 14 Q 39 8 50 9 Q 61 8 72 14 Q 62 11 50 12 Q 38 11 28 14 Z"
              fill={style.hairShine}
              opacity="0.7"
            />
          </>
        )}

        {/* eyebrows */}
        <motion.path
          d={`M 30 ${37 - style.browWeight / 2} Q 38 ${34 - style.browWeight} 46 ${37 - style.browWeight / 2} L 46 ${37 + style.browWeight / 2} Q 38 ${36} 30 ${37 + style.browWeight / 2} Z`}
          fill={FEATURE}
          style={{ transformOrigin: "38px 37px" }}
          animate={{ rotate: browRotate, y: browY }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        <motion.path
          d={`M 70 ${37 - style.browWeight / 2} Q 62 ${34 - style.browWeight} 54 ${37 - style.browWeight / 2} L 54 ${37 + style.browWeight / 2} Q 62 ${36} 70 ${37 + style.browWeight / 2} Z`}
          fill={FEATURE}
          style={{ transformOrigin: "62px 37px" }}
          animate={{ rotate: -browRotate, y: browY }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        {/* eyes */}
        {isError ? (
          <>
            <path d="M 28 46 Q 35 51 42 46" stroke={FEATURE} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 58 46 Q 65 51 72 46" stroke={FEATURE} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <motion.g animate={{ x: eyeLook.x, y: eyeLook.y }} transition={{ duration: 0.4, ease: "easeInOut" }}>
              <path d="M 27 45 Q 35 38 43 45 Q 35 52 27 45 Z" fill="#fff" />
              <motion.g
                style={{ transformOrigin: "35px 45px" }}
                animate={{ scaleY: [1, 1, 0.06, 1, 1] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.85, 0.9, 0.95, 1] }}
              >
                <circle cx="35" cy="45.5" r="4.6" fill="#6b4322" />
                <circle cx="35" cy="45.5" r="2.4" fill={FEATURE} />
                <circle cx="36.6" cy="43.8" r="1.3" fill="#fff" />
                <circle cx="33.6" cy="47.4" r="0.7" fill="#fff" opacity="0.7" />
              </motion.g>
              <path d="M 27 45 Q 35 38 43 45" stroke={FEATURE} strokeWidth="1.3" fill="none" opacity="0.55" />
              <path d="M 26.5 44.5 Q 25 42.5 24 43.5" stroke={FEATURE} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.5" />
            </motion.g>
            <motion.g animate={{ x: eyeLook.x, y: eyeLook.y }} transition={{ duration: 0.4, ease: "easeInOut" }}>
              <path d="M 57 45 Q 65 38 73 45 Q 65 52 57 45 Z" fill="#fff" />
              <motion.g
                style={{ transformOrigin: "65px 45px" }}
                animate={{ scaleY: [1, 1, 0.06, 1, 1] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.85, 0.9, 0.95, 1],
                  delay: 0.1,
                }}
              >
                <circle cx="65" cy="45.5" r="4.6" fill="#6b4322" />
                <circle cx="65" cy="45.5" r="2.4" fill={FEATURE} />
                <circle cx="66.6" cy="43.8" r="1.3" fill="#fff" />
                <circle cx="63.6" cy="47.4" r="0.7" fill="#fff" opacity="0.7" />
              </motion.g>
              <path d="M 57 45 Q 65 38 73 45" stroke={FEATURE} strokeWidth="1.3" fill="none" opacity="0.55" />
              <path d="M 73.5 44.5 Q 75 42.5 76 43.5" stroke={FEATURE} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.5" />
            </motion.g>
          </>
        )}

        {/* nose */}
        <path d="M 49.5 49 Q 48.5 53 50 54" stroke={FEATURE} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.22" />

        {/* mouth — while speaking, a single ellipse morphs through real
            viseme shapes (see MOUTH_POSE) instead of just opening and
            closing; at rest it's a proper smile/frown/thinking-line. */}
        {isError ? (
          <path d="M 43 63 Q 50 59 57 63" stroke={LIP} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        ) : (
          <>
            <motion.ellipse
              cx="50"
              animate={speakingAnimate}
              transition={speakingTransition}
              fill="#5a2e24"
            />
            <motion.path
              d="M 44.5 58.5 Q 50 57 55.5 58.5"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: teethOpacity }}
              transition={speakingTransition}
            />
            <path
              d={isThinking ? "M 44 60.5 Q 50 59 56 60" : "M 42 59 Q 50 65.5 58 59"}
              stroke={LIP}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity={restOpacity}
            />
          </>
        )}
      </g>
    </svg>
  );
}
