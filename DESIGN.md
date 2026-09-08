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
- `--font-timecode` (IBM Plex Mono) is new: the one earned monospace use, for caption timecodes and other measured numerals (`.timecode` utility, `font-variant-numeric: tabular-nums`). Never used for body copy or as a "technical" costume.
- Retired: Caveat (the old "teacher's handwritten pen" motif). The correction/annotation job it did is now carried by the caption-stack grammar itself (strikethrough + a second caption line), which fits the world more precisely than a handwriting affectation.
- No gradient text anywhere in the codebase (mechanically enforced — grep for `bg-clip-text` should always return nothing). Emphasis comes from weight, size, or the primary/accent color roles.

## Components

- **`.caption-stack` / `.caption-track-en` / `.caption-track-he`** (`globals.css`) — the one recurring structural device. English (LTR, primary-colored emphasis) stacked above Hebrew (RTL, accent-colored), both `text-align: start` so they read correctly in their own direction. Used for the hero headline, the AI-correction demo card, and the pricing card's price line.
- **`.caption-bar`** — a bottom-anchored, high-contrast, backdrop-blurred plate (`color-mix` over `--background`, blur, top/bottom hairline rules) standing in for the banned generic "card" everywhere a subtitle-like reveal is called for: the hero's correction demo, the two "now playing" feature rows, the pricing card.
- **Timecode rows** — a small monospace label (`.timecode`) paired with content, standing in for the banned kicker/eyebrow and the banned 01/02/03 section numbers. Used in `LandingSteps` (a transcript rail, not numbered cards), `LandingFeatures` (a scene list), the hero corner clock, and the CEFR level scrubber's chapter marks.
- **Scrubber** (`LandingLevels`) — CEFR A1→C2 as one continuous progress rail with six chapter markers, not six identical passport-stamp circles. RTL-aware: reads right-to-left, A1 at the reading start.
- **Buttons** — full pill shape (`rounded-full`), primary CTA carries a `Play` icon (lucide) filled solid, framing every primary action as "press play," never a generic rectangular button.

## Refused (mechanically checked by `impeccable detect`)

Same-size icon+heading+text card grids, the hero-metric template, kicker/eyebrow labels, 01/02/03 section numbers, gradient text, decorative blur/glass, hard neobrutalist shadows, monospace-as-costume, emoji-as-icon. See `craft-floor.md` for the full list this world is held to.

## Scope of this pass

Built and finish-reviewed: the marketing/landing page (`Landing*` components) and the global `Navbar` (including a real mobile-nav fix for the logged-out state, which was genuinely broken before this pass, not a style choice). **Not yet extended**: the authenticated app (dashboard, exercises, games, profile, progress) and the admin panel — both explicitly in scope per the user's brief, planned as the next pass. They should inherit this world (tokens, `.caption-bar`/`.caption-stack`/timecode patterns) rather than open a new direction round — see `new-work.md` → "Create a whole surface inside an established world."
