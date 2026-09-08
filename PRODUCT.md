# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hebrew-speaking learners of English, spanning children through adults (age-banded: child/teen/adult, with a parental-consent flow gating minors). The redesign targets both audiences neutrally by explicit product decision — approachable enough for a curious child, credible enough for a serious adult professional, skewed toward neither.

## Product Purpose

A personalized English-learning platform. A CEFR placement test locates the learner's level, then the product builds and continuously adapts a learning path across six skill areas — vocabulary, grammar, reading, listening, writing, speaking — each independently leveled A1–C2. Spaced-repetition "smart review" resurfaces vocabulary at the right moment. An AI teacher (Claude-powered) remembers a learner's specific recurring mistakes and tailors explanations and suggestions around them. Success means measurable per-skill progress, sustained daily practice (streaks), and real confidence speaking and writing English — not just quiz completion.

## Positioning

Not a generic vocabulary-flashcard app. The mechanism a competitor could not casually copy: (a) a real CEFR placement test with per-skill level tracking, not a single generic score; (b) an AI teacher that remembers a learner's specific recurring errors (e.g. "have gone" vs. "have went") and proactively resurfaces them, rather than generic spaced repetition alone; (c) genuine speech-recognition-based speaking practice — pronunciation scoring and a full voice-answered Speaking Test via Azure Speech — not multiple-choice standing in for speaking; (d) a real conversational AI practice partner (text chat and live voice call) for open-ended dialogue, not scripted lessons only.

## Operating Context

Web app (Next.js App Router, Supabase auth/DB), soon also wrapped as a native iOS app (Capacitor, remote-URL mode — the wrapper loads the live site directly, so it shares this exact design). Daily loop: dashboard → pick a module (vocabulary/grammar/reading/listening/writing/speaking/games) → exercises → XP/streak/badge feedback. Subscription: 3-day free trial, no credit card; then paid tiers (monthly through annual, ₪ pricing) via Stripe, cancel-anytime (cancel-at-period-end). A hearts/lives system limits mistakes for non-premium users. An internal admin back-office (content management for every exercise type, moderation, analytics, users) is used by the product owner only, not learners — and is explicitly in scope for this redesign too.

## Capabilities and Constraints

- Hebrew RTL is the primary interface language; exercise *content* is in English — Hebrew instructional UI and English learning content coexist constantly in the same views (direction-mixing is a constant condition, not an edge case).
- Independent CEFR level (A1–C2) tracked per skill area.
- Wide range of exercise/game types: MCQ, fill-blank, matching, spelling, speed-round, word-catch, memory, flashcard learn/test, idioms practice, reading comprehension (MCQ + AI-graded open question), listening comprehension, writing with AI feedback, pronunciation recording with AI scoring, full AI voice conversation (text and live call), and a voice-only Speaking Test.
- Gamification: XP, levels, daily streaks, badges, weekly leaderboard, hearts.
- Personalization: adaptive daily lesson, AI-generated per-topic teacher explanations, AI-generated suggestions, spaced-repetition review queue.
- Progress reporting: a dashboard with week/month/all-time views, plus optional emailed weekly/monthly reports.
- Premium gating throughout (a reusable gate pattern), heart-based mistake limits for free users.
- Multi-surface: responsive web (desktop and mobile browser) today, a native iOS wrapper imminent — the same design must hold up from narrow mobile widths through desktop.
- Dark/light theme already implemented and must be preserved and extended, not dropped.
- Accessibility is an active, already-invested commitment (see below), not a green-field concern.

## Brand Commitments

- The name "Saylo" and the tagline "Speak. Learn. Grow." are fixed.
- The existing logo/mark is **not** locked — the user is open to a new logo concept, but any candidate must be presented as a draft in chat for approval before it is used anywhere in the live design. Until approved, the redesign proceeds with the current mark.
- No other binding visual constraints — color, typography, and layout are explicitly open for reinvention.

## Evidence on Hand

- Live production site: https://saylolearn.com (real, deployed).
- Existing brand assets: `public/logo-source.jpg` (1254×1254 source), `public/logo-mark.png`, `public/logo-watermark.png`, `public/icon-192.png`, `public/icon-512.png`, `src/app/apple-icon.png`.
- Real, non-placeholder pricing data: five tiers, ₪59–₪449, defined in `src/lib/subscriptions/plans.ts`.
- Real copy already exists across the landing hero, features, pricing, privacy, and terms pages — refine, don't fabricate replacements.
- No testimonials, case studies, or press exist — none may be invented.
- The admin panel is a real, functioning internal tool with genuine data flowing through it, not a mockup.

## Product Principles

1. Serve two real, simultaneous audiences — curious children and serious adult learners — without visually skewing toward either: approachable but not childish, credible but not sterile.
2. Substance over gamified fluff: the product's true differentiator is the AI teacher's memory and genuine speech-recognition-based speaking practice — design should make that intelligence feel present and trustworthy, not bury it under generic "learn a language" app clichés.
3. RTL-first and bilingual-aware: typography and layout must fluently handle Hebrew instructional text and English learning content in the same view, always — not as a special case.
4. Accessibility is a genuine, already-invested product commitment (screen-reader announcements, full keyboard operability) — the redesign must not regress it.
5. One coherent design system must hold up across marketing pages, a dense daily-use app, gamified exercise screens, and an internal admin back-office — one product, not three bolted together.

## Accessibility & Inclusion

Recent, explicit investment: ARIA live-region announcements for exercise correct/incorrect feedback, `role="alert"` form-error announcements, full keyboard operability for the drag-and-drop Match game, and admin panel accessibility fixes. No standard was explicitly named, but the pattern implies at least WCAG AA intent for interactive components — preserve and extend this, never regress it.
