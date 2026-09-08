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

- **`.caption-stack` / `.caption-track-en` / `.caption-track-he`** (`globals.css`) — the one recurring structural device. English (LTR, primary-colored emphasis) stacked above Hebrew (RTL, accent-colored), both `text-align: start` so they read correctly in their own direction. Used for the hero headline, the AI-correction demo card, and the pricing card's price line.
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

Not restructured, and not needed: Operate surfaces (dashboard, exercises, games, profile, progress, admin) were already built with sound, scanable layouts using the token system — per the Restrained guidance above, they inherit this world through color and typography rather than being reskinned with hero-specific devices like letterboxing or caption-bar cinema framing, which belong to the Persuade surfaces only.

**Timecode motif, retired.** An early build of this pass ran a ticking "REC" clock in the hero corner and threaded literal mm:ss timecodes through the demo card, the steps rail, the feature scene-list, the pricing badge, and the CEFR scrubber — plus a `.timecode` monospace treatment applied to every plain stat number across dashboard, profile, admin and games. The user flagged it directly: the clock-formatted numbers were cluttering nearly every section and reading as ugly, not premium. All of it is gone — the `useTimecode` hook, the REC row, every `time` field on `LandingSteps`/`LandingFeatures`/`LandingLevels`, the `.timecode` CSS utility, and the IBM Plex Mono font load. What's left carries the same ideas without the HUD chrome: order comes from position on a rail (dot markers, no printed labels), the CEFR scrubber reads through its level codes alone, and plain stat numbers use the UI's normal weight rather than a borrowed "measurement" typeface. The lesson for future passes: a diegetic device applied to *every* numeral on the page stops reading as intentional and starts reading as noise — use it sparingly or not at all, not as a blanket typographic rule.
