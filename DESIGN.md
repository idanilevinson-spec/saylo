# Design

<!-- impeccable:design-schema 1 -->

## World

**Subtitle Culture.** Understanding arrives as text locked to the moment of speech — a caption, not a chat bubble or a quiz card. Rooted in how this specific audience (Hebrew-speaking learners of English, children through adults) actually learned English in the first place: a lifetime of subtitled film and television, not classroom drills. Direction contract: `.impeccable/surfaces/src-app-marketing-page-tsx.md`. Seed key `fe947b33`.

The hero is always the cinema — near-black, letterboxed — regardless of the site's own light/dark theme. Everything below the hero plays inside whichever theme the visitor has chosen; the theme is what's "on screen," the hero is the frame it plays in.

## Palette

Two colors carry meaning, not decoration: **primary (blue)** is the "English track" — the active, spoken-right-now word, the way a subtitle highlights a translated idiom. **Accent (teal)** is the "Hebrew track" — the correction/translation running beneath it. Both are sampled directly from the real Saylo logo's gradient (`public/logo-mark.png` runs blue `#0b7ce5` → teal `#0ab1db`), not chosen freely — an early pass tried amber for primary and the user correctly sent it back for straying from the actual brand mark. They never merge into one line, only stack (see Components → `.caption-stack`).

| Token | Dark (native) | Light (daylight translation) |
|---|---|---|
| `--background` | `#0b0c0f` | `#faf7f0` |
| `--background-2` | `#17181c` | `#f1ebdf` |
| `--foreground` | `#f3efe4` (warm cream, never pure white) | `#211c14` (warm charcoal, never pure black) |
| `--card` / `--card-border` | `#1c1d22` / `#2e2f36` | `#ffffff` / `#e4dbc8` |
| `--primary` (English track) | `#4d9eff` | `#0066d6` |
| `--accent` (Hebrew track) | `#2dd4cf` | `#00a19d` |
| `--muted` | `#a39c8c` | `#6e6656` (5.3:1 on body) |

The hero's demo card is hardcoded to these exact dark-mode hex values directly (`#4d9eff` / `#7ab8ff` hover / `#04122b` ink), not `var(--primary)` — it must stay dark regardless of site theme (see World, above), so it can't reference the theme-following token.

Light mode is not a different identity — it's the same grammar read on a bright screen in daylight. Color strategy: **Committed** (primary/accent carry real page-scale meaning, not accents scattered on a neutral ground) on Persuade surfaces; tone down toward **Restrained** on dense Operate surfaces (app, admin) where scanability outranks expression — primary/accent still mark exactly one thing each (the active/correct state, the secondary/translation state), never decorative.

## Type

- `--font-rubik` (Hebrew UI chrome) and `--font-jakarta` (English learning content, via the `EnglishText` component's `.font-content` class) are unchanged from before this redesign — both already fit the world (Jakarta Sans is a legitimate Persuade/Experience face; Rubik's geometric character reads as caption-adjacent).
- Retired: Caveat (the old "teacher's handwritten pen" motif). The correction/annotation job it did is now carried by the caption-stack grammar itself (strikethrough + a second caption line), which fits the world more precisely than a handwriting affectation.
- Also retired: IBM Plex Mono and the `.timecode` monospace treatment — see Scope of this pass.
- No gradient text anywhere in the codebase (mechanically enforced — grep for `bg-clip-text` should always return nothing). Emphasis comes from weight, size, or the primary/accent color roles.

## Components

