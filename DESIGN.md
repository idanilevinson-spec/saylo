# Design

<!-- impeccable:design-schema 1 -->

## World

**On Air.** Your English gets corrected the moment it happens, cut into like a live broadcast, not filed away in a quiz result. Rooted in the same audience truth as before (Hebrew-speaking learners, children through adults), but replaces the old "Subtitle Culture" direction's quiet, letterboxed cinema-caption look with real spectacle: this is a full redesign-overhaul, explicitly requested by the user ("change everything design-wise, except the logo, and try to build something impressive"), not a refinement of the previous world. Direction contract: `.impeccable/surfaces/src-app-marketing-page-tsx.md`. Seed key `0a1ce211`, assigned candidate #5 of the grounded list (a live broadcast desk).

The old world's letterboxing and translucent glass are gone. In their place: bold, flat color-block fields (never gradients standing in for content, never glass standing in for a plate) and a genuine two-tone studio split behind the hero's headline and its live segment.

**Dark is the first-visit default**, not a system-preference guess — the user asked for it directly, and the world genuinely reads better there (the near-black plates against the saturated color fields carry more of the "broadcast at night" charge than the daylight translation does). `layout.tsx`'s no-flash script now sets `data-theme="dark"` whenever no explicit choice is stored; a stored choice from the toggle still always wins. `manifest.ts` and `viewport.themeColor` were updated to the dark-mode primary/background to match. Light mode is preserved in full and reachable from the same toggle as before — this changes which theme a first-time visitor lands on, not whether light mode exists.

## Palette

Same brand colors as before, used completely differently. Primary (blue) is the "on-air" field color and the English channel; accent (teal) is the second studio field and the Hebrew channel. Both still sampled directly from the real Saylo logo gradient (`public/logo-mark.png`, blue `#0b7ce5` → teal `#0ab1db`) — the logo itself was the one constraint the user pinned ("except the logo"), so the palette stays recognizably Saylo rather than drifting into generic broadcast red.

| Token | Dark (native) | Light (daylight translation) |
|---|---|---|
| `--background` | `#0b0c0f` | `#faf7f0` |
| `--background-2` | `#17181c` | `#f1ebdf` |
| `--foreground` | `#f3efe4` | `#211c14` |
| `--card` / `--card-border` | `#1c1d22` / `#2e2f36` | `#ffffff` / `#e4dbc8` |
| `--primary` (English channel) | `#4d9eff` | `#0066d6` |
| `--accent` (Hebrew channel) | `#2dd4cf` | `#00a19d` |
| `--muted` | `#a39c8c` | `#6e6656` (5.3:1 on body) |

Color strategy: **Committed to Drenched** on Persuade surfaces — the hero and final CTA are solid primary/accent fields, not accents scattered on a neutral ground. Verified contrast across both themes: hero headline vs. its plate 17:1 (dark) / correct in light; correction demo's English/Hebrew lines 17:1 / 12.9:1 (dark); the ticker 5.3:1 (light) / 7.98:1 (dark); the LIVE flag 6.79:1 (dark). All comfortably above WCAG AA. Operate surfaces (dashboard, exercises, admin) stay **Restrained** as before — this redesign was scoped to the marketing/landing page; the app inherits the corrected tokens automatically but keeps its own quieter register.

Never literal news-red. The "breaking" charge comes from Saylo's own blue and teal at full saturation, not a borrowed broadcast convention that would clash with the logo and with `--danger`'s existing meaning.

## Type

