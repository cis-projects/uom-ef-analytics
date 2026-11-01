/* Lab Scholar Dashboard — reads data/data.json (+ data/history.json) built by scripts/fetch.py */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => (n == null ? "–" : Number(n).toLocaleString("en-US"));
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  let D, H = [], THIS_YEAR, LAST_YEAR;
  const byId = {}, members = {}, charts = {};
  const rendered = {};

  // ------------------------------------------------------------ load
  Promise.all([
    fetch("data/data.json").then((r) => { if (!r.ok) throw new Error("data.json not found"); return r.json(); }),
    fetch("data/history.json").then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ]).then(([d, h]) => {
    D = d; H = h;
    THIS_YEAR = Number((D.generated_at || "").slice(0, 4)) || new Date().getFullYear();
    LAST_YEAR = THIS_YEAR - 1;
    D.works.forEach((w) => (byId[w.id] = w));
    D.members.forEach((m) => (members[m.slug] = m));
    init();
  }).catch((e) => {
    $("main").innerHTML = `<div class="card"><h3>No data yet</h3><p class="muted">${esc(e.message)}. Run <code>python scripts/fetch.py</code> (or the GitHub Action) to generate it.</p></div>`;
  });

  function init() {
    const lab = D.lab || {};
    document.title = lab.name ? `${lab.name} · Publications` : document.title;
    $("#lab-name").textContent = lab.name || "Lab dashboard";
    $("#lab-desc").textContent = lab.description || "";
    const gs = D.members.some((m) => m.source === "Google Scholar");
    $("#foot").innerHTML = gs
      ? `Citation numbers from each member's Google Scholar profile; venues and the collaboration network from <a href="https://openalex.org">OpenAlex</a>. Updated ${esc(D.generated_at.slice(0, 10))}.`
      : `Data from <a href="https://openalex.org">OpenAlex</a>, updated ${esc(D.generated_at.slice(0, 10))}. ` +
        `Citation counts are usually somewhat lower than Google Scholar's, which also counts preprints, theses and some duplicates. ` +
        `Per-year citations cover roughly the last ten years.`;
    window.addEventListener("hashchange", route);
    route();
  }

  // ------------------------------------------------------------ routing
  function route() {
    const [tab, arg] = (location.hash.slice(1) || "overview").split("/");
    const t = ["overview", "member", "network", "venues", "papers"].includes(tab) ? tab : "overview";
    document.querySelectorAll(".tab").forEach((s) => (s.hidden = s.id !== `tab-${t}`));
    document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === t));
    if (t === "overview" && !rendered.overview) renderOverview();
    if (t === "member") renderMember(arg ? decodeURIComponent(arg) : null);
    if (t === "network") renderNetwork(arg ? decodeURIComponent(arg) : null);
    if (t === "venues" && !rendered.venues) renderVenues();
    if (t === "papers" && !rendered.papers) renderPapers();
    rendered[t] = true;
  }

  // ------------------------------------------------------------ small components
  function kpis(el, items) {
    el.innerHTML = items.map(([v, l, s]) =>
      `<div class="kpi"><div class="v">${v}</div><div class="l">${esc(l)}</div>${s ? `<div class="s">${s}</div>` : ""}</div>`).join("");
  }

  function hbars(el, rows, max = 10) {
    rows = rows.slice(0, max);
    if (!rows.length) { el.innerHTML = `<p class="empty">Nothing to show yet.</p>`; return; }
    const top = Math.max(...rows.map((r) => r.count));
    el.innerHTML = `<div class="hbars">${rows.map((r) => `
      <div class="hbar" title="${esc(r.name)}: ${r.count} paper${r.count === 1 ? "" : "s"}">
        <div class="name">${esc(r.name)} ${r.type ? `<span class="tag">${esc(r.type)}</span>` : ""}</div>
        <div class="n">${fmt(r.count)}</div>
        <div class="track"><span style="width:${(100 * r.count) / top}%"></span></div>
      </div>`).join("")}</div>`;
  }

  // Sortable table. cols: {key,label,num,html(row),val(row)}
  function table(el, cols, rows, opts = {}) {
    let sortKey = opts.sort || cols[0].key, dir = opts.dir || "desc", limit = opts.limit || 0, showAll = false;
    const val = (c, r) => (c.val ? c.val(r) : r[c.key]);
    function draw() {
      const c = cols.find((x) => x.key === sortKey);
      const sorted = rows.slice().sort((a, b) => {
        const x = val(c, a), y = val(c, b);
        const cmp = typeof x === "string" ? x.localeCompare(y) : (x ?? -1) - (y ?? -1);
        return dir === "asc" ? cmp : -cmp;
      });
      const shown = limit && !showAll ? sorted.slice(0, limit) : sorted;
      el.innerHTML = `<thead><tr>${cols.map((c) =>
        `<th data-k="${c.key}" class="${c.num ? "num" : ""}" ${c.key === sortKey ? `data-dir="${dir}"` : ""}>${esc(c.label)}</th>`).join("")}</tr></thead>
        <tbody>${shown.map((r, i) => `<tr data-i="${i}" class="${opts.onClick ? "click" : ""}">${cols.map((c) =>
          `<td class="${c.num ? "num" : ""} ${c.cls || ""}">${c.html ? c.html(r) : esc(r[c.key])}</td>`).join("")}</tr>`).join("") ||
          `<tr><td colspan="${cols.length}" class="empty">No matching rows.</td></tr>`}</tbody>`;
      if (limit && sorted.length > limit) {
        el.insertAdjacentHTML("beforeend", `<tfoot><tr><td colspan="${cols.length}"><a href="#" class="more">${showAll ? "Show fewer" : `Show all ${fmt(sorted.length)}`}</a></td></tr></tfoot>`);
        el.querySelector(".more").onclick = (e) => { e.preventDefault(); showAll = !showAll; draw(); };
      }
      el.querySelectorAll("th").forEach((th) => (th.onclick = () => {
        if (sortKey === th.dataset.k) dir = dir === "asc" ? "desc" : "asc";
        else { sortKey = th.dataset.k; dir = cols.find((c) => c.key === sortKey).num ? "desc" : "asc"; }
        draw();
      }));
      if (opts.onClick) el.querySelectorAll("tbody tr[data-i]").forEach((tr) => (tr.onclick = () => opts.onClick(shown[tr.dataset.i])));
    }
    draw();
    return { update(newRows) { rows = newRows; draw(); } };
  }

  // ------------------------------------------------------------ charts
  function yearLabels(years) { return years.map((y) => (Number(y) === THIS_YEAR ? `${y} (so far)` : String(y))); }

  function chart(id, type, labels, values, opts = {}) {
    if (!window.Chart) return;
    charts[id]?.destroy();
    const accent = css("--accent"), soft = css("--accent-soft"), grid = css("--grid"), muted = css("--muted");
    const ds = type === "bar"
      ? { data: values, backgroundColor: labels.map((l) => (String(l).includes("so far") ? soft : accent)),
          borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: "bottom", maxBarThickness: 32, categoryPercentage: 0.8, barPercentage: 0.9 }
      : { data: values, borderColor: accent, backgroundColor: accent, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25, fill: false };
    charts[id] = new Chart(document.getElementById(id), {
      type, data: { labels, datasets: [{ label: opts.label || "", ...ds }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false },
          tooltip: { displayColors: false, callbacks: { label: (c) => `${fmt(c.parsed.y)} ${opts.unit || ""}`.trim() } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: muted, maxRotation: 0, autoSkip: true }, border: { color: grid } },
          y: { beginAtZero: true, grid: { color: grid }, border: { display: false }, ticks: { color: muted, precision: 0, callback: (v) => fmt(v) } },
        },
      },
    });
  }

  function fillYears(obj, years) { return years.map((y) => obj[String(y)] || 0); }

  // ------------------------------------------------------------ overview
  function renderOverview() {
    const s = D.summary;
    const last = s.cites_by_year[String(LAST_YEAR)] || 0, prev = s.cites_by_year[String(LAST_YEAR - 1)] || 0;
    const growth = prev ? Math.round(((last - prev) / prev) * 100) : null;
    kpis($("#lab-kpis"), [
      [fmt(s.works), "Papers", `${fmt(D.members.length)} members`],
      [fmt(s.citations), "Citations", `<span id="lab-cit-sub">each paper counted once</span>`],
      [fmt(s.h), "Lab h-index", `i10-index ${fmt(s.i10)}`],
      [fmt(last), `Citations in ${LAST_YEAR}`, growth == null ? "" : `<span class="${growth >= 0 ? "pos" : ""}">${growth >= 0 ? "+" : ""}${growth}%</span> vs ${LAST_YEAR - 1}`],
      [fmt(s.external_collaborators), "Outside collaborators", `from ${fmt(Object.keys(s.countries).length)} countries`],
    ]);
    const yrs = s.years || D.years;
    if (s.source === "Google Scholar") {
      $("#lab-cby-note").textContent = "Sum of members' Google Scholar profiles, so a paper shared by two members counts for both.";
      $("#lab-cit-sub").textContent = "Google Scholar, shared papers once";
    }
    chart("c-lab-cby", "bar", yearLabels(yrs), fillYears(s.cites_by_year, yrs), { unit: "citations" });
    chart("c-lab-cum", "line", yearLabels(yrs), fillYears(s.cumulative, yrs), { unit: "citations in total" });
    if (H.length >= 2) {
      $("#history-card").hidden = false;
      chart("c-history", "line", H.map((h) => h.date), H.map((h) => h.lab.citations), { unit: "citations" });
    }
    const cols = [
      { key: "name", label: "Name", html: (m) => `<a href="#member/${m.slug}">${esc(m.name)}</a> ${m.active ? "" : '<span class="tag alum">alumni</span>'}<div class="sub">${esc(m.role || "")}</div>` },
      { key: "works", label: "Papers", num: true, html: (m) => fmt(m.works) },
      { key: "citations", label: "Citations", num: true, html: (m) => fmt(m.citations) },
      { key: "h", label: "h-index", num: true },
      { key: "i10", label: "i10", num: true },
      { key: "cites_last_year", label: `Cites ${LAST_YEAR}`, num: true, html: (m) => fmt(m.cites_last_year) },
      { key: "growth", label: "Growth", num: true, html: (m) => (m.growth == null ? "–" : `<span class="${m.growth >= 0 ? "pos" : ""}">${m.growth >= 0 ? "+" : ""}${m.growth}%</span>`) },
      { key: "next", label: "To next h", num: true, val: (m) => -(m.h_watch.citations_needed || 999),
        html: (m) => m.works ? `<span title="${m.h_watch.papers_needed} paper(s) need ${m.h_watch.citations_needed} more citations to reach h=${m.h_watch.target}">${m.h_watch.citations_needed} cite${m.h_watch.citations_needed === 1 ? "" : "s"}</span>` : "–" },
    ];
    const visible = () => D.members.filter((m) => m.active || $("#show-alumni").checked);
    const t = table($("#members-table"), cols, visible(), { sort: "citations", onClick: (m) => (location.hash = `member/${m.slug}`) });
    $("#show-alumni").onchange = () => t.update(visible());
  }

  // ------------------------------------------------------------ member
  function renderMember(slug) {
    const sel = $("#member-select");
    if (!sel.options.length) {
      const sorted = D.members.slice().sort((a, b) => b.active - a.active || b.citations - a.citations);
      sel.innerHTML = sorted.map((m) => `<option value="${m.slug}">${esc(m.name)}${m.active ? "" : " (alumni)"}</option>`).join("");
      sel.onchange = () => (location.hash = `member/${sel.value}`);
    }
    const m = members[slug] || members[sel.value] || members[sel.options[0].value];
    sel.value = m.slug;
    const links = [];
    if (m.scholar) links.push(`<a href="${esc(m.scholar)}" target="_blank" rel="noopener">Google Scholar ↗</a>`);
    if (m.orcid) links.push(`<a href="https://orcid.org/${esc(m.orcid)}" target="_blank" rel="noopener">ORCID ↗</a>`);
    m.openalex.forEach((id) => links.push(`<a href="https://openalex.org/authors/${esc(id)}" target="_blank" rel="noopener">OpenAlex ↗</a>`));
    $("#member-links").innerHTML = `<span class="muted">${esc(m.role || "")}</span>` + links.join("");

    const oa = m.openalex_counts || {};
    const srcNote = m.source === "Google Scholar" ? `Google Scholar · OpenAlex finds ${fmt(oa.citations)}` : "OpenAlex";
    kpis($("#member-kpis"), [
      [fmt(m.works), "Papers", m.first_year ? `since ${m.first_year}` : ""],
      [fmt(m.citations), "Citations", srcNote],
      [fmt(m.h), "h-index", ""],
      [fmt(m.i10), "i10-index", ""],
      [fmt(m.cites_last_year), `Citations in ${LAST_YEAR}`, m.growth == null ? "" : `<span class="${m.growth >= 0 ? "pos" : ""}">${m.growth >= 0 ? "+" : ""}${m.growth}%</span> vs ${LAST_YEAR - 1}`],
    ]);

    // h-index watch
    const hw = m.h_watch;
    const pace = (p) => (p.eta_months == null ? "no citations recently" : p.eta_months <= 1 ? "likely within a month" : `~${p.eta_months} months at current pace`);
    $("#h-watch").innerHTML = !m.works ? `<h3>Next h-index</h3><p class="empty">No papers found yet.</p>` : `
      <h3>Next h-index: ${hw.h} → ${hw.target}</h3>
      <p class="big">${hw.papers_needed} paper${hw.papers_needed === 1 ? "" : "s"} need${hw.papers_needed === 1 ? "s" : ""} to reach ${hw.target} citations: <b>${hw.citations_needed}</b> more citation${hw.citations_needed === 1 ? "" : "s"} in total.</p>
      <ol>${hw.papers.map((p) => `<li>
        <div><div class="t">${paperLink(p)}</div><div class="meta">${p.year || ""} · ${fmt(p.c)} of ${hw.target} · ${pace(p)}</div>
        <div class="meter"><span style="width:${(100 * p.c) / hw.target}%"></span></div></div>
        <div class="need">+${p.need}</div></li>`).join("")}</ol>`;
    const iw = m.i10_watch;
    $("#i10-watch").innerHTML = `<h3>Close to 10 citations</h3>
      <p class="big">${iw.length ? `${iw.length} paper${iw.length === 1 ? "" : "s"} would raise the i10-index from ${m.i10}.` : "No papers sitting at 7–9 citations right now."}</p>
      <ol>${iw.slice(0, 6).map((p) => `<li>
        <div><div class="t">${paperLink(p)}</div><div class="meta">${p.year || ""} · ${fmt(p.c)} of 10</div>
        <div class="meter"><span style="width:${p.c * 10}%"></span></div></div>
        <div class="need">+${p.need}</div></li>`).join("")}</ol>`;

    const yrs = m.years || D.years;
    chart("c-m-cby", "bar", yearLabels(yrs), fillYears(m.cites_by_year, yrs), { unit: "citations" });
    chart("c-m-cum", "line", yearLabels(yrs), fillYears(m.cumulative, yrs), { unit: "citations in total" });
    const py = Object.keys(m.pubs_by_year).map(Number);
    const pyrs = py.length ? range(Math.min(...py), THIS_YEAR) : [THIS_YEAR];
    chart("c-m-pubs", "bar", yearLabels(pyrs), fillYears(m.pubs_by_year, pyrs), { unit: "papers" });
    hbars($("#m-venues"), m.venues, 8);

    const collab = Object.entries(m.collab_lab);
    $("#m-collab").innerHTML = collab.length
      ? collab.map(([s, n]) => `<a class="chip" href="#member/${s}">${esc(members[s]?.name || s)}<b>${n}</b></a>`).join("") +
        `<span class="muted" style="font-size:13px;align-self:center">+ ${fmt(m.collab_external)} outside co-authors</span>`
      : `<p class="empty">No co-authored papers with other lab members yet. ${fmt(m.collab_external)} outside co-authors.</p>`;

    if (m.scholar_papers) {
      table($("#m-papers"), [
        { key: "title", label: "Title", cls: "title", html: (p) => `${paperLink(p)}<div class="sub">${esc(p.authors || "")}${p.venue ? ` · <i>${esc(p.venue)}</i>` : ""}</div>` },
        { key: "year", label: "Year", num: true },
        { key: "c", label: "Citations", num: true, html: (p) => fmt(p.c) },
      ], m.scholar_papers, { sort: "c", limit: 25 });
    } else {
      const mine = D.works.filter((w) => w.lab.includes(m.slug));
      table($("#m-papers"), paperCols(), mine, { sort: "cited_by_count", limit: 25 });
    }
    $("#m-net-link").href = `#network/${m.slug}`;
  }

  function paperLink(p) {
    const u = p.link || p.doi;
    return u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title);
  }

  function range(a, b) { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; }

  function paperCols() {
    return [
      { key: "title", label: "Title", cls: "title", html: (w) => `${w.doi ? `<a href="${esc(w.doi)}" target="_blank" rel="noopener">${esc(w.title)}</a>` : esc(w.title)}
          <div class="sub">${esc(shortAuthors(w))}${w.venue ? ` · <i>${esc(w.venue)}</i>` : ""}${w.versions > 1 ? ` · ${w.versions} versions merged` : ""}</div>` },
      { key: "year", label: "Year", num: true },
      { key: "cited_by_count", label: "Citations", num: true, html: (w) => fmt(w.cited_by_count) },
      { key: "last", label: `In ${LAST_YEAR}`, num: true, val: (w) => w.cby[String(LAST_YEAR)] || 0, html: (w) => fmt(w.cby[String(LAST_YEAR)] || 0) },
    ];
  }
  function shortAuthors(w) {
    const names = w.authors.map((a) => a.name);
    return names.length > 6 ? `${names.slice(0, 5).join(", ")} … ${names[names.length - 1]} (${names.length} authors)` : names.join(", ");
  }

  // ------------------------------------------------------------ network (one member at a time)
  // The selected person sits in the centre; everyone they have published with sits around them.
  // Circle size = papers with the selected person; line width = papers the two ends wrote together.
  // Play replays it year by year from their first paper.
  let net, netData, netTimer = null, netSlug = null;
  const cumY = (y, upto) => { let t = 0; for (const k in y || {}) if (+k <= upto) t += y[k]; return t; };

  function egoData(m) {
    const MAXA = D.network_max_authors || 25;
    const id2slug = {};
    D.members.forEach((x) => (x.openalex || []).forEach((i) => (id2slug[i] = x.slug)));
    const extInfo = Object.fromEntries(D.network.nodes.filter((n) => !n.lab).map((n) => [n.id, n]));
    const works = D.works.filter((w) => w.lab.includes(m.slug));
    const people = {}, pairs = {}, egoY = {}, instCount = {};
    for (const w of works) {
      const yr = String(w.year || THIS_YEAR);
      egoY[yr] = (egoY[yr] || 0) + 1;
      if (w.authors.length > MAXA) continue;  // consortium papers would connect everyone
      const keys = new Set([m.slug]);
      for (const a of w.authors) {
        const k = id2slug[a.id] || a.id;
        if (!k) continue;
        keys.add(k);
        if (k !== m.slug && !people[k]) {
          const lab = !!members[k];
          people[k] = { id: k, label: lab ? members[k].name : a.name, lab, active: lab ? members[k].active : true,
            inst: lab ? (D.lab.institution || "Lab member") : extInfo[k]?.inst, y: {}, papers: 0, works: [] };
        }
      }
      const insts = new Set([...keys].map((k) => people[k]).filter((p) => p && !p.lab && p.inst).map((p) => p.inst));
      insts.forEach((i) => (instCount[i] = (instCount[i] || 0) + 1));
      const ks = [...keys].sort();
      ks.forEach((k) => { if (k !== m.slug) { const p = people[k]; p.y[yr] = (p.y[yr] || 0) + 1; p.papers++; p.works.push(w); } });
      for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
        const id = `${ks[i]}|${ks[j]}`;
        const e = (pairs[id] ||= { id, from: ks[i], to: ks[j], y: {}, w: 0 });
        e.y[yr] = (e.y[yr] || 0) + 1; e.w++;
      }
    }
    return { m, works, people, pairs, egoY, instCount };
  }

  function renderNetwork(slug) {
    const sel = $("#net-member");
    if (!sel.options.length) {
      const sorted = D.members.slice().sort((a, b) => b.active - a.active || a.name.localeCompare(b.name));
      sel.innerHTML = sorted.map((m) => `<option value="${m.slug}">${esc(m.name)}${m.active ? "" : " (alumni)"}</option>`).join("");
      sel.onchange = () => (location.hash = `network/${sel.value}`);
    }
    const m = members[slug] || members[sel.value] || members[sel.options[0].value];
    sel.value = m.slug;
    if (netSlug === m.slug && net) return;
    netSlug = m.slug;
    if (!window.vis) { $("#network").innerHTML = `<p class="empty" style="padding:16px">Network library failed to load.</p>`; return; }

    const G = egoData(m);
    const P = Object.values(G.people), E = Object.values(G.pairs);
    const egoYears = Object.keys(G.egoY).map(Number).filter((y) => y > 1900);
    const FIRST = egoYears.length ? Math.min(...egoYears) : THIS_YEAR;
    const PMAX = Math.max(1, ...P.map((p) => p.papers)), EMAX = Math.max(1, ...E.map((e) => e.w));
    $("#net-min").value = P.length > 60 ? "2" : "1";  // keep big networks readable by default
    const slider = $("#net-year"), playBtn = $("#net-play");
    slider.min = FIRST; slider.max = THIS_YEAR; slider.value = THIS_YEAR;
    $(".timeline").hidden = FIRST >= THIS_YEAR;
    let year = THIS_YEAR;

    // ---- side tables for this person
    hbars($("#inst-bars"), Object.entries(G.instCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count), 12);
    table($("#ext-table"), [
      { key: "label", label: "Name", html: (p) => `${esc(p.label)} ${p.lab ? '<span class="tag">lab</span>' : ""}<div class="sub">${esc(p.lab ? "" : p.inst || "")}</div>` },
      { key: "papers", label: "Joint papers", num: true },
      { key: "since", label: "Since", num: true, val: (p) => Math.min(...Object.keys(p.y).map(Number)), html: (p) => Math.min(...Object.keys(p.y).map(Number)) },
    ], P, { sort: "papers", limit: 15 });

    function snapshot(upto) {
      const min = Number($("#net-min").value), final = upto >= THIS_YEAR;
      const accent = css("--accent"), alum = css("--alum"), extc = css("--ext"), ego = css("--ego"),
        text = css("--text"), surface = css("--surface"), line = css("--border");
      const egoN = final ? G.works.length : cumY(G.egoY, upto);
      const nodes = [{
        id: m.slug, value: PMAX, label: m.name, x: 0, y: 0, fixed: { x: true, y: true },
        title: `${m.name}\n${egoN} paper${egoN === 1 ? "" : "s"}${final ? "" : ` by ${upto}`}`,
        color: { background: ego, border: surface, highlight: { background: ego, border: text }, hover: { background: ego, border: text } },
        font: { color: text, size: 16, bold: true, strokeWidth: 4, strokeColor: surface }, borderWidth: 3,
      }];
      for (const p of P) {
        const n = final ? p.papers : cumY(p.y, upto);
        if (n < min || n < 1) continue;
        const bg = p.lab ? (p.active ? accent : alum) : extc;
        nodes.push({
          id: p.id, value: n, label: p.lab || n >= Math.max(min, 2) || P.length <= 40 ? p.label : "",
          title: `${p.label}${p.inst && !p.lab ? ` — ${p.inst}` : ""}\n${n} paper${n === 1 ? "" : "s"} with ${m.name}${final ? "" : ` by ${upto}`}`,
          color: { background: bg, border: surface, highlight: { background: bg, border: text }, hover: { background: bg, border: text } },
          font: { color: text, size: p.lab ? 14 : 12, strokeWidth: 3, strokeColor: surface }, borderWidth: 2,
        });
      }
      const ids = new Set(nodes.map((n) => n.id));
      const edges = [];
      for (const e of E) {
        if (!ids.has(e.from) || !ids.has(e.to)) continue;
        const w = final ? e.w : cumY(e.y, upto);
        if (w < 1) continue;
        const touchesEgo = e.from === m.slug || e.to === m.slug;
        edges.push({ id: e.id, from: e.from, to: e.to, value: w,
          title: `${w} paper${w === 1 ? "" : "s"} together${final ? "" : ` by ${upto}`}`,
          color: { color: line, highlight: accent, hover: accent, opacity: touchesEgo ? 1 : 0.55 } });
      }
      return { nodes, edges };
    }

    function apply(upto) {
      year = upto; slider.value = upto;
      const snap = snapshot(upto);
      const have = new Set(netData.nodes.getIds());
      const pos = net.getPositions([...have]);
      for (const n of snap.nodes) {               // newcomers start next to someone already on screen
        if (have.has(n.id) || n.id === m.slug) continue;
        const e = snap.edges.find((e) => (e.from === n.id && pos[e.to]) || (e.to === n.id && pos[e.from]));
        const o = e ? pos[e.from === n.id ? e.to : e.from] : { x: 0, y: 0 };
        n.x = o.x + (Math.random() - 0.5) * 80; n.y = o.y + (Math.random() - 0.5) * 80;
      }
      const keepN = new Set(snap.nodes.map((n) => n.id)), keepE = new Set(snap.edges.map((e) => e.id));
      netData.edges.remove(netData.edges.getIds().filter((id) => !keepE.has(id)));
      netData.nodes.remove(netData.nodes.getIds().filter((id) => !keepN.has(id)));
      netData.nodes.update(snap.nodes);
      netData.edges.update(snap.edges);
      net.startSimulation();
      const final = upto >= THIS_YEAR;
      $("#net-year-big").textContent = final ? "" : upto;
      $("#net-year-label").textContent = `${FIRST}–${final ? THIS_YEAR : upto}`;
      $("#net-stats").textContent = final ? "" : `${snap.nodes.length - 1} co-author${snap.nodes.length === 2 ? "" : "s"}`;
    }

    const stop = (label = "▶ Play") => { clearInterval(netTimer); netTimer = null; playBtn.textContent = label; };
    stop();
    playBtn.onclick = () => {
      if (netTimer) { stop(); return; }
      if (year >= THIS_YEAR) apply(FIRST);
      playBtn.textContent = "❚❚ Pause";
      setTimeout(() => net.fit({ animation: { duration: 600 } }), 300);
      netTimer = setInterval(() => {
        if (year >= THIS_YEAR) { stop("↻ Replay"); net.fit({ animation: { duration: 900 } }); return; }
        apply(year + 1);
        net.fit({ animation: { duration: 1100, easingFunction: "easeInOutQuad" } });
      }, 1400);
    };
    slider.oninput = () => { stop(); apply(Number(slider.value)); };
    $("#net-min").onchange = () => apply(year);

    net?.destroy();
    netData = { nodes: new vis.DataSet(), edges: new vis.DataSet() };
    const init = snapshot(THIS_YEAR);
    netData.nodes.add(init.nodes); netData.edges.add(init.edges);
    net = new vis.Network($("#network"), netData, {
      nodes: { shape: "dot", scaling: { min: 7, max: 38, customScalingFunction: (a, b, t, v) => Math.sqrt(v / PMAX) } },
      edges: { scaling: { min: 1, max: 9, customScalingFunction: (a, b, t, v) => Math.sqrt(v / EMAX) }, smooth: false },
      physics: { solver: "forceAtlas2Based", forceAtlas2Based: { gravitationalConstant: -70, springLength: 110, damping: 0.5 },
        maxVelocity: 25, minVelocity: 0.6, stabilization: { iterations: 300 } },
      interaction: { hover: true, tooltipDelay: 120 },
    });
    apply(THIS_YEAR);
    net.on("click", (p) => showNode(p.nodes[0]));
    showNode(null);

    function showNode(id) {
      const p = G.people[id];
      if (!p) {
        const top = P.slice().sort((a, b) => b.papers - a.papers).slice(0, 10);
        $("#net-info").innerHTML = `<h3>${esc(m.name)}</h3>
          <p class="muted" style="margin:0 0 8px;font-size:13px">${fmt(P.length)} co-author${P.length === 1 ? "" : "s"} across ${fmt(G.works.length)} papers${FIRST < THIS_YEAR ? ` since ${FIRST}` : ""}</p>
          <p style="margin:0 0 8px"><a href="#member/${m.slug}">Open member page →</a></p>
          ${top.length ? `<b style="font-size:13px">Most frequent co-authors</b><ul>${top.map((q) => `<li>${esc(q.label)} — ${q.papers}${q.lab ? "" : `<br><span class="muted">${esc(q.inst || "")}</span>`}</li>`).join("")}</ul>` : ""}
          <p class="muted" style="font-size:12px">Click anyone to see the papers you share.</p>`;
        return;
      }
      const ws = p.works.slice().sort((a, b) => (b.year || 0) - (a.year || 0));
      $("#net-info").innerHTML = `<h3>${esc(p.label)}</h3>
        <p class="muted" style="margin:0 0 8px;font-size:13px">${p.lab ? "Lab member" : esc(p.inst || "Outside collaborator")} · ${p.papers} paper${p.papers === 1 ? "" : "s"} with ${esc(m.name)}</p>
        ${p.lab ? `<p style="margin:0 0 8px"><a href="#network/${p.id}">Centre the network on ${esc(p.label)} →</a></p>` : ""}
        <ul>${ws.slice(0, 12).map((w) => `<li>${paperLink(w)} <span class="muted">(${w.year || "n.d."})</span></li>`).join("")}</ul>
        ${ws.length > 12 ? `<p class="muted" style="font-size:12px">+ ${ws.length - 12} more</p>` : ""}
        <p style="font-size:12px"><a href="#" id="net-back">← Back to ${esc(m.name)}</a></p>`;
      $("#net-back").onclick = (e) => { e.preventDefault(); net.unselectAll(); showNode(null); };
    }
    $("#net-search").value = "";
    $("#net-search").onchange = $("#net-search").onkeydown = (e) => {
      if (e.type === "keydown" && e.key !== "Enter") return;
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      const hit = P.find((n) => n.label.toLowerCase().includes(q));
      if (!hit) return;
      if (!netData.nodes.get(hit.id)) { stop(); $("#net-min").value = "1"; apply(THIS_YEAR); }
      net.selectNodes([hit.id]); net.focus(hit.id, { scale: 1.3, animation: true }); showNode(hit.id);
    };
  }

  // ------------------------------------------------------------ venues
  function renderVenues() {
    const v = {};
    D.works.forEach((w) => {
      if (!w.venue) return;
      const x = (v[w.venue] ||= { name: w.venue, type: w.venue_type, papers: 0, citations: 0, members: new Set(), first: 9999, last: 0 });
      x.papers++; x.citations += w.cited_by_count; w.lab.forEach((s) => x.members.add(s));
      if (w.year) { x.first = Math.min(x.first, w.year); x.last = Math.max(x.last, w.year); }
    });
    const rows = Object.values(v).map((x) => ({ ...x, nmem: x.members.size, avg: x.citations / x.papers }));
    const vt = D.summary.venue_types, total = D.works.length;
    const pct = (k) => (total ? Math.round((100 * (vt[k] || 0)) / total) : 0);
    kpis($("#venue-kpis"), [
      [fmt(rows.length), "Distinct venues", ""],
      [`${pct("journal")}%`, "In journals", `${fmt(vt.journal || 0)} papers`],
      [`${pct("conference")}%`, "At conferences", `${fmt(vt.conference || 0)} papers`],
      [`${pct("repository")}%`, "Preprint only", `${fmt(vt.repository || 0)} papers`],
    ]);
    const sel = $("#venue-type");
    Object.keys(vt).sort().forEach((k) => sel.insertAdjacentHTML("beforeend", `<option value="${esc(k)}">${esc(k)}</option>`));
    const t = table($("#venue-table"), [
      { key: "name", label: "Venue", html: (x) => `${esc(x.name)} <span class="tag">${esc(x.type)}</span>` },
      { key: "papers", label: "Papers", num: true },
      { key: "citations", label: "Citations", num: true, html: (x) => fmt(x.citations) },
      { key: "avg", label: "Cites / paper", num: true, html: (x) => x.avg.toFixed(1) },
      { key: "nmem", label: "Members", num: true },
      { key: "first", label: "Years", num: true, html: (x) => (x.first === 9999 ? "–" : x.first === x.last ? x.first : `${x.first}–${x.last}`) },
    ], rows, { sort: "papers", limit: 30 });
    sel.onchange = () => t.update(rows.filter((x) => !sel.value || x.type === sel.value));
  }

  // ------------------------------------------------------------ papers
  function renderPapers() {
    const ms = $("#p-member"), ys = $("#p-year");
    D.members.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((m) => ms.insertAdjacentHTML("beforeend", `<option value="${m.slug}">${esc(m.name)}</option>`));
    [...new Set(D.works.map((w) => w.year).filter(Boolean))].sort((a, b) => b - a).forEach((y) => ys.insertAdjacentHTML("beforeend", `<option>${y}</option>`));
    const cols = paperCols().concat([{ key: "lab", label: "Lab authors", val: (w) => w.lab.length,
      html: (w) => w.lab.map((s) => `<a class="tag" href="#member/${s}">${esc(members[s]?.name || s)}</a>`).join(" ") }]);
    D.works.forEach((w) => (w._q = `${w.title} ${w.venue || ""} ${w.authors.map((a) => a.name).join(" ")}`.toLowerCase()));
    const filtered = () => {
      const q = $("#p-search").value.trim().toLowerCase(), m = ms.value, y = Number(ys.value);
      const r = D.works.filter((w) => (!q || w._q.includes(q)) && (!m || w.lab.includes(m)) && (!y || w.year === y));
      $("#p-count").textContent = `${fmt(r.length)} paper${r.length === 1 ? "" : "s"}`;
      return r;
    };
    const t = table($("#papers-table"), cols, filtered(), { sort: "cited_by_count", limit: 100 });
    $("#p-search").oninput = ms.onchange = ys.onchange = () => t.update(filtered());
  }
})();
