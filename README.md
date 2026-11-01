# Lab Scholar Dashboard

A static website showing your lab's publications, citations and collaborations, built from
[OpenAlex](https://openalex.org) and refreshed automatically once a month by GitHub Actions.

**What's on it**

- **Overview** – lab-wide papers, citations, h-index, citations per year, running total, and a
  sortable table of every member.
- **Members** – one page per person: citation growth, papers per year, top venues, collaborators
  in the lab, and two "watch lists":
  - *Next h-index*: exactly which papers need how many more citations to lift the h-index by one,
    with an estimate of how long each will take at its current citation pace.
  - *Close to 10 citations*: papers that would raise the i10-index.
- **Network** – one member at a time: the selected person in the centre, everyone they have
  published with around them. Circle size = papers with that person; line width = papers the two
  ends wrote together (including between co-authors). Press **Play** to watch it grow year by year
  from their first paper; click anyone to see the papers you share. Also lists their collaborating
  institutions and co-authors.
- **Venues** – every journal and conference the lab publishes in, with citations per paper.
- **Papers** – searchable, filterable list of all lab papers.

Papers co-authored by several members are counted once in lab totals. A preprint and its
published version are merged into one paper (like Google Scholar does).

---

## Setup (about 10 minutes)

### 1. Put these files in your new repository
Copy everything in this folder into the repo and push it to the `main` branch.

### 2. Add your OpenAlex API key as a secret
In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret**

- Name: `OPENALEX_API_KEY`
- Value: your key from <https://openalex.org/settings/api>

The key stays encrypted on GitHub; it is never written into the code or the website.

### 3. Turn on GitHub Pages
**Settings → Pages → Build and deployment → Source: GitHub Actions**

> Pages on a *private* repo needs a paid GitHub plan (or GitHub Education). On a free plan, make
> the repo public; everything shown is already public bibliographic data.

### 4. List your lab members in `lab.yaml`
For each person, give one of:

| Field | Example | Notes |
|---|---|---|
| `openalex` | `[A5023888391]` | Most reliable. Use a list if OpenAlex split one person into several profiles. |
| `orcid` | `0000-0002-1825-0097` | Easiest: the script looks up their OpenAlex profile from it automatically. |
| *(name only)* | | Matched by name + `lab.institution`. Check the result on the site. |

One API key (yours) fetches data for everyone. Google Scholar links can't be used for the
lookup (OpenAlex doesn't know Scholar IDs), but add them as `scholar:` so they're linked from each
member's page. After the first run, compare each member's paper count with their Scholar profile;
a much lower count usually means OpenAlex split them into two profiles (add both IDs under
`openalex:`), a much higher one that it merged them with a namesake (use `exclude_works:`).

Also add, `role:`, and
`active: false` for alumni.

To find someone's OpenAlex ID, either search for them at <https://openalex.org> (the ID is in the
author page URL), or run locally:

```bash
pip install -r requirements.txt
export OPENALEX_API_KEY=your-key       # Windows: set OPENALEX_API_KEY=your-key
python scripts/fetch.py --find "Jane Doe"
```

If OpenAlex has wrongly attributed a paper to someone, add its ID (e.g. `W2741809807`) under
that person's `exclude_works:`.

### 5. Run it
Commit `lab.yaml`. The workflow runs on every change to it, on the 1st of every month, and
whenever you press **Actions → Update dashboard → Run workflow**. When it finishes, the site
is live at `https://<your-username>.github.io/<repo-name>/`.

---

## Exact Google Scholar numbers (recommended)

OpenAlex sees fewer citations than Google Scholar, especially in fields where many citing
documents are theses, reports or proceedings. To show each member's numbers exactly as on their
Scholar profile, the site can read the profiles through [SerpApi](https://serpapi.com):

1. Create a free SerpApi account (100 searches/month) and copy your API key.
2. Add it as a repository secret named `SERPAPI_KEY` (same place as `OPENALEX_API_KEY`).
3. Make sure every member in `lab.yaml` has a `scholar:` link.

Each member costs one search per refresh (one more per 100 papers), and profiles are re-read at
most every `scholar_refresh_days` (default 20), so a small lab uses a handful of searches a month.
The cached profiles are kept in `data/scholar_cache.json`.

With the key set, citations, h-index, i10-index, citations per year, papers and the h-index/i10
watch lists come from Google Scholar. Venues, the Papers tab and the collaboration network still
come from OpenAlex, because Scholar doesn't provide co-author IDs or venue types. Each member page
shows both totals ("OpenAlex finds …") so you can spot records that need fixing.

## How the numbers work

- **Source:** OpenAlex, a free and open index of ~250M scholarly works. Its citation counts are
  typically somewhat lower than Google Scholar's, because Scholar also counts preprints, theses,
  slides and some duplicates.
- **Citations per year** come from each paper's yearly counts, which cover roughly the last ten
  years. The running total is today's total minus what arrived in later years.
- **Monthly snapshots:** every run appends a snapshot to `site/data/history.json`, so the
  "Monthly snapshots" chart appears from the second month and gets more detailed over time.
- **h-index watch:** with h-index *h*, reaching *h+1* needs *h+1* papers with at least *h+1*
  citations. The list shows the papers closest to that line and how many citations each still
  needs; the time estimate uses each paper's citations in the last full year (or this year's pace,
  if faster).
- **Network:** papers with more than `network_max_authors` authors (default 25) are left out so
  big consortium papers don't connect everyone to everyone. Edges are drawn between lab members
  and their co-authors.

## Preview locally with sample data

```bash
pip install -r requirements.txt
python scripts/make_sample_data.py sample_raw.json
python scripts/fetch.py --config sample_raw_lab.yaml --from-raw sample_raw.json
python -m http.server -d site 8000      # then open http://localhost:8000
```

(The sample uses invented people and papers. The next real run overwrites it.)

## Files

```
lab.yaml                      ← the only file you normally edit
scripts/fetch.py              fetches from OpenAlex and computes everything
scripts/make_sample_data.py   fake data for previewing
site/                         the website (index.html, app.js, style.css)
site/data/                    generated data, committed by the workflow
.github/workflows/update.yml  monthly refresh + deploy to GitHub Pages
```
