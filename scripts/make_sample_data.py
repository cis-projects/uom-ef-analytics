#!/usr/bin/env python3
"""Generate a fake, OpenAlex-shaped raw dump so the dashboard can be previewed without an API key.

    python scripts/make_sample_data.py sample_raw.json
    python scripts/fetch.py --config scripts/sample_lab.yaml --from-raw sample_raw.json
"""
import datetime as dt
import json
import random
import sys

random.seed(7)
YEAR = dt.date.today().year

FIRST = ["Aino", "Mateo", "Priya", "Lukas", "Sofia", "Kenji", "Amara", "Elias", "Noor", "Tomás",
         "Hana", "Oskar", "Leila", "Ravi", "Ingrid", "Diego", "Mei", "Felix", "Zara", "Jonas",
         "Clara", "Arjun", "Yuki", "Emil", "Lina", "Omar", "Freya", "Sami", "Iris", "Nikolai"]
LAST = ["Virtanen", "Okafor", "Lindqvist", "Moreau", "Tanaka", "Bauer", "Haddad", "Novak", "Silva",
        "Kowalski", "Rossi", "Jensen", "Nakamura", "Petrov", "Costa", "Larsen", "Fischer", "Ahmed",
        "Kim", "Andersson", "Duarte", "Weber", "Sato", "Ivanova", "Byrne", "Mäkinen", "Chen", "Ortiz"]
INSTS = [("University of Helsinki", "FI"), ("Aalto University", "FI"), ("KTH Royal Institute of Technology", "SE"),
         ("ETH Zurich", "CH"), ("University of Melbourne", "AU"), ("TU Delft", "NL"), ("University of Toronto", "CA"),
         ("Max Planck Institute for Informatics", "DE"), ("University of Tokyo", "JP"), ("MIT", "US"),
         ("University of Copenhagen", "DK"), ("Inria", "FR"), ("University College London", "GB"),
         ("Stanford University", "US"), ("University of Oslo", "NO"), ("Tampere University", "FI")]
LAB_INST = ("University of Example", "FI")
VENUES = [("Journal of Machine Learning Research", "journal"), ("Nature Communications", "journal"),
          ("IEEE Transactions on Pattern Analysis and Machine Intelligence", "journal"),
          ("Proceedings of the AAAI Conference", "conference"), ("NeurIPS", "conference"),
          ("ACM CHI Conference on Human Factors", "conference"), ("PLOS ONE", "journal"),
          ("Scientific Reports", "journal"), ("International Conference on Learning Representations", "conference"),
          ("Bioinformatics", "journal"), ("ACM Computing Surveys", "journal"), ("Information Sciences", "journal"),
          ("European Conference on Computer Vision", "conference"), ("Lecture Notes in Computer Science", "book series")]
TOPIC = ["Graph", "Federated", "Causal", "Contrastive", "Sparse", "Robust", "Interpretable", "Multimodal",
         "Bayesian", "Self-supervised", "Efficient", "Temporal", "Hierarchical", "Adaptive"]
THING = ["representation learning", "anomaly detection", "transformers", "time-series forecasting",
         "recommendation", "protein structure prediction", "active learning", "knowledge graphs",
         "reinforcement learning", "medical image segmentation", "uncertainty estimation", "text classification"]
TAIL = ["at scale", "for clinical data", "under distribution shift", "with limited labels", "in the wild",
        "on edge devices", "for scientific discovery", "a survey", "revisited", "with theoretical guarantees"]

ROLES = ["PI", "Senior researcher", "Postdoc", "Postdoc", "Postdoc", "PhD student", "PhD student",
         "PhD student", "PhD student", "PhD student", "PhD student", "Research engineer", "PhD student", "Postdoc"]


def person(i):
    return f"{FIRST[i % len(FIRST)]} {LAST[(i * 7) % len(LAST)]}"


