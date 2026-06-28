# AI Brand Finder

An open-source, frontend-only web app that helps entrepreneurs, creators and
developers discover brandable names: generate hundreds of candidates, score
them, check domain availability, and shortlist the best.

No backend, no database — everything runs in the browser, with preferences
and history persisted to `localStorage`.

## Tech stack

- Angular (standalone components, Signals)
- Tailwind CSS
- TypeScript

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:4200
npm test         # unit tests
npm run build    # production build to dist/ai-brand-finder/browser
```

## How it works

1. **Generate** (`/generate`) — enter keywords, category, style, preferred
   domain extensions, budget and how many suggestions you want.
2. The app generates candidate names, scores each one, and checks domain
   availability for your chosen extensions.
3. **Results** (`/results`) — a sortable, searchable, filterable table.
   Favourite names and export the shortlist as CSV, JSON, clipboard text,
   or print.
4. **History** (`/history`) — past searches, with one click to re-run any
   of them.

## Architecture

Core capabilities are plugged in via Angular DI tokens, so the V1
implementation of each can be swapped without touching callers:

| Token             | Interface        | V1 implementation                                                       |
| ----------------- | ----------------- | -------------------------------------------------------------------------- |
| `NAME_GENERATOR`  | `NameGenerator`   | `CompositeNameGenerator` — AI when enabled, `RuleBasedNameGenerator` otherwise/as fallback |
| `BRAND_SCORER`    | `BrandScorer`     | `DefaultBrandScorer` — heuristic scoring across 6-7 criteria               |
| `DOMAIN_PROVIDER` | `DomainProvider`  | `DohDomainProvider` — Cloudflare DNS-over-HTTPS NS lookups                 |

Bindings live in `src/app/app.config.ts`. A registrar pricing API only needs
to implement the relevant interface and be bound to its token — nothing in
`features/` or `state/` needs to change. `NameGenerator.generate()` returns
an Observable so engines can call out (e.g. to an LLM) without changing the
contract.

### AI-powered generation (optional, bring your own key)

The "AI-powered generation" toggle on the Generate page switches the name
generator to call the Anthropic Messages API directly from the browser with
a user-supplied API key (`LlmNameGenerator`). Since the app has no backend,
the key is kept only in `localStorage` and sent straight to Anthropic over
HTTPS. If the AI call fails for any reason (no/invalid key, network error,
rate limit), `CompositeNameGenerator` transparently falls back to the
rule-based engine, and the Results page shows which engine actually ran.

```
src/app/
├── core/        # config constants, local storage, theme
├── domain/      # generation, scoring, domain availability, export — framework-light
├── state/       # signal-based stores (generation, favourites, recent searches)
├── features/    # routed pages: home, generator, results, history
└── shared/ui/   # reusable presentational components
```

## Domain availability caveat

The V1 domain check uses public DNS-over-HTTPS NS lookups, not a registrar
API: a domain with NS records is treated as taken, NXDOMAIN as available.
This is a heuristic — it carries no real pricing (a static indicative price
table is used for budget filtering) and can misread parked-but-unconfigured
domains. Swap in a registrar API later via the `DOMAIN_PROVIDER` token.

## Deployment

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds
the app and deploys it to GitHub Pages via GitHub Actions.

One-time setup after creating the GitHub repo: **Settings → Pages → Source
→ GitHub Actions**.

## Roadmap

Logo generation, social handle checks, trademark search, SEO analysis, AI
brand advisor feedback, audience/personality analysis, multi-language
support, domain watchlists, and a public REST API are intentionally out of
scope for V1.
