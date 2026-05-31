# ◈ GitSignal

> **"Was this code understood?"**

GitSignal reconstructs human cognitive depth from git history. It does not ask "was this AI-generated?" It asks "was this verified, understood, and genuinely reviewed by a human before merging?"

It analyzes behavioral signals left in commits — diff entropy, test coverage delta, rename density, semantic novelty, message specificity, bulk insertion patterns — and turns them into a **Cognitive Engagement Score** with visual timelines, contributor trust indexes, era-split analysis, and file risk maps.

🔗 **Live demo:** [git-signal-three.vercel.app](https://git-signal-three.vercel.app)

---

## The Problem

Every team using AI coding assistants faces the same invisible risk: developers accept suggestions without comprehension, merge without understanding, and ship without knowing what changed.

Traditional code review metrics don't capture this. GitSignal does.

The dangerous thing isn't AI writing code — it's the rubber-stamp review that follows.

---

## What It Does

- Reconstructs cognitive engagement from git history using 6 behavioral signals
- Surfaces suspicious patterns: **Paste & Pray**, **Rubber Stamp**, **Silent Commit**, **Test Desert**
- Shows engagement over time with a D3 timeline and collapse event detection
- Splits engagement **before and after GPT-4 release** (March 14, 2023)
- Highlights risky files repeatedly touched during low-engagement commits
- Provides per-contributor trust profiles with sparkline trend charts
- Assigns a health grade **(A–F)** for instant comprehension
- Generates a shareable results URL for any public GitHub repo

---

## Demo

Paste any public GitHub repo URL and hit scan:

```
https://github.com/expressjs/morgan
https://github.com/expressjs/cors
https://github.com/sindresorhus/ora
```

Results include a full cognitive engagement dashboard with timeline, era split, score histogram, contributor matrix, flagged commits, and file risk map.

---

## How It Works — Pipeline

```
GitHub Repo URL
      ↓
git clone (shallow, configurable depth)
      ↓
Per-commit diff extraction
  • added/deleted lines
  • test files changed
  • rename detection
  • comment line detection
  • bulk insertion detection
  • raw token sample for entropy
      ↓
Semantic analysis (sentence-transformers)
  • embed commit messages
  • embed diff samples
  • compute semantic novelty vs prior commit
  • compute message quality score
      ↓
Composite cognitive scoring per commit (0.0 – 1.0)
      ↓
Flag detection (rule-based)
      ↓
Aggregate metrics
  • summary stats
  • collapse event detection (rolling window)
  • AI era split (pre/post March 14, 2023)
  • contributor trust profiles
  • file risk heatmap
      ↓
Cache result (diskcache, 24h TTL)
      ↓
Frontend dashboard (React + D3)
```

---

## Scoring System

Each commit receives a **Cognitive Engagement Score** between 0.0 and 1.0.

### Signals and Weights

| Signal | Weight | What it measures |
|--------|--------|-----------------|
| Diff entropy | 0.20 | Shannon entropy of changed tokens. High entropy = deliberate varied edits vs repetitive paste. |
| Test coverage delta | 0.20 | Ratio of test files changed. Adding tests = comprehension and validation. |
| Semantic novelty | 0.15 | Embedding distance from previous diff. Conceptually distinct changes score higher. |
| Rename density | 0.15 | Renames per files changed. Renaming requires understanding the code. |
| Message quality | 0.15 | Specificity, length, and issue references in commit message. |
| Comment signal | 0.10 | Ratio of comment lines added. Explains non-obvious logic. |
| Base credit | 0.05 | Minimum score for any commit. |
| Bulk insertion penalty | −0.40 | Applied when >80 lines added with <5 deletions. The Paste & Pray fingerprint. |

### Formula

```
raw_score = (
  diff_entropy   * 0.20 +
  test_score     * 0.20 +
  semantic_novelty * 0.15 +
  rename_score   * 0.15 +
  message_quality * 0.15 +
  comment_score  * 0.10 +
  0.05
)

final_score = max(0.0, raw_score - bulk_penalty)
```

### Health Grades

| Grade | Score range | Meaning |
|-------|-------------|---------|
| A | ≥ 0.70 | High engagement — humans understand their commits |
| B | 0.55 – 0.69 | Good engagement with some gaps |
| C | 0.40 – 0.54 | Mixed signals — review quality inconsistent |
| D | 0.25 – 0.39 | Low engagement — rubber-stamping detected |
| F | < 0.25 | Critical — widespread blind AI acceptance |

---

## Flags

| Flag | Condition | Meaning |
|------|-----------|---------|
| `paste_and_pray` | Bulk insertion + zero tests | Large paste accepted without validation |
| `rubber_stamp` | Score < 0.15 | Near-zero cognitive signal across all dimensions |
| `test_desert` | >50 additions + zero tests | Significant code with no test coverage added |
| `silent_commit` | Message quality < 0.15 | No intent communicated in commit message |
| `deep_refactor` ✓ | >2 renames | Positive — genuine comprehension signal |
| `test_driven` ✓ | Test files ≥ 40% of changed files | Positive — strongest comprehension signal |

---

## AI Era Split

GitSignal splits the commit history at **March 14, 2023** — the GPT-4 public release date.

It computes:
- Mean cognitive score before and after
- High engagement % before and after
- Paste & Pray rate before and after
- Delta % and directional verdict

**Verdicts:**
- `significant_decline` — score dropped >15 points post-AI
- `moderate_decline` — score dropped 5–15 points
- `stable` — score unchanged (±5 points)
- `improvement` — score improved post-AI adoption

Requires at least 5 commits in each era to display.

---

## Dashboard Sections

| Section | What it shows |
|---------|---------------|
| Summary stats | Mean score, health grade, high engagement %, flag counts, collapse count |
| AI era split | Before/after GPT-4 delta with verdict |
| Cognitive timeline | D3 scatter plot, smoothed trend line, collapse bands, GPT-4 boundary marker |
| Score distribution | Histogram of all commit scores with mean line |
| Contributor trust index | Per-author mean score, trend direction, sparkline |
| Flagged commits | Filterable list by flag type — click any to inspect |
| Commit inspector | Per-commit score breakdown, diff stats, flag explanations |
| File risk map | Files repeatedly touched during low-engagement commits |

---

## Shareable Results

Every result is shareable via URL:

```
https://git-signal-three.vercel.app/results?repo=https%3A%2F%2Fgithub.com%2Fowner%2Frepo
```

Opening the link auto-triggers a scan. Share button on results page also generates an X/Twitter post.

---

## Architecture

### Backend — FastAPI (Python)

```
backend/
├── main.py                    # FastAPI app, CORS, endpoints
├── requirements.txt
├── Dockerfile
├── railway.toml               # Railway deployment config
├── analyzer/
│   ├── git_fetcher.py         # Clone repo, extract per-commit diffs
│   ├── semantic_analyzer.py   # sentence-transformers embeddings
│   ├── scorer.py              # Scoring engine, flags, aggregates
│   ├── cache.py               # diskcache, 24h TTL
│   └── jobs.py                # Background job queue + polling
└── models/
    └── schemas.py             # Pydantic response models
```

**API endpoints:**
- `POST /analyze/start` — starts background job, returns `job_id`
- `GET /analyze/status/{job_id}` — job progress + result when complete
- `GET /health` — healthcheck
- `GET /preloaded` — list of pre-cached demo repos

### Frontend — React + Vite + D3

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx        # Hero, signal cards, demo pills
│   │   └── ResultsPage.jsx        # Full dashboard, polling
│   ├── components/
│   │   ├── SummaryStats.jsx       # Metric cards + health grade
│   │   ├── EraPanel.jsx           # AI era split panel
│   │   ├── TimelineView.jsx       # D3 cognitive timeline
│   │   ├── ScoreHistogram.jsx     # D3 score distribution
│   │   ├── ContributorMatrix.jsx  # Contributor table + sparklines
│   │   ├── FlagList.jsx           # Filterable flagged commits
│   │   ├── CommitInspector.jsx    # Per-commit detail
│   │   ├── FileHeatMap.jsx        # File risk map
│   │   ├── CollapseEventBanner.jsx # Collapse alert
│   │   ├── LoadingScreen.jsx      # Animated progress
│   │   ├── NavBar.jsx             # Sticky navigation
│   │   └── ShareButton.jsx        # Copy URL + tweet
│   ├── hooks/
│   │   └── useRepoAnalysis.js     # Scan + polling logic
│   └── styles/
│       ├── globals.css            # Dark theme design system
│       └── landing.css            # Landing page styles
└── vercel.json                    # React Router rewrite rules
```

### ML / NLP Stack

| Tool | Purpose |
|------|---------|
| `sentence-transformers` (all-MiniLM-L6-v2) | Commit message + diff embedding |
| `scipy.stats.entropy` | Shannon entropy of diff tokens |
| `sklearn cosine_similarity` | Semantic novelty between commits |
| `gitpython` | Repo cloning and commit walking |
| `diskcache` | Result caching |
| `D3.js` | Timeline, histogram, sparklines |

---

## Setup — Local Development

### Prerequisites
- Python 3.11+
- Node 20+
- Git

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test: `http://localhost:8000/health` → `{"status":"ok"}`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

### Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_API_URL` | `frontend/.env.local` | `http://localhost:8000` (dev) or Railway URL (prod) |
| `SKIP_PRECACHE` | Railway / backend env | `1` (skip pre-cache on cold deploy) |
| `GITSIGNAL_CACHE_DIR` | Railway / backend env | `/tmp/gitsignal_cache` |

---

## Deployment

### Backend → Railway

1. Push repo to GitHub
2. New Project → Deploy from GitHub → select repo
3. Set root directory: `backend`, builder: `Dockerfile`
4. Generate domain in Settings → Networking
5. Set env vars: `SKIP_PRECACHE=1`, `GITSIGNAL_CACHE_DIR=/tmp/gitsignal_cache`

### Frontend → Vercel

1. New Project → Import GitHub repo
2. Set root directory: `frontend`, framework: Vite
3. Add env var: `VITE_API_URL=https://YOUR_RAILWAY_URL.up.railway.app`
4. Deploy

---

## Notes

- Public repos only — no GitHub token required
- Era split requires ≥5 commits on each side of March 14, 2023
- File heatmap requires files touched in ≥2 commits
- Large repos: use lower `max_commits` (50–100) for faster results
- Results cached for 24 hours per repo + depth combination

---

## License

MIT