def main(path):
    members, authors = [], {}
    for i, role in enumerate(ROLES):
        aid = f"A5{100000000 + i:09d}"
        members.append({"name": person(i), "role": role, "openalex": [aid], "matched_by": "openalex id",
                        "scholar": "https://scholar.google.com/citations?user=EXAMPLE",
                        "active": i not in (12,), "_seniority": [20, 14, 8, 6, 5, 4, 3, 3, 2, 2, 1, 6, 5, 7][i]})
        authors[aid] = {"id": f"https://openalex.org/{aid}", "display_name": person(i)}
    externals = [{"id": f"https://openalex.org/A59{j:08d}", "display_name": person(j + 30) if j < 26
                  else f"{FIRST[(j * 3) % len(FIRST)]} {LAST[(j * 5 + 3) % len(LAST)]}",
                  "inst": INSTS[j % len(INSTS)]} for j in range(160)]
    # a few frequent collaborators
    weights = [8 if j < 10 else 3 if j < 40 else 1 for j in range(len(externals))]

    works, wid = [], 3000000000
    used_titles = set()
    for mi, m in enumerate(members):
        n = int(m["_seniority"] * random.uniform(3, 5)) + 2
        for _ in range(n):
            year = YEAR - random.randint(0, min(m["_seniority"], 14))
            while True:
                title = f"{random.choice(TOPIC)} {random.choice(THING)} {random.choice(TAIL)}".capitalize()
                if title not in used_titles:
                    break
            used_titles.add(title)
            co_lab = random.sample([x for x in range(len(members)) if x != mi], k=random.choice([0, 1, 1, 2]))
            if mi > 1 and random.random() < 0.6:
                co_lab.append(0)  # PI on most student papers
            co_ext = random.choices(externals, weights=weights, k=random.choice([0, 1, 2, 3, 4]))
            if random.random() < 0.03:
                co_ext += random.sample(externals, 30)  # a big consortium paper
            age = YEAR - year
            mu = 1.2 + 0.45 * age + (1.0 if mi == 0 else 0)
            total = int(random.lognormvariate(min(mu, 3.6), 0.9)) if age > 0 else random.randint(0, 4)
            cby = []
            if total:
                ys = list(range(year, YEAR + 1))
                wts = [1 + 2 * (k > 0) + 0.5 * k for k in range(len(ys))]
                wts[-1] *= 0.8  # current year is partial
                alloc = random.choices(ys, weights=wts, k=total)
                cby = [{"year": y, "cited_by_count": alloc.count(y)} for y in sorted(set(alloc), reverse=True)
                       if y >= YEAR - 10]
            venue = random.choice(VENUES)
            auths = [{"author": {"id": authors[members[mi]["openalex"][0]]["id"], "display_name": m["name"]},
                      "institutions": [{"display_name": LAB_INST[0], "country_code": LAB_INST[1]}]}]
            for x in set(co_lab):
                auths.append({"author": {"id": authors[members[x]["openalex"][0]]["id"],
                                         "display_name": members[x]["name"]},
                              "institutions": [{"display_name": LAB_INST[0], "country_code": LAB_INST[1]}]})
            for e in {e["id"]: e for e in co_ext}.values():
                auths.append({"author": {"id": e["id"], "display_name": e["display_name"]},
                              "institutions": [{"display_name": e["inst"][0], "country_code": e["inst"][1]}]})
            random.shuffle(auths)
            wid += 1
            works.append({"id": f"https://openalex.org/W{wid}", "doi": f"https://doi.org/10.5555/example.{wid}",
                          "display_name": title, "publication_year": year, "type": "article",
                          "cited_by_count": total, "counts_by_year": cby, "authorships": auths,
                          "primary_location": {"source": {"display_name": venue[0], "type": venue[1]}}})
            if random.random() < 0.12:  # an arXiv preprint of the same paper
                wid += 1
                works.append({**works[-1], "id": f"https://openalex.org/W{wid}", "cited_by_count": total // 4,
                              "counts_by_year": [], "publication_year": year,
                              "primary_location": {"source": {"display_name": "arXiv (Cornell University)",
                                                              "type": "repository"}}})
    for m in members:
        m.pop("_seniority")
    raw = {"fetched_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
           "members": members, "authors": authors, "works": works}
    with open(path, "w") as f:
        json.dump(raw, f)
    with open(path.replace(".json", "_lab.yaml"), "w") as f:
        f.write('lab:\n  name: "Example Lab"\n  institution: "University of Example"\n'
                '  description: "Sample data - not real people or papers."\n'
                "settings:\n  merge_duplicate_titles: true\n  network_max_authors: 25\nmembers:\n")
        for m in members:
            f.write(f'  - name: {m["name"]}\n    role: {m["role"]}\n    openalex: [{m["openalex"][0]}]\n'
                    f'    scholar: {m["scholar"]}\n' + ("    active: false\n" if not m["active"] else ""))
    print(f"wrote {len(members)} members, {len(works)} works -> {path}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "sample_raw.json")