- **`.caption-stack` / `.caption-track-en` / `.caption-track-he`** (`globals.css`) — the one recurring structural device. English (LTR, primary-colored emphasis) stacked above Hebrew (RTL, accent-colored), both anchored to the same right edge (`.caption-track-en` is `text-align: right` in its own LTR context; `.caption-track-he` is `text-align: start`, which is already right in RTL) so the two tracks read as one paired caption instead of opposite sides of the box. Used for the hero headline, the live correction demo, and the pricing card's price line.
- **`LandingCorrectionDemo`** — the hero's signature moment: not a screenshot of the product but its actual mechanism playing live. Cycles through four real English mistakes Hebrew speakers make, each one typed in (the same clip-path wipe the headline uses), struck through, corrected, and captioned in Hebrew, then held before the next one plays. State-machine driven (`typing → holding → striking → correcting → translating → reading → leaving`), entrance-only animations keyed per example rather than `AnimatePresence` exits (which got stuck mid-transition and left stale text on screen — see git history if this pattern is ever reached for again). Freezes to one fully-resolved example under `prefers-reduced-motion`.
- **`.caption-bar`** — a bottom-anchored, high-contrast, backdrop-blurred plate (`color-mix` over `--background`, blur, top/bottom hairline rules) standing in for the banned generic "card" everywhere a subtitle-like reveal is called for: the hero's correction demo, the two "now playing" feature rows, the pricing card.
- **Rails** — a single vertical or horizontal line with dot markers, standing in for the banned kicker/eyebrow and the banned 01/02/03 section numbers. Order reads from position alone, with no printed label riding along it. Used in `LandingSteps` (a step rail) and `LandingLevels` (the CEFR scrubber).
- **Scrubber** (`LandingLevels`) — CEFR A1→C2 as one continuous progress rail with six chapter markers, not six identical passport-stamp circles. RTL-aware: reads right-to-left, A1 at the reading start.
- **Buttons** — full pill shape (`rounded-full`), primary CTA carries a `Play` icon (lucide) filled solid, framing every primary action as "press play," never a generic rectangular button.

## Refused (mechanically checked by `impeccable detect`)

Same-size icon+heading+text card grids, the hero-metric template, kicker/eyebrow labels, 01/02/03 section numbers, gradient text, decorative blur/glass, hard neobrutalist shadows, monospace-as-costume, emoji-as-icon. See `craft-floor.md` for the full list this world is held to.

## Scope of this pass

Built and finish-reviewed: the marketing/landing page (`Landing*` components) and the global `Navbar` (including a real mobile-nav fix for the logged-out state, which was genuinely broken before this pass, not a style choice).

An early build of this pass shipped an amber primary color; the user correctly sent it back for straying from the real Saylo logo (see Palette). The corrected blue/teal tokens cascade to the whole app automatically through CSS custom properties — most of the authenticated app and admin panel needed no structural change to inherit the real identity.

What did need attention, and got it in this pass: retiring the pre-redesign "passport stamp" motif (a dashed-circle badge family used for CEFR level indicators, the placement-test result, and the voice-call orb) wherever it appeared outside the landing page — `CefrBadge`, the placement result screen, and `VoiceConversationPanel` now read as filled chips and live-state rings instead, consistent with the scrubber that replaced passport stamps in `LandingLevels`. Dashed "ticket" dividers left over from an older boarding-pass motif (dashboard header, profile stats) were replaced with plain hairlines.

Operate surfaces inherit this world through color and typography, not through hero-specific devices like letterboxing or caption-bar cinema framing, which belong to the Persuade surfaces only. That's still true, but it isn't the same claim as "no work needed there" — see the two passes below.

**Timecode motif, retired.** An early build of this pass ran a ticking "REC" clock in the hero corner and threaded literal mm:ss timecodes through the demo card, the steps rail, the feature scene-list, the pricing badge, and the CEFR scrubber — plus a `.timecode` monospace treatment applied to every plain stat number across dashboard, profile, admin and games. The user flagged it directly: the clock-formatted numbers were cluttering nearly every section and reading as ugly, not premium. All of it is gone — the `useTimecode` hook, the REC row, every `time` field on `LandingSteps`/`LandingFeatures`/`LandingLevels`, the `.timecode` CSS utility, and the IBM Plex Mono font load. What's left carries the same ideas without the HUD chrome: order comes from position on a rail (dot markers, no printed labels), the CEFR scrubber reads through its level codes alone, and plain stat numbers use the UI's normal weight rather than a borrowed "measurement" typeface. The lesson for future passes: a diegetic device applied to *every* numeral on the page stops reading as intentional and starts reading as noise — use it sparingly or not at all, not as a blanket typographic rule.

