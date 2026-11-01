#!/usr/bin/env python3
"""
Build the lab dashboard dataset from OpenAlex.

    OPENALEX_API_KEY=... python scripts/fetch.py            # fetch + build site/data/*.json
    OPENALEX_API_KEY=... python scripts/fetch.py --find "Jane Doe"   # look up a person's OpenAlex ID
    python scripts/fetch.py --from-raw raw.json             # rebuild from a saved raw dump (no network)

Outputs
    site/data/data.json      everything the dashboard shows
    site/data/history.json   one snapshot per month (grows over time -> precise growth curves)
"""
from __future__ import annotations

import argparse
import datetime as dt
import difflib
import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.openalex.org"
WORK_FIELDS = ",".join([
    "id", "doi", "display_name", "publication_year", "publication_date", "type",
    "cited_by_count", "counts_by_year", "authorships", "primary_location",
])


# ------------------------------------------------------------------ OpenAlex client
class OpenAlex:
    def __init__(self, api_key: str | None):
        import requests  # imported here so --from-raw works without it
        self.s = requests.Session()
        self.key = api_key
        self.calls = 0

    def get(self, path: str, **params):
        if self.key:
            params["api_key"] = self.key
        for attempt in range(6):
            r = self.s.get(f"{API}{path}", params=params, timeout=60)
            self.calls += 1
            if r.status_code == 200:
                return r.json()
            if r.status_code in (429, 500, 502, 503, 504):
                wait = 2 ** attempt
                print(f"  OpenAlex {r.status_code}, retrying in {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            if r.status_code == 404:
                return None
            r.raise_for_status()
        raise RuntimeError(f"OpenAlex kept failing for {path}")

    def author(self, ident: str):
        return self.get(f"/authors/{ident}")

    def search_authors(self, name: str, n: int = 10):
        res = self.get("/authors", search=name, per_page=n)
        return (res or {}).get("results", [])

    def works_for(self, author_ids: list[str]):
        out, cursor = [], "*"
        flt = "author.id:" + "|".join(author_ids)
        while cursor:
            res = self.get("/works", filter=flt, per_page=200, cursor=cursor, select=WORK_FIELDS)
            if not res:
                break
            out.extend(res.get("results", []))
            cursor = res.get("meta", {}).get("next_cursor")
            if not res.get("results"):
                break
        return out


def short(oa_id: str | None) -> str | None:
    if not oa_id:
        return None
    return oa_id.rsplit("/", 1)[-1]


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def norm_title(t: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", (t or "").lower())


def institution_names(author: dict) -> list[str]:
    names = [i.get("display_name", "") for i in (author.get("last_known_institutions") or [])]
    names += [a.get("institution", {}).get("display_name", "") for a in (author.get("affiliations") or [])]
    return [n for n in names if n]


# ------------------------------------------------------------------ fetching
def resolve_members(cfg: dict, oa: OpenAlex) -> list[dict]:
    lab_inst = (cfg.get("lab", {}).get("institution") or "").lower()
    resolved = []
    for m in cfg["members"]:
        ids = m.get("openalex") or []
        if isinstance(ids, str):
            ids = [ids]
        ids = [short(i) for i in ids]
        how = "openalex id"
        if not ids and m.get("orcid"):
            a = oa.author(f"orcid:{m['orcid']}")
            if a:
                ids, how = [short(a["id"])], "orcid"
        if not ids:
            cands = oa.search_authors(m["name"])
            match = [c for c in cands if lab_inst and any(lab_inst in n.lower() for n in institution_names(c))]
            if match:
                best = max(match, key=lambda c: c.get("works_count", 0))
                ids, how = [short(best["id"])], "name + institution (please verify)"
        if not ids:
            print(f"  ! Could not identify {m['name']} - add an openalex: or orcid: entry", file=sys.stderr)
        else:
            print(f"  {m['name']}: {', '.join(ids)}  [{how}]")
        resolved.append({**m, "openalex": ids, "matched_by": how if ids else None})
    return resolved


def fetch_raw(cfg: dict, api_key: str | None) -> dict:
    oa = OpenAlex(api_key)
    print("Resolving members...")
    members = resolve_members(cfg, oa)
    print("Fetching works...")
    works: dict[str, dict] = {}
    authors: dict[str, dict] = {}
    for m in members:
        if not m["openalex"]:
            continue
        for aid in m["openalex"]:
            a = oa.author(aid)
            if a:
                authors[aid] = {k: a.get(k) for k in ("id", "display_name", "orcid", "works_count",
                                                       "cited_by_count", "summary_stats", "counts_by_year",
                                                       "last_known_institutions")}
        ws = oa.works_for(m["openalex"])
        for w in ws:
            works[short(w["id"])] = w
        print(f"  {m['name']}: {len(ws)} works")
    print(f"Done: {len(works)} unique works, {oa.calls} API calls")
    return {"fetched_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "members": members, "authors": authors, "works": list(works.values())}


def fetch_citing_countries(oa: OpenAlex, work_ids: list[str]) -> dict:
    """Where the lab is cited from: countries of the authors of every paper citing lab papers,
    per year of the citing paper. Uses OpenAlex group_by, so ~1 call per 100 lab papers per year."""
    by_year: dict[str, Counter] = defaultdict(Counter)
    papers_by_year: Counter = Counter()
    ids = sorted(set(work_ids))
    for i in range(0, len(ids), 100):
        flt = "cites:" + "|".join(ids[i:i + 100])
        res = oa.get("/works", filter=flt, group_by="publication_year") or {}
        for g in res.get("group_by", []):
            y = str(g.get("key"))
            if not y.isdigit():
                continue
            papers_by_year[y] += g.get("count", 0)
            r = oa.get("/works", filter=f"{flt},publication_year:{y}", group_by="authorships.countries") or {}
            for c in r.get("group_by", []):
                cc = short(str(c.get("key") or ""))
                if cc and len(cc) == 2 and cc.isalpha():
                    by_year[y][cc.upper()] += c.get("count", 0)
    print(f"Citing countries: {len({c for v in by_year.values() for c in v})} countries, "
          f"~{sum(papers_by_year.values())} citing papers")
    return {"by_year": {y: dict(c) for y, c in sorted(by_year.items())}, "papers_by_year": dict(sorted(papers_by_year.items()))}


# ------------------------------------------------------------------ Google Scholar (via SerpApi)
def scholar_id(url: str | None) -> str | None:
    m = re.search(r"[?&]user=([\w-]+)", url or "")
    return m.group(1) if m else None


def fetch_scholar(members: list[dict], key: str | None, cache_path: Path, max_age_days: int) -> dict:
    """Each member's Google Scholar profile (headline numbers, citations per year, every article
    with its citation count). Cached so re-runs within `max_age_days` cost no SerpApi searches."""
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    now = dt.datetime.now(dt.timezone.utc)
    out, calls = {}, 0
    for m in members:
        sid = scholar_id(m.get("scholar"))
        if not sid:
            continue
        cached = cache.get(sid)
        if cached and (now - dt.datetime.fromisoformat(cached["fetched_at"])).days < max_age_days:
            out[sid] = cached
            continue
        if not key:
            if cached:
                out[sid] = cached
            continue
        import requests
        prof, arts, start = None, [], 0
        try:
            while True:
                r = requests.get("https://serpapi.com/search.json", timeout=90, params={
                    "engine": "google_scholar_author", "author_id": sid, "api_key": key,
                    "hl": "en", "num": 100, "start": start})
                calls += 1
                r.raise_for_status()
                j = r.json()
                if j.get("error"):
                    raise RuntimeError(j["error"])
                if prof is None:
                    prof = {"name": (j.get("author") or {}).get("name"), "cited_by": j.get("cited_by") or {}}
                page = j.get("articles") or []
                for a in page:
                    y = str(a.get("year") or "")
                    arts.append({"title": a.get("title"), "link": a.get("link"), "authors": a.get("authors"),
                                 "publication": a.get("publication"), "year": int(y) if y.isdigit() else None,
                                 "cites": (a.get("cited_by") or {}).get("value") or 0})
                if len(page) < 100 or start >= 900 or not (j.get("serpapi_pagination") or {}).get("next"):
                    break
                start += 100
        except Exception as e:  # keep last month's numbers rather than failing the whole run
            print(f"  ! Google Scholar fetch failed for {m['name']}: {e}", file=sys.stderr)
            if cached:
                out[sid] = cached
            continue
        out[sid] = {"fetched_at": now.isoformat(timespec="seconds"), **prof, "articles": arts}
        print(f"  {m['name']}: {len(arts)} Google Scholar articles")
    cache.update(out)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(cache, indent=1, ensure_ascii=False))
    print(f"Google Scholar: {len(out)} profile(s), {calls} SerpApi search(es) used")
    return out


def scholar_metric(prof: dict, name: str):
    for row in (prof.get("cited_by") or {}).get("table") or []:
        if name in row:
            return row[name].get("all")
    return None


# ------------------------------------------------------------------ metrics
def h_index(cites: list[int]) -> int:
    c = sorted(cites, reverse=True)
    return sum(1 for i, x in enumerate(c, 1) if x >= i)


def h_watch(papers: list[dict], this_year: int) -> dict:
    """What it takes to reach h+1: which papers, and how many more citations each."""
    cites = [p["cited_by_count"] for p in papers]
    h = h_index(cites)
    target = h + 1
    have = sum(1 for c in cites if c >= target)
    below = sorted([p for p in papers if p["cited_by_count"] < target],
                   key=lambda p: -p["cited_by_count"])
    picks = []
    for p in below[: max(target - have, 0)]:
        need = target - p["cited_by_count"]
        rate = annual_rate(p, this_year)
        picks.append({"id": p["id"], "need": need, "title": p["title"], "year": p.get("year"),
                      "c": p["cited_by_count"], "link": p.get("link") or p.get("doi"),
                      "rate": round(rate, 1),
                      "eta_months": round(12 * need / rate) if rate > 0 else None})
    return {"h": h, "target": target, "papers_needed": max(target - have, 0),
            "citations_needed": sum(p["need"] for p in picks), "papers": picks}


def annual_rate(p: dict, this_year: int) -> float:
    """Citations per year recently: last full year, blended with this year's pace."""
    cby = p.get("cby", {})
    last = cby.get(str(this_year - 1), 0)
    now = cby.get(str(this_year), 0)
    frac = max(dt.date.today().timetuple().tm_yday / 365, 0.15)
    return max(last, now / frac) if (last or now) else 0.0


def i10_watch(papers: list[dict]) -> list[dict]:
    near = [p for p in papers if 7 <= p["cited_by_count"] < 10]
    return [{"id": p["id"], "need": 10 - p["cited_by_count"], "title": p["title"], "year": p.get("year"),
             "c": p["cited_by_count"], "link": p.get("link") or p.get("doi")}
            for p in sorted(near, key=lambda p: -p["cited_by_count"])]


def per_year(papers: list[dict], key: str = "cby") -> dict[str, int]:
    tot: Counter = Counter()
    for p in papers:
        for y, n in p.get(key, {}).items():
            tot[y] += n
    return dict(sorted(tot.items()))


def cumulative(total: int, by_year: dict[str, int], years: list[int]) -> dict[str, int]:
    """Total citations at the end of each year = today's total minus everything received later."""
    out = {}
    for y in years:
        later = sum(n for yy, n in by_year.items() if int(yy) > y)
        out[str(y)] = max(total - later, 0)
    return out


# ------------------------------------------------------------------ build
def scholar_matches(works: list[dict], gs_titles: list[str]) -> set[str]:
    """IDs of OpenAlex works that also appear on the member's Google Scholar profile (by title)."""
    gs = [norm_title(t) for t in gs_titles if t]
    gss = set(gs)
    hit = set()
    for w in works:
        t = norm_title(w["title"])
        if not t:
            continue
        if t in gss or any(len(g) >= 30 and (t.startswith(g) or g.startswith(t)) for g in gs):
            hit.add(w["id"])
            continue
        for g in gs:
            sm = difflib.SequenceMatcher(None, t, g)
            if sm.real_quick_ratio() >= 0.9 and sm.quick_ratio() >= 0.9 and sm.ratio() >= 0.9:
                hit.add(w["id"])
                break
    return hit


def apply_scholar(om: dict, prof: dict, oa_works: list[dict], this_year: int) -> None:
    """Replace a member's headline numbers with their Google Scholar profile's."""
    arts = [a for a in prof["articles"] if a.get("title")]
    oa_by_title = {norm_title(w["title"]): w for w in oa_works}
    papers = []
    for i, a in enumerate(arts):
        oa = oa_by_title.get(norm_title(a["title"]))
        cby = {}
        if oa and oa["cby"]:  # borrow OpenAlex's yearly pattern (scaled) to estimate citation pace
            f = a["cites"] / oa["cited_by_count"] if oa["cited_by_count"] else 1
            cby = {y: n * f for y, n in oa["cby"].items()}
        papers.append({"id": f"S{i}", "title": a["title"], "year": a["year"], "cited_by_count": a["cites"],
                       "venue": a.get("publication"), "link": a.get("link"), "authors": a.get("authors"),
                       "cby": cby})
    cites = [p["cited_by_count"] for p in papers]
    graph = {str(g["year"]): g["citations"] for g in (prof.get("cited_by") or {}).get("graph") or []
             if g.get("year")}
    total = scholar_metric(prof, "citations") or sum(cites)
    last, prev = graph.get(str(this_year - 1), 0), graph.get(str(this_year - 2), 0)
    years = sorted({int(y) for y in graph} | {this_year})
    years = list(range(max(min(years), this_year - 14), this_year + 1))
    om.update({
        "source": "Google Scholar", "scholar_name": prof.get("name"), "scholar_fetched": prof.get("fetched_at"),
        "works": len(papers), "citations": total,
        "h": scholar_metric(prof, "h_index") or h_index(cites),
        "i10": scholar_metric(prof, "i10_index") or sum(1 for c in cites if c >= 10),
        "cites_last_year": last, "growth": round((last - prev) / prev * 100) if prev else None,
        "cites_by_year": graph, "years": years,
        "cumulative": cumulative(total, graph, years),
        "pubs_by_year": dict(sorted(Counter(str(p["year"]) for p in papers if p["year"]).items())),
        "h_watch": h_watch(papers, this_year),
        "i10_watch": i10_watch(papers),
        "first_year": min((p["year"] for p in papers if p["year"]), default=None),
        "scholar_papers": [{"title": p["title"], "year": p["year"], "c": p["cited_by_count"],
                            "venue": p["venue"], "link": p["link"], "authors": p["authors"]}
                           for p in sorted(papers, key=lambda p: -p["cited_by_count"])],
    })



def build(cfg: dict, raw: dict, scholar: dict | None = None) -> dict:
    scholar = scholar or {}
    st = cfg.get("settings", {})
    excl_types = set(st.get("exclude_types", []))
    max_auth = int(st.get("network_max_authors", 25))
    today = dt.date.today()
    this_year = today.year

    members = []
    id2slug: dict[str, str] = {}
    for m in raw["members"]:
        slug = slugify(m["name"])
        members.append({"slug": slug, **m})
        for aid in m.get("openalex") or []:
            id2slug[aid] = slug

    # --- normalise works
    works: dict[str, dict] = {}
    for w in raw["works"]:
        if w.get("type") in excl_types:
            continue
        src = ((w.get("primary_location") or {}).get("source") or {})
        auths = []
        for a in w.get("authorships") or []:
            aid = short((a.get("author") or {}).get("id"))
            insts = [i.get("display_name") for i in a.get("institutions") or [] if i.get("display_name")]
            ccs = [i.get("country_code") for i in a.get("institutions") or [] if i.get("country_code")]
            auths.append({"id": aid, "name": (a.get("author") or {}).get("display_name") or a.get("raw_author_name"),
                          "inst": insts[0] if insts else None, "cc": ccs[0] if ccs else None})
        wid = short(w["id"])
        works[wid] = {
            "id": wid,
            "title": w.get("display_name") or "(untitled)",
            "year": w.get("publication_year"),
            "doi": w.get("doi"),
            "type": w.get("type"),
            "venue": src.get("display_name"),
            "venue_type": src.get("type") or "other",
            "cited_by_count": w.get("cited_by_count") or 0,
            "cby": {str(c["year"]): c["cited_by_count"] for c in w.get("counts_by_year") or []
                    if c.get("cited_by_count")},
            "authors": auths,
            "versions": 1,
        }

    # --- merge preprint/published duplicates (same normalised title)
    if st.get("merge_duplicate_titles", True):
        groups = defaultdict(list)
        for w in works.values():
            t = norm_title(w["title"])
            if len(t) >= 25:
                groups[t].append(w)
        for grp in groups.values():
            if len(grp) < 2:
                continue
            # canonical: most cited, prefer a non-repository venue on ties
            grp.sort(key=lambda w: (w["cited_by_count"], w["venue_type"] != "repository"), reverse=True)
            keep = grp[0]
            seen = {a["id"] for a in keep["authors"]}
            for other in grp[1:]:
                for a in other["authors"]:
                    if a["id"] not in seen:
                        keep["authors"].append(a)
                        seen.add(a["id"])
                if keep["venue_type"] == "repository" and other["venue_type"] != "repository":
                    keep["venue"], keep["venue_type"] = other["venue"], other["venue_type"]
                keep["versions"] += 1
                works.pop(other["id"], None)

    # --- attach lab members to each work
    for w in works.values():
        w["lab"] = sorted({id2slug[a["id"]] for a in w["authors"] if a["id"] in id2slug})
    works = {k: w for k, w in works.items() if w["lab"]}

    # member-level exclusions
    excl = {m["slug"]: set(m.get("exclude_works") or []) for m in members}
    for w in works.values():
        w["lab"] = [s for s in w["lab"] if w["id"] not in excl[s]]
    works = {k: w for k, w in works.items() if w["lab"]}

    # When a member has a Google Scholar profile, trust it for WHICH papers are theirs: OpenAlex
    # sometimes merges namesakes into one author record, which would put strangers in the network.
    dropped: dict[str, int] = {}
    if st.get("scholar_filters_openalex", True):
        for m in members:
            prof = scholar.get(scholar_id(m.get("scholar")) or "")
            if not prof or not prof.get("articles"):
                continue
            mine = [w for w in works.values() if m["slug"] in w["lab"]]
            keep = scholar_matches(mine, [a.get("title") for a in prof["articles"]])
            dropped[m["slug"]] = len(mine) - len(keep)
            for w in mine:
                if w["id"] not in keep:
                    w["lab"] = [s for s in w["lab"] if s != m["slug"]]
            if dropped[m["slug"]]:
                print(f"  {m['name']}: {dropped[m['slug']]} OpenAlex paper(s) not on their Scholar profile left out")
        works = {k: w for k, w in works.items() if w["lab"]}

    all_years = sorted({int(y) for w in works.values() for y in w["cby"]} |
                       {w["year"] for w in works.values() if w["year"]})
    chart_years = [y for y in all_years if y >= this_year - 10] or [this_year]

    # --- per member
    out_members = []
    for m in members:
        mine = [w for w in works.values() if m["slug"] in w["lab"]]
        cites = [w["cited_by_count"] for w in mine]
        total = sum(cites)
        cby = per_year(mine)
        pubs = Counter(str(w["year"]) for w in mine if w["year"])
        venues = Counter((w["venue"], w["venue_type"]) for w in mine if w["venue"])
        vtypes = Counter(w["venue_type"] for w in mine)
        coauth_ext = Counter()
        coauth_lab = Counter()
        for w in mine:
            for a in w["authors"]:
                if a["id"] in id2slug:
                    s = id2slug[a["id"]]
                    if s != m["slug"]:
                        coauth_lab[s] += 1
                elif a["id"]:
                    coauth_ext[a["id"]] += 1
        last = cby.get(str(this_year - 1), 0)
        prev = cby.get(str(this_year - 2), 0)
        out_members.append({
            "slug": m["slug"], "name": m["name"], "role": m.get("role"),
            "active": m.get("active", True), "scholar": m.get("scholar"), "orcid": m.get("orcid"),
            "openalex": m.get("openalex") or [], "matched_by": m.get("matched_by"),
            "works": len(mine), "citations": total,
            "h": h_index(cites), "i10": sum(1 for c in cites if c >= 10),
            "cites_last_year": last, "growth": round((last - prev) / prev * 100) if prev else None,
            "cites_by_year": cby,
            "cumulative": cumulative(total, cby, chart_years),
            "pubs_by_year": dict(sorted(pubs.items())),
            "h_watch": h_watch(mine, this_year),
            "i10_watch": i10_watch(mine),
            "venues": [{"name": n, "type": t, "count": c} for (n, t), c in venues.most_common(15)],
            "venue_types": dict(vtypes),
            "collab_lab": dict(coauth_lab.most_common()),
            "collab_external": len(coauth_ext),
            "first_year": min((w["year"] for w in mine if w["year"]), default=None),
            "source": "OpenAlex", "years": chart_years,
        })
        om = out_members[-1]
        om["openalex_counts"] = {"works": om["works"], "citations": om["citations"], "h": om["h"],
                                 "dropped": dropped.get(m["slug"], 0)}
        prof = scholar.get(scholar_id(m.get("scholar")) or "")
        if prof and prof.get("articles") is not None:
            apply_scholar(om, prof, mine, this_year)

    # --- lab level (each paper counted once)
    lab_works = list(works.values())
    lab_cites = [w["cited_by_count"] for w in lab_works]
    lab_cby = per_year(lab_works)
    lab_total = sum(lab_cites)
    lab_source, lab_n = "OpenAlex", len(lab_works)
    lab_years = chart_years
    if out_members and all(om["source"] == "Google Scholar" for om in out_members):
        best: dict[str, int] = {}
        for om in out_members:
            for p in om["scholar_papers"]:
                k = norm_title(p["title"]) or p["title"]
                best[k] = max(best.get(k, 0), p["c"])
        lab_cites = list(best.values())
        lab_total, lab_n, lab_source = sum(lab_cites), len(best), "Google Scholar"
        lab_cby = dict(sorted(sum((Counter(om["cites_by_year"]) for om in out_members), Counter()).items()))
        lab_years = sorted({int(y) for y in lab_cby} | {this_year})
        lab_years = [y for y in lab_years if y >= this_year - 14]
    venues = Counter((w["venue"], w["venue_type"]) for w in lab_works if w["venue"])

    # --- collaboration network (lab members + everyone they co-authored with)
    nodes: dict[str, dict] = {}
    edges: Counter = Counter()
    inst_counter: Counter = Counter()
    country_counter: Counter = Counter()
    ext_inst: dict[str, Counter] = defaultdict(Counter)
    for m in out_members:
        nodes[m["slug"]] = {"id": m["slug"], "label": m["name"], "lab": True, "papers": m["works"],
                            "active": m["active"], "role": m["role"], "y": m["pubs_by_year"]}
    edge_years: dict[tuple, Counter] = defaultdict(Counter)
    for w in lab_works:
        if len(w["authors"]) > max_auth:
            continue
        keys = []
        yr = str(w["year"] or this_year)  # year of the paper, for the growing-network animation
        for a in w["authors"]:
            if a["id"] in id2slug:
                keys.append(id2slug[a["id"]])
            elif a["id"]:
                keys.append(a["id"])
                n = nodes.setdefault(a["id"], {"id": a["id"], "label": a["name"], "lab": False, "papers": 0,
                                               "y": Counter()})
                n["papers"] += 1
                n["y"][yr] += 1
                if a["inst"]:
                    ext_inst[a["id"]][a["inst"]] += 1
        keys = sorted(set(keys))
        lab_keys = [k for k in keys if k in nodes and nodes[k]["lab"]]
        for i, a in enumerate(keys):
            for b in keys[i + 1:]:
                if a in lab_keys or b in lab_keys:  # keep edges that touch the lab
                    edges[(a, b)] += 1
                    edge_years[(a, b)][yr] += 1
        for inst in {a["inst"] for a in w["authors"] if a["inst"] and a["id"] not in id2slug}:
            inst_counter[inst] += 1
        for cc in {a["cc"] for a in w["authors"] if a["cc"] and a["id"] not in id2slug}:
            country_counter[cc] += 1
    for nid, c in ext_inst.items():
        nodes[nid]["inst"] = c.most_common(1)[0][0]
    for n in nodes.values():
        n["y"] = dict(n["y"])

    data = {
        "generated_at": raw.get("fetched_at") or dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": "OpenAlex",
        "lab": cfg.get("lab", {}),
        "years": chart_years,
        "network_max_authors": max_auth,
        "summary": {
            "members": len(out_members), "works": lab_n, "citations": lab_total,
            "h": h_index(lab_cites), "i10": sum(1 for c in lab_cites if c >= 10),
            "cites_by_year": lab_cby, "cumulative": cumulative(lab_total, lab_cby, lab_years),
            "source": lab_source, "years": lab_years,
            "pubs_by_year": dict(sorted(Counter(str(w["year"]) for w in lab_works if w["year"]).items())),
            "venues": [{"name": n, "type": t, "count": c} for (n, t), c in venues.most_common(25)],
            "venue_types": dict(Counter(w["venue_type"] for w in lab_works)),
            "institutions": [{"name": n, "count": c} for n, c in inst_counter.most_common(20)],
            "countries": dict(country_counter.most_common(30)),
            "external_collaborators": sum(1 for n in nodes.values() if not n["lab"]),
        },
        "members": out_members,
        "works": sorted(lab_works, key=lambda w: (-w["cited_by_count"], w["title"])),
        "network": {"nodes": list(nodes.values()),
                    "edges": [{"from": a, "to": b, "w": n, "y": dict(edge_years[(a, b)])}
                              for (a, b), n in edges.items()]},
    }
    for w in data["works"]:  # trim payload
        w["authors"] = [{"id": a["id"], "name": a["name"]} for a in w["authors"]]
    return data


def update_history(data: dict, path: Path) -> list:
    hist = json.loads(path.read_text()) if path.exists() else []
    month = data["generated_at"][:7]
    snap = {"date": data["generated_at"][:10],
            "lab": {k: data["summary"][k] for k in ("works", "citations", "h", "i10")},
            "members": {m["slug"]: {k: m[k] for k in ("works", "citations", "h", "i10")}
                        for m in data["members"]}}
    hist = [h for h in hist if h["date"][:7] != month] + [snap]
    hist.sort(key=lambda h: h["date"])
    path.write_text(json.dumps(hist, separators=(",", ":")))
    return hist


# ------------------------------------------------------------------ CLI
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=str(ROOT / "lab.yaml"))
    ap.add_argument("--out", default=str(ROOT / "site" / "data"))
    ap.add_argument("--find", metavar="NAME", help="search OpenAlex for a person and print candidate IDs")
    ap.add_argument("--from-raw", metavar="FILE", help="build from a saved raw dump instead of fetching")
    ap.add_argument("--save-raw", metavar="FILE", help="also save the raw OpenAlex dump")
    ap.add_argument("--scholar-cache", default=str(ROOT / "data" / "scholar_cache.json"),
                    help="where Google Scholar profiles are cached between runs")
    args = ap.parse_args()

    key = os.environ.get("OPENALEX_API_KEY")

    if args.find:
        oa = OpenAlex(key)
        for c in oa.search_authors(args.find):
            insts = "; ".join(institution_names(c)[:2]) or "-"
            print(f"{short(c['id']):>13}  {c['display_name']:<30} works={c.get('works_count', 0):<5} "
                  f"cites={c.get('cited_by_count', 0):<6} orcid={short(c.get('orcid')) or '-':<20} {insts}")
        return

    cfg = yaml.safe_load(Path(args.config).read_text())
    if args.from_raw:
        raw = json.loads(Path(args.from_raw).read_text())
    else:
        if not key:
            sys.exit("Set OPENALEX_API_KEY (free at https://openalex.org/settings/api)")
        raw = fetch_raw(cfg, key)
        if args.save_raw:
            Path(args.save_raw).write_text(json.dumps(raw))

    st = cfg.get("settings", {})
    scholar = raw.get("scholar")
    if scholar is None:
        print("Google Scholar profiles...")
        scholar = fetch_scholar(raw["members"], os.environ.get("SERPAPI_KEY"),
                                Path(args.scholar_cache), int(st.get("scholar_refresh_days", 20)))
    data = build(cfg, raw, scholar)
    citing = raw.get("citing")
    if citing is None and key and not args.from_raw and st.get("citing_countries", True):
        print("Where the lab is cited from...")
        try:
            citing = fetch_citing_countries(OpenAlex(key), [w["id"] for w in data["works"]])
        except Exception as e:  # never lose the whole run over the map
            print(f"  ! citing-countries lookup failed: {e}", file=sys.stderr)
    if citing:
        data["citing"] = citing
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "data.json").write_text(json.dumps(data, separators=(",", ":")))
    hist = update_history(data, out / "history.json")
    s = data["summary"]
    print(f"Wrote {out/'data.json'}: {s['members']} members, {s['works']} papers, "
          f"{s['citations']} citations, lab h-index {s['h']} [{s['source']}]; {len(hist)} monthly snapshot(s)")


if __name__ == "__main__":
    main()