- `--font-rubik` (Hebrew UI chrome) and `--font-jakarta` (English learning content, via `EnglishText`'s `.font-content` class) are unchanged — both already fit either world.
- New: `--font-chyron` (Anton), an oversized, condensed, all-caps impact face for broadcast-headline moments only — the hero H1, section leads that carry English marketing copy, and the two short English broadcast-convention tags (LIVE, NOW). Declared in `globals.css` *after* `.font-content` so it wins the cascade tie when `EnglishText` applies both classes to one element (a real bug caught during the build: without this ordering, `.font-content`'s `font-family` silently won and Anton never rendered).
- Hebrew section headings get their own impact register without a second typeface: `font-black tracking-tight` on Rubik, not the Anton face (which has no Hebrew glyphs and would silently fall back to an uncontrolled system font). English UI chrome outside the hero stays in short, deliberate broadcast-convention tags (LIVE, NOW) rather than translating full Hebrew headings into English — the site's primary UI language stays Hebrew throughout, exactly as before.
- Retired: the old world's Caveat and IBM Plex Mono are still gone (unrelated to this pass, already retired earlier).
- No gradient text (mechanically enforced — `bg-clip-text` returns nothing).

## Components

- **Two-tone studio split** (`LandingHero`) — a solid accent field behind the live-correction segment, a solid primary field behind the headline plate, `lg:` only (the split reads as noise once the columns stack on mobile).
- **Chyron plate** — a `bg-background` card with a `w-1.5` color-coded edge bar (primary on the headline plate, accent on the correction demo), `rounded-lg` with `shadow-2xl`, not glass. The one recurring structural device replacing the old caption-bar.
- **`LandingCorrectionDemo`** — same signature-moment mechanism as before (a state machine cycling four real mistakes, typed in via clip-path wipe, struck through, corrected, captioned in Hebrew), re-skinned as a chyron plate instead of a translucent glass card on a dark ground.
- **The one LIVE flag** — a pulsing accent-colored dot plus a small `chyron`-styled "Live" tag, used exactly once in the hero. Never repeated as a HUD element across the page (that repetition was the retired timecode mistake from the previous pass, and the discipline carries forward into this one).
- **The one ticker** (`LandingTrustStrip`) — a real scrolling news ticker, ` design-taste-frontend`'s one marquee-per-page allowance spent on the single place a marquee is this world's own thesis rather than a decorative reach. A `chyron`-styled "Now" tag anchors a `w-max` duplicated-content track animating `translateX(-50%)` for a seamless right-to-left loop, which reads correctly for RTL content (new text enters from the right, matching how Hebrew is already read).
- **Segment rundown** (`LandingSteps`) — a numbered list, not a card grid. Numbers are earned here, unlike the old direction's banned 01/02/03: a real broadcast rundown genuinely is numbered order, so the segment numbers (large, `chyron`, low-contrast `text-card-border`) carry real information rather than decoration.
- **Signal meter** (`LandingFeatures`) — a small five-bar ballistic level meter, raised from the VU-meter-bridge challenger (competitive verdict: it beat the assigned direction on product clarity for anything genuinely audio). Used exactly once, next to the voice-call feature only, because that is the one feature that is actually audio — not a generic "live" flourish reused on every card.
- **Studio breathing wash** (`LandingHero`) — a slow, quiet animated radial glow over the hero field, raised from the shader-portal challenger's full-bleed commitment (declined verdict overall — a literal WebGL shader and custom cursor would be generic tech spectacle unrelated to the product — but its ambition donated this one restrained touch: the ground is never perfectly flat and static).
- **Buttons and cards** — `rounded-lg` throughout (not the old world's full pills), a deliberate shape-system change: broadcast graphics are crisp rectangular plates, not soft video-player pills.

## Refused (mechanically checked by `impeccable detect`)

Same-size icon+heading+text card grids, the hero-metric template, kicker/eyebrow labels (except where a rundown's own segment numbers are earned, see above), decorative blur/glass (the correction demo and pricing card are now solid plates, not frosted panes), gradient text, hard neobrutalist shadows, monospace-as-costume, emoji-as-icon, literal news-red. See `craft-floor.md` for the full list.

## Scope of this pass

Built and finish-reviewed: the marketing/landing page (`Landing*` components) and the global `Navbar` (a lighter touch there — a bolder wordmark weight and a 2px accent bottom rule, since the navbar is persistent chrome across both Persuade and Operate surfaces and stays closer to Restrained even while the page content underneath goes bold).

Not restructured in this pass, deliberately: the authenticated app (dashboard, exercises, games, profile, admin) was already rebuilt as its own disciplined Operate surface in the previous pass (see git history) and inherits this pass's corrected color usage automatically through the same CSS custom properties — it does not inherit the hero-specific devices (color-block splits, the chyron face, the ticker, the LIVE flag), which stay scoped to the Persuade surfaces where design-taste-frontend and craft-floor.md both say expression belongs.

Verification performed: `tsc`/`eslint` clean, `impeccable detect --json` returned no findings on every changed file, the full test suite (82/82) and production build both pass. Contrast measured directly via computed styles in both themes (not estimated) — see Palette above for the numbers. Checked at mobile (375px, no horizontal overflow, no clipped text) and desktop, both themes. No named finish-reviewer or documenter subagent was available in this environment; this document and the verification above were produced in-thread as the disclosed substitution.

**Honest risk.** This is a genuine departure from the previous, more restrained direction, adopted at the user's own explicit request after two rounds of them asking for more visual ambition. It trades some of the previous world's quiet sophistication for real graphic energy. The user was told before building that this could be reverted with git if it doesn't land, and every step of this pass is its own commit for exactly that reason.