**Bilingual alignment bug, fixed.** `.caption-track-en` used `text-align: start`, which resolves to *left* in its own `direction: ltr` context — while `.caption-track-he` resolves `start` to *right*. On a wide block (the steps rail especially) this put the English line flush against the left edge and the Hebrew line flush against the right edge of the same box: two lines that read as opposite sides of the page instead of one paired caption. Fixed by setting `.caption-track-en` to `text-align: right` explicitly — English word order stays correct (still `direction: ltr`), but the line now anchors to the same right edge as its Hebrew partner, matching the page's RTL reading flow everywhere the pattern is used (hero headline, demo card, steps, pricing card).

**Anti-slop pass (`design-taste-frontend`).** A few real AI-design tells the earlier passes had shipped without noticing: an em-dash used as a design flourish across headline, body, and demo-card copy (all replaced with periods, commas, or a colon depending on the sentence); the hero's trial-offer pill ("3 ימים חינם, בלי כרטיס אשראי") was a pricing-teaser sitting inside the hero stack, which the hero shouldn't carry — it now lives in its own thin trust strip (`LandingTrustStrip`) directly under the hero, the same principle as a logo wall living under the hero rather than inside it; and the hero's secondary CTA ("לצפייה במסלולים") duplicated the pricing card's CTA intent under a different label, unified to "לכל המסלולים" everywhere. Known gap, flagged rather than papered over: the hero and demo card are CSS-built, not real photography or a generated image — no image-generation tool is available in this environment, so if the page ever gets one, the hero is the first place to spend it.

**Dashboard rebuilt as its own Operate surface.** The user pushed back directly: the app had only inherited color tokens, not real design attention, and it showed. Two refused patterns from craft-floor.md were sitting in the shipped dashboard — a same-size icon+heading+text card grid as the page's own structure, and a progress ring "standing in for content." Both are gone. The twelve learning modules are now three named groups (מסלול הלימוד / תרגול לפי כישור / משחק ודיבור), each a divided-row list reusing the exact `divide-y` scene-list pattern `LandingFeatures` already established on the marketing page — one coherent vocabulary across Persuade and Operate, not two systems bolted together. The daily-goal ring became a plain number plus a thin rail-style bar (the same track-and-fill shape the CEFR scrubber uses), since the number is the actual content and the bar is a supporting indicator, not a decoration standing in for one. The two AI-conversation modules keep distinct, larger tinted tiles — that asymmetry is earned, they're the product's real differentiators per PRODUCT.md, not decoration.

**The eyebrow ban, actually enforced app-wide.** A `grep` across `src/` for the eyebrow signature (`text-xs font-bold tracking-[0.14em] uppercase`) turned up sixteen violations across fourteen files: a small uppercase label sitting above the `<h1>` on nearly every exercise page (vocabulary, grammar, reading, listening, writing, idioms, learn, speaking, speaking/voice, speaking-test, games/test, games/leaderboard, plus the games hub) had become the de facto page-header convention, unnoticed because each file was written in isolation rather than checked against the rest. craft-floor.md bans this outright, no brief earns it back. Pure decoration was deleted (the heading already carries the meaning). Where the label carried real information, it was kept but re-homed: the leaderboard's day-window folded into the subtitle sentence instead of sitting above the heading; the reading exam's two-step "01 · הטקסט" / "02 · מבחן הבנה" and the grammar lesson's "הסבר מהמורה" became plain `<h2>` sub-headings instead of costume-uppercase labels (the step numbers were dropped too, since position on the page already carries that order); the match game's level progress kept its information but lost the tracking/uppercase treatment. The lesson: a banned pattern used once is a mistake, used sixteen times across the app is a convention nobody checked — worth a `grep` for the signature class string whenever a "refused" pattern gets fixed once, not just fixing the one instance in front of you.
