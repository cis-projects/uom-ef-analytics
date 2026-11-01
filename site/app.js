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
    $("#foot").innerHTML = `Data from <a href="https://openalex.org">OpenAlex</a>, updated ${esc(D.generated_at.slice(0, 10))}. ` +
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
    if (t === "network" && !rendered.network) renderNetwork();
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
      [fmt(s.citations), "Citations", "each paper counted once"],
      [fmt(s.h), "Lab h-index", `i10-index ${fmt(s.i10)}`],
      [fmt(last), `Citations in ${LAST_YEAR}`, growth == null ? "" : `<span class="${growth >= 0 ? "pos" : ""}">${growth >= 0 ? "+" : ""}${growth}%</span> vs ${LAST_YEAR - 1}`],
      [fmt(s.external_collaborators), "Outside collaborators", `from ${fmt(Object.keys(s.countries).length)} countries`],
    ]);
    const yrs = D.years;
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

    kpis($("#member-kpis"), [
      [fmt(m.works), "Papers", m.first_year ? `since ${m.first_year}` : ""],
      [fmt(m.citations), "Citations", ""],
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
      <ol>${hw.papers.map((p) => { const w = byId[p.id]; return `<li>
        <div><div class="t">${esc(w.title)}</div><div class="meta">${w.year || ""} · ${fmt(w.cited_by_count)} of ${hw.target} · ${pace(p)}</div>
        <div class="meter"><span style="width:${(100 * w.cited_by_count) / hw.target}%"></span></div></div>
        <div class="need">+${p.need}</div></li>`; }).join("")}</ol>`;
    const iw = m.i10_watch;
    $("#i10-watch").innerHTML = `<h3>Close to 10 citations</h3>
      <p class="big">${iw.length ? `${iw.length} paper${iw.length === 1 ? "" : "s"} would raise the i10-index from ${m.i10}.` : "No papers sitting at 7–9 citations right now."}</p>
      <ol>${iw.slice(0, 6).map((p) => { const w = byId[p.id]; return `<li>
        <div><div class="t">${esc(w.title)}</div><div class="meta">${w.year || ""} · ${fmt(w.cited_by_count)} of 10</div>
        <div class="meter"><span style="width:${w.cited_by_count * 10}%"></span></div></div>
        <div class="need">+${p.need}</div></li>`; }).join("")}</ol>`;

    const yrs = D.years;
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

    const mine = D.works.filter((w) => w.lab.includes(m.slug));
    table($("#m-papers"), paperCols(), mine, { sort: "cited_by_count", limit: 25 });
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

  // ------------------------------------------------------------ network
  // The graph can be replayed year by year: people appear when they first publish with the lab,
  // circles grow with papers, and links thicken with each new joint paper.
  let net, netData;
  function renderNetwork() {
    const s = D.summary;
    hbars($("#inst-bars"), s.institutions, 12);
    const N = D.network.nodes, E = D.network.edges;
    const labNodes = new Set(N.filter((n) => n.lab).map((n) => n.id));
    const nodeById = Object.fromEntries(N.map((n) => [n.id, n]));
    const labLinks = {};
    E.forEach((e) => {
      if (labNodes.has(e.from) && !labNodes.has(e.to)) (labLinks[e.to] ||= new Set()).add(e.from);
      if (labNodes.has(e.to) && !labNodes.has(e.from)) (labLinks[e.from] ||= new Set()).add(e.to);
    });
    const ext = N.filter((n) => !n.lab).map((n) => ({ ...n, nlab: labLinks[n.id]?.size || 0 }));
    table($("#ext-table"), [
      { key: "label", label: "Name", html: (n) => `${esc(n.label)}<div class="sub">${esc(n.inst || "")}</div>` },
      { key: "papers", label: "Joint papers", num: true },
      { key: "nlab", label: "Lab members", num: true },
    ], ext, { sort: "papers", limit: 12 });

    if (!window.vis) { $("#network").innerHTML = `<p class="empty" style="padding:16px">Network library failed to load.</p>`; return; }

    // ---- time axis
    const yearsSeen = N.flatMap((n) => Object.keys(n.y || {}).map(Number)).filter((y) => y > 1900);
    const FIRST = yearsSeen.length ? Math.min(...yearsSeen) : THIS_YEAR;
    const slider = $("#net-year"), playBtn = $("#net-play");
    slider.min = FIRST; slider.max = THIS_YEAR; slider.value = THIS_YEAR;
    if (FIRST === THIS_YEAR) $(".timeline").hidden = true;
    let year = THIS_YEAR, timer = null;
    const cum = (y, upto) => { let t = 0; for (const k in y || {}) if (+k <= upto) t += y[k]; return t; };
    // fixed scale across all years, so circles and lines visibly grow
    const GMAX = Math.max(1, ...N.map((n) => n.papers)), EMAX = Math.max(1, ...E.map((e) => e.w));

    function snapshot(upto) {
      const min = Number($("#net-min").value), final = upto >= THIS_YEAR;
      const accent = css("--accent"), alum = css("--alum"), extc = css("--ext"), text = css("--text"), surface = css("--surface"), line = css("--border");
      const nodes = [];
      for (const n of N) {
        const p = final ? n.papers : cum(n.y, upto);
        if (n.lab ? p < 1 && !final : p < min) continue;
        nodes.push({
          id: n.id, value: Math.max(p, 1),
          label: n.lab || p >= Math.max(min, 5) ? n.label : "",
          title: `${n.label}${n.inst ? ` — ${n.inst}` : ""}\n${p} paper${p === 1 ? "" : "s"}${n.lab ? "" : " with the lab"}${final ? "" : ` by ${upto}`}`,
          color: { background: n.lab ? (n.active ? accent : alum) : extc, border: surface, highlight: { background: n.lab ? accent : extc, border: text }, hover: { background: n.lab ? accent : extc, border: text } },
          font: { color: text, size: n.lab ? 14 : 11, strokeWidth: 3, strokeColor: surface }, borderWidth: 2,
        });
      }
      const ids = new Set(nodes.map((n) => n.id));
      const edges = [];
      for (const e of E) {
        if (!ids.has(e.from) || !ids.has(e.to)) continue;
        const w = final ? e.w : cum(e.y, upto);
        if (w < 1) continue;
        edges.push({ id: `${e.from}|${e.to}`, from: e.from, to: e.to, value: w,
          title: `${w} joint paper${w === 1 ? "" : "s"}${final ? "" : ` by ${upto}`}`, color: { color: line, highlight: accent, hover: accent, opacity: 0.9 } });
      }
      return { nodes, edges };
    }

    function apply(upto) {
      year = upto; slider.value = upto;
      const snap = snapshot(upto);
      const have = new Set(netData.nodes.getIds());
      const pos = net.getPositions([...have]);
      for (const n of snap.nodes) {               // newcomers start next to someone already on screen
        if (have.has(n.id)) continue;
        const e = snap.edges.find((e) => (e.from === n.id && pos[e.to]) || (e.to === n.id && pos[e.from]));
        if (e) { const o = pos[e.from === n.id ? e.to : e.from]; n.x = o.x + (Math.random() - 0.5) * 60; n.y = o.y + (Math.random() - 0.5) * 60; }
      }
      const keepN = new Set(snap.nodes.map((n) => n.id)), keepE = new Set(snap.edges.map((e) => e.id));
      netData.edges.remove(netData.edges.getIds().filter((id) => !keepE.has(id)));
      netData.nodes.remove(netData.nodes.getIds().filter((id) => !keepN.has(id)));
      netData.nodes.update(snap.nodes);
      netData.edges.update(snap.edges);
      net.startSimulation();
      const people = snap.nodes.length, links = snap.edges.length;
      $("#net-year-big").textContent = upto >= THIS_YEAR ? "" : upto;
      $("#net-year-label").textContent = upto >= THIS_YEAR ? `${FIRST}–${THIS_YEAR}` : `${FIRST}–${upto}`;
      $("#net-stats").textContent = upto >= THIS_YEAR ? "" : `${people} people · ${links} links`;
    }

    function stop(label = "▶ Play") { clearInterval(timer); timer = null; playBtn.textContent = label; }
    playBtn.onclick = () => {
      if (timer) { stop(); return; }
      if (year >= THIS_YEAR) apply(FIRST);
      playBtn.textContent = "❚❚ Pause";
      setTimeout(() => net.fit({ animation: { duration: 600 } }), 300);
      timer = setInterval(() => {
        if (year >= THIS_YEAR) { stop("↻ Replay"); net.fit({ animation: { duration: 900 } }); return; }
        apply(year + 1);
        net.fit({ animation: { duration: 1100, easingFunction: "easeInOutQuad" } });
      }, 1400);
    };
    slider.oninput = () => { stop(); apply(Number(slider.value)); };
    $("#net-min").onchange = () => apply(year);

    netData = { nodes: new vis.DataSet(), edges: new vis.DataSet() };
    const init = snapshot(THIS_YEAR);
    netData.nodes.add(init.nodes); netData.edges.add(init.edges);
    net = new vis.Network($("#network"), netData, {
      nodes: { shape: "dot", scaling: { min: 6, max: 36, customScalingFunction: (a, b, t, v) => Math.sqrt(v / GMAX) } },
      edges: { scaling: { min: 1, max: 8, customScalingFunction: (a, b, t, v) => Math.sqrt(v / EMAX) }, smooth: false },
      physics: { solver: "forceAtlas2Based", forceAtlas2Based: { gravitationalConstant: -60, springLength: 90, damping: 0.5 },
        maxVelocity: 25, minVelocity: 0.6, stabilization: { iterations: 300 } },
      interaction: { hover: true, tooltipDelay: 120 },
    });
    apply(THIS_YEAR);
    net.on("click", (p) => showNode(p.nodes[0]));

    function showNode(id) {
      const n = nodeById[id];
      if (!n) { $("#net-info").innerHTML = `<p class="muted">Click a person to see their collaborations.</p>`; return; }
      const links = E.filter((e) => e.from === id || e.to === id)
        .map((e) => ({ other: nodeById[e.from === id ? e.to : e.from], w: e.w })).sort((a, b) => b.w - a.w);
      const labL = links.filter((l) => l.other.lab), extL = links.filter((l) => !l.other.lab);
      const since = Math.min(...Object.keys(n.y || {}).map(Number));
      $("#net-info").innerHTML = `<h3>${esc(n.label)}</h3>
        <p class="muted" style="margin:0 0 8px;font-size:13px">${n.lab ? esc(n.role || "Lab member") + (n.active ? "" : " · alumni") : esc(n.inst || "Outside collaborator")} · ${n.papers} paper${n.papers === 1 ? "" : "s"}${n.lab ? "" : " with the lab"}${isFinite(since) ? ` · since ${since}` : ""}</p>
        ${n.lab ? `<p style="margin:0 0 8px"><a href="#member/${n.id}">Open member page →</a></p>` : ""}
        ${labL.length ? `<b style="font-size:13px">With lab members</b><ul>${labL.map((l) => `<li>${esc(l.other.label)} — ${l.w}</li>`).join("")}</ul>` : ""}
        ${n.lab && extL.length ? `<b style="font-size:13px">Top outside co-authors</b><ul>${extL.slice(0, 8).map((l) => `<li>${esc(l.other.label)} — ${l.w}<br><span class="muted">${esc(l.other.inst || "")}</span></li>`).join("")}</ul>` : ""}`;
    }
    $("#net-search").onchange = $("#net-search").onkeydown = (e) => {
      if (e.type === "keydown" && e.key !== "Enter") return;
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      const hit = N.find((n) => n.label.toLowerCase().includes(q));
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
